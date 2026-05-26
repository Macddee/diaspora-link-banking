export const TRANSFER_FEE_RATE = 0.025;

export function calcTransferFee(amount: number) {
  return Math.round(amount * TRANSFER_FEE_RATE * 100) / 100;
}