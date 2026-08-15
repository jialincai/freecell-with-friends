// Mobile console viewers often render object args as a collapsed,
// non-expandable "Object" with no inspectable data. Stringify everything
// into the log message itself so the full payload is always visible as
// plain, line-wrapping text instead of a horizontally-truncated preview.
function replacer(_key: string, value: unknown) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function format(data: unknown): string {
  if (data === undefined) return "";
  try {
    return " " + JSON.stringify(data, replacer, 2);
  } catch {
    return " " + String(data);
  }
}

export function dlog(label: string, data?: unknown): void {
  console.log(`${label}${format(data)}`);
}

export function dwarn(label: string, data?: unknown): void {
  console.warn(`${label}${format(data)}`);
}

export function derror(label: string, data?: unknown): void {
  console.error(`${label}${format(data)}`);
}
