/**
 * Local date utilities avoiding timezone offsets and UTC date shifting.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr: string, options?: { includeWeekday?: boolean; short?: boolean }): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  if (options?.short) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', {
    weekday: options?.includeWeekday !== false ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDayOfWeekIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay(); // 0 = Sun, 1 = Mon...
}

export function getGreeting(name: string = ''): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17) {
    timeGreeting = 'Good evening';
  }
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

export function getWeekDates(baseDateStr: string = getTodayDateString()): string[] {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const day = base.getDay();
  // Monday as start of week (day 1). If day is 0 (Sunday), diff is -6
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    dates.push(`${yr}-${mo}-${da}`);
  }
  return dates;
}

export function getMonthDays(year: number, monthIndex: number): string[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dates: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const mo = String(monthIndex + 1).padStart(2, '0');
    const da = String(i).padStart(2, '0');
    dates.push(`${year}-${mo}-${da}`);
  }
  return dates;
}

export function isDateInCurrentMonth(dateStr: string): boolean {
  const today = getTodayDateString();
  return dateStr.slice(0, 7) === today.slice(0, 7);
}

export function isDateInCurrentWeek(dateStr: string): boolean {
  const weekDates = getWeekDates();
  return weekDates.includes(dateStr);
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const da = String(date.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}
