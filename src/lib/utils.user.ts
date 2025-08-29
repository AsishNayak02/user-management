export function getInitials(name:string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
}

export type USER_ATTR = {
  id: string
  amount?: number
  username: string
  email: string
  firstName: string
  lastName: string
  organization: string
  groups: string
}

