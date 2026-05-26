'use server';

import db from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { calcTransferFee } from '@/lib/fees';

// Derive transaction client type from the generated Prisma client without importing Prisma namespace
type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/**
 * Syncs Clerk User with Database.
 * This is called on every protected layout load to ensure the user exists.
 */
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Check if user already exists
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { accounts: true },
  });

  // 2. If not, create the user record (Registration Sync)
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Valued Client';

    // 2a. Check if a ghost "pending claim" account already exists for this email
    //     (created when another user transferred funds to them before signup).
    const ghost = email
      ? await db.user.findUnique({ where: { email }, include: { accounts: true } })
      : null;

    if (ghost && ghost.pendingClaim) {
      // Take over the ghost: link clerkId, unfreeze, release any held balance.
      const ghostAccount = ghost.accounts[0];
      user = await db.user.update({
        where: { id: ghost.id },
        data: {
          clerkId: userId,
          name,
          pendingClaim: false,
          isFrozen: false,
          kycStatus: 'VERIFIED',
          ...(ghostAccount
            ? {
                accounts: {
                  update: {
                    where: { id: ghostAccount.id },
                    data: {
                      // Release held funds into spendable balance.
                      balance: { increment: ghostAccount.heldBalance },
                      heldBalance: 0,
                      monthlyIn: { increment: ghostAccount.heldBalance },
                    },
                  },
                },
              }
            : {
                accounts: { create: { balance: 0 } },
              }),
        },
        include: { accounts: true },
      });
      console.log(`[Sync] Claimed pending account for ${email}.`);
      return user;
    }

    // Bootstrap Logic: First *real* user ever is Admin (ghosts don't count)
    const realUserCount = await db.user.count({ where: { pendingClaim: false } });
    const role = realUserCount === 0 ? 'admin' : 'user';

    user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: email,
        name: name,
        role: role,
        kycStatus: 'VERIFIED', // Auto-verify for simulation purposes
        accounts: {
          create: {
            balance: 1000.00, // Starting bonus for testing the simulation
          },
        },
      },
      include: { accounts: true },
    });

    console.log(`[Sync] Created new ${role}: ${email} with $1000 balance.`);
  }

  return user;
}

// --- Banking Logic ---

