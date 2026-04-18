export function calculateDogrunFee(totalMinutes: number, dogCount: number): number {
  const unitMinutes = 30;
  const unitPrice = 500;

  const units = Math.max(1, Math.ceil(totalMinutes / unitMinutes));
  return units * unitPrice * dogCount;
}