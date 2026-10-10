/**
 * Number, Currency, and Fitness formatters.
 */

export function formatCurrency(
  amountPaise: number,
  currencySymbol: string = '₹',
  options?: { showSign?: boolean; isExpense?: boolean }
): string {
  const rupees = amountPaise / 100;
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(rupees));

  let prefix = '';
  if (options?.showSign) {
    if (options.isExpense) {
      prefix = '- ';
    } else if (rupees > 0) {
      prefix = '+ ';
    }
  }

  return `${prefix}${currencySymbol}${formattedNumber}`;
}

export function parseRupeesToPaise(input: string | number): number {
  if (typeof input === 'number') {
    return Math.round(input * 100);
  }
  const clean = input.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function formatPace(totalMinutes: number, distanceKm: number): { paceStr: string; secondsPerKm: number } {
  if (!distanceKm || distanceKm <= 0 || !totalMinutes || totalMinutes <= 0) {
    return { paceStr: '0:00 min/km', secondsPerKm: 0 };
  }

  const totalSeconds = totalMinutes * 60;
  const paceSecondsPerKm = totalSeconds / distanceKm;

  const paceMinutes = Math.floor(paceSecondsPerKm / 60);
  const remainingSeconds = Math.round(paceSecondsPerKm % 60);

  const formattedPace = `${paceMinutes}:${remainingSeconds.toString().padStart(2, '0')} min/km`;
  return { paceStr: formattedPace, secondsPerKm: Math.round(paceSecondsPerKm) };
}

export function formatMinutesToHours(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function formatSecondsToTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
