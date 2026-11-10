/** `1,182`: a whole number such as a block height or a gas amount, grouped by thousands. */
export function formatCount(value: number, { locale = "en" }: { locale?: string } = {}): string {
  return new Intl.NumberFormat(locale).format(value);
}
