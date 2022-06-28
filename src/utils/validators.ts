export function isTooShortPassword(value: string | null, minLength: number): boolean {
  const valueLength = value ? value.split('').length : 0;
  return valueLength < minLength;
}
