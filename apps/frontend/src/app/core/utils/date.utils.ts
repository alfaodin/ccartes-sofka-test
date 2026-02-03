export function parseDate(dateValue: string | Date): Date | null {
  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === 'string') {
    const [year, month, day] = dateValue.split('-').map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  }

  return null;
}

export function formatDateForInput(dateValue: string | Date): string {
  let date: Date;

  if (typeof dateValue === 'string') {
    date = parseDate(dateValue) || new Date();
  } else {
    date = dateValue;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}

export function isValidDate(dateValue: string | Date): boolean {
  const date = parseDate(dateValue);
  return date !== null && !isNaN(date.getTime());
}

export function getTodayFormatted(): string {
  return formatDateForInput(new Date());
}