export async function transferFunds(receiverEmail: string, amount: number) {
  const sender = await getDbUser();
  if (!sender) return { success: false, message: 'Unauthorized' };

  if (sender.isFrozen) {
    return { success: false, message: 'Account is frozen. Please contact support.' };
  }

  if (!receiverEmail || amount <= 0) {
    return { success: false, message: 'Invalid recipient or amount.' };
  }

  const normalizedEmail = receiverEmail.trim().toLowerCase();
  if (normalizedEmail === sender.email?.toLowerCase()) {
    return { success: false, message: 'You cannot transfer funds to yourself.' };
  }

  const fee = calcTransferFee(amount);
  const totalDebit = amount + fee;

  const senderAccount = sender.accounts[0];
  if (!senderAccount || senderAccount.balance < totalDebit) {
    return {
      success: false,
      message: `Insufficient funds. You need $${totalDebit.toFixed(2)} (amount + 2.5% fee).`,
    };
  }

  let receiver = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: { accounts: true },
  });

  // If receiver is not registered, create a "pending claim" ghost user that
  // holds the funds until they sign up with that email.
  let pendingClaim = false;
  if (!receiver) {
    pendingClaim = true;
    receiver = await db.user.create({
      data: {
        // Sentinel clerkId until they actually sign up; unique per email.
        clerkId: `pending:${normalizedEmail}`,
        email: normalizedEmail,
        name: null,
        role: 'user',
        isFrozen: true,
        kycStatus: 'PENDING',
        pendingClaim: true,
        accounts: { create: { balance: 0 } },
      },
      include: { accounts: true },
    });
  } else if (receiver.pendingClaim) {
    pendingClaim = true;
  }

  if (receiver.id === sender.id) {
    return { success: false, message: 'Internal transfers to self are not allowed via this form.' };
  }

  const receiverAccount = receiver.accounts[0];
  if (!receiverAccount) return { success: false, message: 'Recipient has no active wallet.' };

  try {
    await db.$transaction(async (tx: TxClient) => {
      // Deduct amount + fee from sender, track monthlyOut on amount
      await tx.account.update({
        where: { id: senderAccount.id },
        data: {
          balance: { decrement: totalDebit },
          monthlyOut: { increment: amount },
        },
      });

      // For pending claims, park the funds in heldBalance (cannot be cashed out
      // until the recipient registers). For real users, credit balance directly.
      if (pendingClaim) {
        await tx.account.update({
          where: { id: receiverAccount.id },
          data: {
            heldBalance: { increment: amount },
          },
        });
      } else {
        await tx.account.update({
          where: { id: receiverAccount.id },
          data: {
            balance: { increment: amount },
            monthlyIn: { increment: amount },
          },
        });
      }

      await tx.transaction.create({
        data: {
          amount,
          fee,
          senderId: sender.id,
          receiverId: receiver!.id,
          status: pendingClaim ? 'PENDING_CLAIM' : 'COMPLETED',
        },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/transfers');
    revalidatePath('/history');
    return {
      success: true,
      message: pendingClaim
        ? `Transfer placed on hold. ${normalizedEmail} is not yet registered \u2014 they must sign up with this email to collect the funds.`
        : 'Transfer successful',
      pendingClaim,
      fee,
      total: totalDebit,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Transaction failed at clearing house.' };
  }
}

// --- Transaction Edit / Hold Logic ---

/**
 * Sender-initiated edit request for a transaction they previously sent.
 * Funds at the receiver are moved from spendable balance into heldBalance
 * so they cannot be cashed out while the edit awaits admin approval.
 */
export async function requestTransactionEdit(
  transactionId: string,
  newAmount: number,
  newReceiverEmail: string,
  reason?: string,
) {
  const sender = await getDbUser();
  if (!sender) return { success: false, message: 'Unauthorized' };

  if (!newReceiverEmail || newAmount <= 0) {
    return { success: false, message: 'Invalid amount or recipient.' };
  }

  const tx = await db.transaction.findUnique({ where: { id: transactionId } });
  if (!tx) return { success: false, message: 'Transaction not found.' };
  if (tx.senderId !== sender.id) return { success: false, message: 'You can only edit your own transactions.' };
  if (tx.status !== 'COMPLETED' && tx.status !== 'PENDING_CLAIM') {
    return { success: false, message: `Transaction with status ${tx.status} cannot be edited.` };
  }

  // Reject duplicate open requests
  const existing = await db.transactionEditRequest.findFirst({
    where: { transactionId, status: 'PENDING' },
  });
  if (existing) return { success: false, message: 'An edit request is already pending for this transaction.' };

  const receiverAccount = await db.account.findFirst({ where: { userId: tx.receiverId } });
  if (!receiverAccount) return { success: false, message: 'Receiver wallet not found.' };

  try {
    await db.$transaction(async (txc: TxClient) => {
      if (tx.status === 'PENDING_CLAIM') {
        // Funds are already in heldBalance; nothing extra to move.
      } else {
        // Move the original amount from spendable balance into heldBalance.
        // If the receiver has already spent some of it, we can only hold what's available.
        const available = Math.min(receiverAccount.balance, tx.amount);
        if (available > 0) {
          await txc.account.update({
            where: { id: receiverAccount.id },
            data: {
              balance: { decrement: available },
              heldBalance: { increment: available },
            },
          });
        }
      }

      await txc.transaction.update({
        where: { id: transactionId },
        data: { status: 'PENDING_EDIT' },
      });

      await txc.transactionEditRequest.create({
        data: {
          transactionId,
          newAmount,
          newReceiverEmail: newReceiverEmail.trim().toLowerCase(),
          reason: reason || null,
          status: 'PENDING',
        },
      });
    });

    revalidatePath('/history');
    revalidatePath('/admin/transactions');
    return { success: true, message: 'Edit request submitted. Funds are on hold pending admin approval.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Could not submit edit request.' };
  }
}

export async function getPendingEditRequests() {
  const admin = await getDbUser();
  if (admin?.role !== 'admin') return [];
  const requests = await db.transactionEditRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      transaction: {
        include: { sender: true, receiver: true },
      },
    },
  });
  return requests.map((r) => ({
    id: r.id,
    transactionId: r.transactionId,
    newAmount: r.newAmount,
    newReceiverEmail: r.newReceiverEmail,
    reason: r.reason,
    status: r.status,
    createdAt: r.createdAt,
    originalAmount: r.transaction.amount,
    originalFee: r.transaction.fee,
    originalSenderEmail: r.transaction.sender.email,
    originalReceiverEmail: r.transaction.receiver.email,
  }));
}

export async function approveTransactionEdit(requestId: string) {
  const admin = await getDbUser();
  if (admin?.role !== 'admin') return { success: false, message: 'Unauthorized' };

  const request = await db.transactionEditRequest.findUnique({
    where: { id: requestId },
    include: { transaction: true },
  });
  if (!request) return { success: false, message: 'Edit request not found.' };
  if (request.status !== 'PENDING') return { success: false, message: 'Already resolved.' };

  const original = request.transaction;
  const oldReceiverAccount = await db.account.findFirst({ where: { userId: original.receiverId } });
  const senderAccount = await db.account.findFirst({ where: { userId: original.senderId } });
  if (!oldReceiverAccount || !senderAccount) {
    return { success: false, message: 'Account(s) not found.' };
  }

  // Resolve / create the new receiver (may need ghost user)
  let newReceiver = await db.user.findUnique({
    where: { email: request.newReceiverEmail },
    include: { accounts: true },
  });
  let newPendingClaim = false;
  if (!newReceiver) {
    newPendingClaim = true;
    newReceiver = await db.user.create({
      data: {
        clerkId: `pending:${request.newReceiverEmail}`,
        email: request.newReceiverEmail,
        role: 'user',
        isFrozen: true,
        kycStatus: 'PENDING',
        pendingClaim: true,
        accounts: { create: { balance: 0 } },
      },
      include: { accounts: true },
    });
  } else if (newReceiver.pendingClaim) {
    newPendingClaim = true;
  }
  const newReceiverAccount = newReceiver.accounts[0];
  if (!newReceiverAccount) return { success: false, message: 'New receiver wallet not found.' };

  const newFee = calcTransferFee(request.newAmount);
  const oldTotal = original.amount + original.fee;
  const newTotal = request.newAmount + newFee;
  const senderDelta = newTotal - oldTotal; // positive: charge sender more, negative: refund

  try {
    await db.$transaction(async (txc: TxClient) => {
      // 1. Refund the held amount from old receiver
      const held = Math.min(oldReceiverAccount.heldBalance, original.amount);
      if (held > 0) {
        await txc.account.update({
          where: { id: oldReceiverAccount.id },
          data: { heldBalance: { decrement: held } },
        });
      }

      // 2. Adjust sender (refund or charge difference) and update monthlyOut
      if (senderDelta > 0) {
        if (senderAccount.balance < senderDelta) {
          throw new Error('Sender has insufficient funds for the increased amount.');
        }
        await txc.account.update({
          where: { id: senderAccount.id },
          data: {
            balance: { decrement: senderDelta },
            monthlyOut: { increment: request.newAmount - original.amount },
          },
        });
      } else if (senderDelta < 0) {
        await txc.account.update({
          where: { id: senderAccount.id },
          data: {
            balance: { increment: -senderDelta },
            monthlyOut: { decrement: original.amount - request.newAmount },
          },
        });
      }

      // 3. Credit new receiver (held for pending claims, spendable otherwise)
      if (newPendingClaim) {
        await txc.account.update({
          where: { id: newReceiverAccount.id },
          data: { heldBalance: { increment: request.newAmount } },
        });
      } else {
        await txc.account.update({
          where: { id: newReceiverAccount.id },
          data: {
            balance: { increment: request.newAmount },
            monthlyIn: { increment: request.newAmount },
          },
        });
      }

      // 4. Mark original as edited and write a new transaction record
      await txc.transaction.update({
        where: { id: original.id },
        data: { status: 'EDITED' },
      });
      await txc.transaction.create({
        data: {
          amount: request.newAmount,
          fee: newFee,
          senderId: original.senderId,
          receiverId: newReceiver!.id,
          status: newPendingClaim ? 'PENDING_CLAIM' : 'COMPLETED',
        },
      });

      // 5. Close out the edit request
      await txc.transactionEditRequest.update({
        where: { id: request.id },
        data: { status: 'APPROVED', resolvedAt: new Date() },
      });
    });

    revalidatePath('/admin/transactions');
    revalidatePath('/history');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'Approval failed';
    return { success: false, message };
  }
}

export async function rejectTransactionEdit(requestId: string) {
  const admin = await getDbUser();
  if (admin?.role !== 'admin') return { success: false, message: 'Unauthorized' };

  const request = await db.transactionEditRequest.findUnique({
    where: { id: requestId },
    include: { transaction: true },
  });
  if (!request) return { success: false, message: 'Edit request not found.' };
  if (request.status !== 'PENDING') return { success: false, message: 'Already resolved.' };

  const original = request.transaction;
  const receiverAccount = await db.account.findFirst({ where: { userId: original.receiverId } });
  if (!receiverAccount) return { success: false, message: 'Receiver wallet not found.' };

  const wasPendingClaim = original.status === 'PENDING_EDIT' && receiverAccount.heldBalance >= original.amount
    ? false
    : false; // not used; we just restore based on original.status's predecessor

  // Detect whether the original was a PENDING_CLAIM (ghost recipient) before going PENDING_EDIT.
  const receiverUser = await db.user.findUnique({ where: { id: original.receiverId } });
  const restoreAsHeld = !!receiverUser?.pendingClaim;

  try {
    await db.$transaction(async (txc: TxClient) => {
      const held = Math.min(receiverAccount.heldBalance, original.amount);
      if (restoreAsHeld) {
        // Keep funds in heldBalance, just restore transaction status
        // (held already includes them; nothing to move).
      } else if (held > 0) {
        // Release back to spendable balance for normal user
        await txc.account.update({
          where: { id: receiverAccount.id },
          data: {
            heldBalance: { decrement: held },
            balance: { increment: held },
          },
        });
      }

      await txc.transaction.update({
        where: { id: original.id },
        data: { status: restoreAsHeld ? 'PENDING_CLAIM' : 'COMPLETED' },
      });

      await txc.transactionEditRequest.update({
        where: { id: request.id },
        data: { status: 'REJECTED', resolvedAt: new Date() },
      });
    });

    revalidatePath('/admin/transactions');
    revalidatePath('/history');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Rejection failed' };
  }
  // Silence unused-var lint for documentation variable
  void wasPendingClaim;
}

// --- Profile & Support Logic ---

export async function updateUserProfile(name: string) {
    const user = await getDbUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { name },
        include: { accounts: true }
    });
    revalidatePath('/profile');
    return { success: true, user: updatedUser };
}

