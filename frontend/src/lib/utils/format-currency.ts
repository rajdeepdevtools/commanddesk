/**
 * Formats a numeric financial value to Indian Rupee (INR) currency string.
 * Example: 1000 -> ₹1,000.00, 100000 -> ₹1,00,000.00
 */
export function formatINR(
  amount: number | null | undefined,
  options?: { showCents?: boolean; compact?: boolean }
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0.00";
  }

  const numericAmount = Number(amount);
  const showFraction = options?.showCents !== false;

  if (options?.compact && Math.abs(numericAmount) >= 100000) {
    if (Math.abs(numericAmount) >= 10000000) {
      return `₹${(numericAmount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(numericAmount) >= 100000) {
      return `₹${(numericAmount / 100000).toFixed(2)} L`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showFraction ? 2 : 0,
    maximumFractionDigits: showFraction ? 2 : 0,
  }).format(numericAmount);
}
