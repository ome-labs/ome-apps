// The daemon speaks unix seconds; every function takes `now` so screens and tests share one clock.

type TimeOptions = {
  locale?: string;
};

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

/** `2h ago`, `3d ago`, `just now`: the largest whole unit, for lists and activity. */
export function timeAgo(at: number, now: number, { locale = "en" }: TimeOptions = {}): string {
  const elapsed = Math.max(0, now - at);
  if (elapsed < minute) return "just now";

  const format = new Intl.RelativeTimeFormat(locale, { style: "narrow" });
  if (elapsed < hour) return format.format(-Math.floor(elapsed / minute), "minute");
  if (elapsed < day) return format.format(-Math.floor(elapsed / hour), "hour");
  return format.format(-Math.floor(elapsed / day), "day");
}

/** `5h 12m`: the two largest units of a span, rounded down so a deadline is never overstated. */
export function formatDuration(seconds: number, { locale = "en" }: TimeOptions = {}): string {
  const total = Math.max(0, Math.floor(seconds));
  if (total < minute) return "under 1m";

  const days = Math.floor(total / day);
  const hours = Math.floor((total % day) / hour);
  const minutes = Math.floor((total % hour) / minute);
  const parts = days > 0 ? { days, hours } : hours > 0 ? { hours, minutes } : { minutes };

  return new Intl.DurationFormat(locale, { style: "narrow" }).format(parts);
}

/** `expires in 5h 12m` or `expired 2h ago`, for a proposal's `expiresAt`. */
export function formatExpiry(expiresAt: number, now: number, options?: TimeOptions): string {
  if (expiresAt > now) return `expires in ${formatDuration(expiresAt - now, options)}`;

  return `expired ${timeAgo(expiresAt, now, options)}`;
}

/** The absolute time for hover and detail rows: `Nov 9, 2026, 10:40 AM`, in the viewer's time zone unless given one. */
export function formatAbsoluteTime(
  at: number,
  { locale = "en", timeZone }: TimeOptions & { timeZone?: string } = {},
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(at * 1000);
}