export async function submitSupportTicket(subject: string, message: string) {
    const user = await getDbUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const ticket = await db.supportTicket.create({
        data: {
            userId: user.id,
            subject,
            message,
            status: 'OPEN'
        }
    });
    revalidatePath('/support');
    return { success: true, ticket };
}

export async function getUserTickets(userId?: string) {
    const currentUser = await getDbUser();
    if (!currentUser) return [];

    if (userId && userId !== currentUser.id) {
        if (currentUser.role !== 'admin') return [];
        return db.supportTicket.findMany({ 
            where: { userId }, 
            orderBy: { createdAt: 'desc' } 
        });
    }

    return db.supportTicket.findMany({
        where: { userId: currentUser.id },
        orderBy: { createdAt: 'desc' }
    });
}

// --- Admin Logic ---

export async function toggleFreezeUser(userId: string) {
  const admin = await getDbUser();
  if (admin?.role !== 'admin') throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (user) {
    await db.user.update({
      where: { id: userId },
      data: { isFrozen: !user.isFrozen },
    });
    revalidatePath('/admin');
  }
}

export async function verifyUserKyc(userId: string) {
  const admin = await getDbUser();
  if (admin?.role !== 'admin') throw new Error("Unauthorized");

  await db.user.update({
    where: { id: userId },
    data: { kycStatus: 'VERIFIED' },
  });
  revalidatePath('/admin');
}

