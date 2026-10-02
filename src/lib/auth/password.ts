import "server-only";
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Basic strength policy for admin passwords */
export function passwordIssues(p: string): string[] {
  const issues: string[] = [];
  if (p.length < 10) issues.push("минимум 10 символов");
  if (!/[a-zа-я]/.test(p)) issues.push("строчная буква");
  if (!/[A-ZА-Я]/.test(p)) issues.push("заглавная буква");
  if (!/\d/.test(p)) issues.push("цифра");
  return issues;
}
