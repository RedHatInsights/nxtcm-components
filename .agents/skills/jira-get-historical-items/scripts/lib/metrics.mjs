export function parseDate(iso) {
  const d = new Date(iso);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function formatDate(d) {
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

export function businessDaysBetween(start, end) {
  if (!start || !end) return null;
  let count = 0;
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    const day = cur.getUTCDay();
    if (day !== 0 && day !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/** PERCENTILE.INC-style linear interpolation */
export function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export function adfToText(node) {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak' || node.type === 'rule') return ' ';
  const parts = (node.content ?? []).map(adfToText);
  const sep = node.type === 'paragraph' || String(node.type).includes('heading') ? ' ' : '';
  return parts.join(sep);
}

export function plainDescription(field) {
  if (!field) return '';
  if (typeof field === 'string') return field.trim();
  return adfToText(field).replace(/\s+/g, ' ').trim();
}
