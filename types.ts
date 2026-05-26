// Shared lightweight types used by UI components
export type User = {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  role: string;
  isFrozen: boolean;
  kycStatus: string;
  accounts?: Array<{
    id: string;
    balance: number;
  }>; // optional account summary when included
  createdAt?: Date;
};

export type SupportTicket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  userEmail?: string | null;
};

export type Transaction = {
  id: string;
  amount: number;
  fee?: number;
  senderId: string;
  receiverId: string;
  status: string;
  senderEmail?: string | null;
  receiverEmail?: string | null;
  createdAt?: Date;
  timestamp: Date;
};
