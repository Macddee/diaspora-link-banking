
import { getDbUser } from '@/app/actions';
import db from '@/lib/prisma';
import { TransactionHistory } from '@/components/TransactionHistory';

export default async function HistoryPage() {
  const user = await getDbUser();
  if (!user) return null;

  const transactions = await db.transaction.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }]
    },
    orderBy: { createdAt: 'desc' },
    include: { sender: true, receiver: true }
  });

  // Map to the Interface expected by component (flattening emails)
  const formattedTransactions = transactions.map((tx: typeof transactions[0]) => ({
    ...tx,
    senderEmail: tx.sender.email,
    receiverEmail: tx.receiver.email,
    timestamp: tx.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Transaction History</h2>
      </div>
      <TransactionHistory transactions={formattedTransactions} currentUserId={user.id} />
    </div>
  );
}
