import bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

export async function hashSecret(secret: string) {
  return bcrypt.hash(secret, BCRYPT_ROUNDS);
}

export async function verifySecret(secret: string, hash: string) {
  return bcrypt.compare(secret, hash);
}

export function getRequestIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

export function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || 'text-local-ip-salt';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export function jsonError(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export function parseBasicAuth(header: string | null) {
  if (!header?.startsWith('Basic ')) return null;

  try {
    const decoded = Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator === -1) return null;
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}

export async function isAdminRequest(request: NextRequest) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;

  const auth = parseBasicAuth(request.headers.get('authorization'));
  if (!auth?.password) return false;
  return verifySecret(auth.password, hash);
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
