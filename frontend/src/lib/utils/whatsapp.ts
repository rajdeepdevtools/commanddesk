/**
 * WhatsApp share URL builder for Invoices.
 * Validates phone numbers and builds clean wa.me links with formatted messages.
 */
export function buildWhatsAppInvoiceUrl(params: {
  phone: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate?: string | null;
  companyName?: string;
}): { success: boolean; url?: string; error?: string } {
  const { phone, invoiceNumber, clientName, amount, dueDate, companyName } = params;

  if (!phone || !phone.trim()) {
    return { success: false, error: "Customer phone number is missing." };
  }

  // Sanitize phone number (strip all non-digit characters)
  let cleanPhone = phone.replace(/\D/g, "");

  // Default to India country code 91 if a 10-digit number is provided
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  } else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
    cleanPhone = `91${cleanPhone.slice(1)}`;
  }

  if (cleanPhone.length < 10) {
    return { success: false, error: "Invalid phone number for WhatsApp messaging." };
  }

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

  const message = [
    `Hello ${clientName},`,
    ``,
    `Here is your invoice *${invoiceNumber}* from *${companyName || "CommandDesk"}*.`,
    `Total Amount: *${formattedAmount}*`,
    dueDate ? `Due Date: *${new Date(dueDate).toLocaleDateString()}*` : "",
    ``,
    `Thank you for your business! Please contact us if you have any questions.`,
  ]
    .filter(Boolean)
    .join("\n");

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  return { success: true, url: whatsappUrl };
}
