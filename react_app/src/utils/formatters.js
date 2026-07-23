// Utility helper functions for formatting dates, phone numbers, and IDs

export function formatPhoneNumber(phone) {
  if (!phone) return 'N/A';
  return phone.trim();
}

export function generateIdTag(prefix = 'CG-KID-') {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (err) {
    return dateString;
  }
}
