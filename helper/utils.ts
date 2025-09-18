//Utility function to replace - with space and capitalize
export function capitalizedWord(str: string) {
  return str.replace(/-|\b\w/g, (match) => {
    if (match === "-") {
      return " ";
    }
    return match.toUpperCase();
  });
}

// Utility function to get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Utility function to format date display
export function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}
