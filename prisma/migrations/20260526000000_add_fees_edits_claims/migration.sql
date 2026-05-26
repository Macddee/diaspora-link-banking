-- AlterTable: User
ALTER TABLE "User" ADD COLUMN "pendingClaim" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Account
ALTER TABLE "Account" ADD COLUMN "heldBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable: Transaction
ALTER TABLE "Transaction" ADD COLUMN "fee" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- CreateTable: TransactionEditRequest
CREATE TABLE "TransactionEditRequest" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "newAmount" DOUBLE PRECISION NOT NULL,
    "newReceiverEmail" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "TransactionEditRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionEditRequest" ADD CONSTRAINT "TransactionEditRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