export async function resolveTicket(ticketId: string) {
  const admin = await getDbUser();
  if (admin?.role !== 'admin') throw new Error("Unauthorized");

  await db.supportTicket.update({
    where: { id: ticketId },
    data: { status: 'RESOLVED' },
  });
  revalidatePath('/admin');
  revalidatePath('/support');
}

export async function getAllUsers() {
    const admin = await getDbUser();
    if (admin?.role !== 'admin') return [];
    return db.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getSystemStats() {
    const admin = await getDbUser();
    if (admin?.role !== 'admin') return { totalUsers: 0, totalMoney: 0, openTickets: 0 };
    
    const totalUsers = await db.user.count();
    const accounts = await db.account.aggregate({ _sum: { balance: true }});
    const openTickets = await db.supportTicket.count({ where: { status: 'OPEN' }});
    
    return {
        totalUsers,
        totalMoney: accounts._sum.balance || 0,
        openTickets
    };
}

export async function getAllTickets() {
    const admin = await getDbUser();
    if (admin?.role !== 'admin') return [];
    const tickets = await db.supportTicket.findMany({ 
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });
    
    return tickets.map(t => ({
        ...t,
        userEmail: t.user?.email
    }));
}

export async function getAllTransactions() {
    const admin = await getDbUser();
    if (admin?.role !== 'admin') return [];
    const txs = await db.transaction.findMany({ 
        orderBy: { createdAt: 'desc' },
        include: { sender: true, receiver: true }
    });
    
    return txs.map(t => ({
        ...t,
        senderEmail: t.sender.email,
        receiverEmail: t.receiver.email,
        timestamp: t.createdAt
    }));
}

// --- Reversal Logic ---
export async function reverseTransaction(transactionId: string) {
  const admin = await getDbUser();
  if (admin?.role !== 'admin') throw new Error('Unauthorized');

  const original = await db.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!original) throw new Error('Transaction not found');
  if (original.status === 'REVERSED') return { success: false, message: 'Already reversed' };

  const amount = original.amount;
  const senderId = original.senderId; // original sender
  const receiverId = original.receiverId; // original receiver

  const [senderAccount, receiverAccount] = await Promise.all([
    db.account.findFirst({ where: { userId: senderId } }),
    db.account.findFirst({ where: { userId: receiverId } }),
  ]);
  if (!senderAccount || !receiverAccount) return { success: false, message: 'Account not found' };

  try {
    await db.$transaction(async (tx: TxClient) => {
      // Move funds back: decrement receiver, increment sender
      await tx.account.update({
        where: { id: receiverAccount.id },
        data: { balance: { decrement: amount } },
      });
      await tx.account.update({
        where: { id: senderAccount.id },
        data: { balance: { increment: amount } },
      });

      // Mark original as reversed
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'REVERSED' },
      });

      // Create reversal record (opposite direction)
      await tx.transaction.create({
        data: {
          amount,
          senderId: receiverId,
          receiverId: senderId,
          status: 'COMPLETED',
        },
      });
    });

    revalidatePath('/admin/transactions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Reversal failed' };
  }
}