import { format, formatDistance } from 'date-fns';

// Format a date
export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy') {
  if (!date) return '';
  return format(new Date(date), formatStr);
}

// Format a time
export function formatTime(date: string | Date) {
  if (!date) return '';
  return format(new Date(date), 'h:mm a');
}

// Format a date and time
export function formatDateTime(date: string | Date) {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date: string | Date) {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

// Format currency
export function formatCurrency(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

// Format phone number
export function formatPhone(phone: string) {
  if (!phone) return '';
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// Generate a color based on a string (for consistent colors per job/client)
export function stringToColor(str: string) {
  if (!str) return '#1E40AF'; // Default blue

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#1E40AF', // Blue
    '#0F766E', // Teal
    '#7C3AED', // Purple
    '#047857', // Green
    '#B45309', // Amber
    '#9D174D', // Pink
  ];

  // Get a consistent index from the hash
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Format address components into a full address
export function formatAddress(street: string, city: string, state: string, zip: string) {
  return `${street}, ${city}, ${state} ${zip}`;
}

// Generate a Cash App QR code URL
export function generateCashTagQR(cashtag: string, amount: number, note: string) {
  const cashAppUrl = `https://cash.app/$${cashtag}/${amount}`;
  const encodedNote = encodeURIComponent(note);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cashAppUrl)}&note=${encodedNote}`;

  return qrUrl;
}

// Calculate distance between two coordinates (in miles)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  if (!lat1 || !lng1 || !lat2 || !lng2) {
    return 0;
  }

  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
}

function toRad(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Generate a placeholder avatar URL based on initials
export function getInitialsAvatar(name: string, bgColor = '1E40AF') {
  if (!name) return '';

  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bgColor}&color=fff`;
}

// Pluralize a word based on count
export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : plural || `${singular}s`;
}

// Truncate text to a specific length
export function truncate(text: string, maxLength: number) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Get status color based on job status
export function getStatusColor(status: string) {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    invoiced: 'bg-purple-100 text-purple-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

// Get status label (formatted for display)
export function getStatusLabel(status: string) {
  const labels = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    invoiced: 'Invoiced',
    paid: 'Paid',
    cancelled: 'Cancelled',
  };

  return labels[status as keyof typeof labels] || status;
}
