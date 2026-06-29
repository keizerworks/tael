export function stringifyFrontmatter(data: Record<string, unknown>, body: string): string {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}

export function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: raw.trim() };
  }

  const data: Record<string, unknown> = {};
  for (const line of (match[1] ?? '').split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const rest = line.slice(idx + 1).trim();
    try {
      data[key] = JSON.parse(rest);
    } catch {
      data[key] = rest;
    }
  }
  return { data, body: (match[2] ?? '').trim() };
}
