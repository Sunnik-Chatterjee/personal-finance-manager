export function formatINR(amount: number, options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }): string {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });

  return `₹${formatted}`;
}