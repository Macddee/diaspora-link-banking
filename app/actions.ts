'use server';

import db from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

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

    // Bootstrap Logic: First user ever is Admin
    const userCount = await db.user.count();
    const role = userCount === 0 ? 'admin' : 'user';

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

  const senderAccount = sender.accounts[0];
  if (!senderAccount || senderAccount.balance < amount) {
    return { success: false, message: 'Insufficient funds.' };
  }

  const receiver = await db.user.findUnique({
    where: { email: receiverEmail },
    include: { accounts: true },
  });

  if (!receiver) return { success: false, message: 'Recipient not found in our system.' };
  if (receiver.id === sender.id) return { success: false, message: 'Internal transfers to self are not allowed via this form.' };

  const receiverAccount = receiver.accounts[0];
  if (!receiverAccount) return { success: false, message: 'Recipient has no active wallet.' };

  try {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Deduct from sender, track monthlyOut
      await tx.account.update({
        where: { id: senderAccount.id },
        data: { 
          balance: { decrement: amount },
          monthlyOut: { increment: amount },
        },
      });

      // Credit receiver, track monthlyIn
      await tx.account.update({
        where: { id: receiverAccount.id },
        data: { 
          balance: { increment: amount },
          monthlyIn: { increment: amount },
        },
      });

      await tx.transaction.create({
        data: {
          amount,
          senderId: sender.id,
          receiverId: receiver.id,
          status: 'COMPLETED',
        },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/transfers');
    revalidatePath('/history');
    return { success: true, message: 'Transfer successful' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Transaction failed at clearing house.' };
  }
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
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
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