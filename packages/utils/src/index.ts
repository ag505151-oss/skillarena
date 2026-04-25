export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) {
    return '***';
  }

  const safePrefix = name.slice(0, 2);
  return `${safePrefix}***@${domain}`;
}
