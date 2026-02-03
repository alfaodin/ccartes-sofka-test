import {
  parseDate,
  formatDateForInput,
  addYears,
  isValidDate,
  getTodayFormatted
} from './date.utils';

describe('Date Utils', () => {
  describe('parseDate', () => {
    it('should parse string date in YYYY-MM-DD format', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January is 0
      expect(result?.getDate()).toBe(15);
    });

    it('should return the same Date object when passed a Date', () => {
      const date = new Date(2024, 0, 15);
      const result = parseDate(date);
      expect(result).toBe(date);
    });

    it('should return null for invalid string format', () => {
      expect(parseDate('invalid-date')).toBeNull();
      expect(parseDate('abc-def-ghi')).toBeNull();
      expect(parseDate('not a date')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDate('')).toBeNull();
    });

    it('should handle edge dates correctly', () => {
      const result = parseDate('2024-12-31');
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(11); // December is 11
      expect(result?.getDate()).toBe(31);
    });

    it('should handle leap year dates', () => {
      const result = parseDate('2024-02-29');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getMonth()).toBe(1); // February
      expect(result?.getDate()).toBe(29);
    });
  });

  describe('formatDateForInput', () => {
    it('should format Date object to YYYY-MM-DD string', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateForInput(date);
      expect(result).toBe('2024-01-15');
    });

    it('should format string date to YYYY-MM-DD string', () => {
      const result = formatDateForInput('2024-01-15');
      expect(result).toBe('2024-01-15');
    });

    it('should pad single digit months and days with zeros', () => {
      const date = new Date(2024, 0, 5); // January 5
      const result = formatDateForInput(date);
      expect(result).toBe('2024-01-05');
    });

    it('should handle December correctly', () => {
      const date = new Date(2024, 11, 31);
      const result = formatDateForInput(date);
      expect(result).toBe('2024-12-31');
    });

    it('should use current date if string cannot be parsed', () => {
      const result = formatDateForInput('invalid');
      // Should return today's date in YYYY-MM-DD format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle leap year dates', () => {
      const date = new Date(2024, 1, 29); // February 29, 2024
      const result = formatDateForInput(date);
      expect(result).toBe('2024-02-29');
    });
  });

  describe('addYears', () => {
    it('should add years to a date', () => {
      const date = new Date(2024, 0, 15);
      const result = addYears(date, 1);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    it('should not mutate the original date', () => {
      const date = new Date(2024, 0, 15);
      const originalYear = date.getFullYear();
      addYears(date, 1);
      expect(date.getFullYear()).toBe(originalYear);
    });

    it('should add multiple years', () => {
      const date = new Date(2024, 0, 15);
      const result = addYears(date, 5);
      expect(result.getFullYear()).toBe(2029);
    });

    it('should subtract years with negative number', () => {
      const date = new Date(2024, 0, 15);
      const result = addYears(date, -2);
      expect(result.getFullYear()).toBe(2022);
    });

    it('should handle leap year edge case', () => {
      const date = new Date(2024, 1, 29); // February 29, 2024
      const result = addYears(date, 1);
      // 2025 is not a leap year, so it should become March 1
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getDate()).toBe(1);
    });

    it('should handle year boundary correctly', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      const result = addYears(date, 1);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date string', () => {
      expect(isValidDate('2024-01-15')).toBeTrue();
    });

    it('should return true for valid Date object', () => {
      expect(isValidDate(new Date(2024, 0, 15))).toBeTrue();
    });

    it('should return false for invalid date string', () => {
      expect(isValidDate('invalid-date')).toBeFalse();
      expect(isValidDate('2024/01/15')).toBeFalse();
    });

    it('should return false for empty string', () => {
      expect(isValidDate('')).toBeFalse();
    });

    it('should return false for invalid Date object', () => {
      expect(isValidDate(new Date('invalid'))).toBeFalse();
    });

    it('should return true for edge dates', () => {
      expect(isValidDate('2024-02-29')).toBeTrue(); // Leap year
      expect(isValidDate('2024-12-31')).toBeTrue();
    });
  });

  describe('getTodayFormatted', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const result = getTodayFormatted();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return the current date', () => {
      const today = new Date();
      const result = getTodayFormatted();
      const expected = formatDateForInput(today);
      expect(result).toBe(expected);
    });

    it('should pad months and days with zeros', () => {
      const result = getTodayFormatted();
      const parts = result.split('-');
      expect(parts[1].length).toBe(2); // Month should be 2 digits
      expect(parts[2].length).toBe(2); // Day should be 2 digits
    });
  });

  describe('integration tests', () => {
    it('should correctly chain parseDate and formatDateForInput', () => {
      const input = '2024-01-15';
      const parsed = parseDate(input);
      const formatted = formatDateForInput(parsed!);
      expect(formatted).toBe(input);
    });

    it('should correctly add years and format', () => {
      const date = parseDate('2024-01-15');
      const withYear = addYears(date!, 1);
      const formatted = formatDateForInput(withYear);
      expect(formatted).toBe('2025-01-15');
    });

    it('should validate and format dates', () => {
      const input = '2024-01-15';
      if (isValidDate(input)) {
        const formatted = formatDateForInput(input);
        expect(formatted).toBe('2024-01-15');
      }
    });
  });
});
