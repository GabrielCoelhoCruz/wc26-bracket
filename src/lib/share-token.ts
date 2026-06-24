// ---------------------------------------------------------------------------
// WC26 – Shareable bracket token (URL-safe hash)
// ---------------------------------------------------------------------------
//
// The token is a signed+compressed JWT-like payload stored in the URL hash.
// It contains enough information to reconstruct the user's bracket predictions
// and optional owner name.
//
// Format:  base64url(HEADER).base64url(PAYLOAD).base64url(SIGNATURE)
// Header:  { alg:"HS256", typ:"BRACKET" }
// Payload: { iat, sub:"bracket", p: compressed predictions, owner? }
//
// The secret is read from BRACKET_SHARE_SECRET env var. In production it must be
// set — encoding/decoding fail closed without it. Unsigned tokens are only
// allowed in non-production for local development.
//
// ---------------------------------------------------------------------------

import { SignJWT, jwtVerify } from "jose";
import type { BracketPrediction } from "@/types/wc26";
import {
  appendShareLangParam,
  defaultLocale,
  formatMessage,
  getMessages,
  type Locale,
} from "@/lib/i18n";

export interface SharePayload {
  predictions: BracketPrediction;
  ownerName?: string;
}

interface RawSharePayload {
  sub: string;
  iat: number;
  p: BracketPrediction;
  owner?: string;
}

const TOKEN_TYPE = "BRACKET";
const ISSUER = "wc26-bracket";

export class ShareSecretMissingError extends Error {
  constructor() {
    super("BRACKET_SHARE_SECRET is not configured");
    this.name = "ShareSecretMissingError";
  }
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getSecret(): Uint8Array | null {
  const raw = process.env.BRACKET_SHARE_SECRET;
  if (!raw) return null;
  return new TextEncoder().encode(raw);
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Encode a bracket into a shareable token.
 */
export async function encodeBracketToken(
  payload: SharePayload,
): Promise<string> {
  const secret = getSecret();

  if (!secret && isProduction()) {
    throw new ShareSecretMissingError();
  }

  const jwt = new SignJWT({
    sub: "bracket",
    p: payload.predictions,
    owner: payload.ownerName,
  })
    .setProtectedHeader({ alg: secret ? "HS256" : "none", typ: TOKEN_TYPE })
    .setIssuer(ISSUER)
    .setIssuedAt();

  return jwt.sign(secret ?? new TextEncoder().encode(""));
}

/**
 * Decode and verify a share token.
 * Returns the bracket payload or null if invalid/malformed.
 */
export async function decodeBracketToken(
  token: string,
): Promise<SharePayload | null> {
  if (!token) return null;

  const secret = getSecret();

  if (!secret && isProduction()) {
    return null;
  }

  try {
    const key = secret ?? new TextEncoder().encode("");
    const algorithms = secret ? (["HS256"] as const) : (["none"] as const);

    const { payload } = await jwtVerify(token, key, {
      issuer: ISSUER,
      algorithms: [...algorithms],
    });
    const raw = payload as unknown as RawSharePayload;
    return {
      predictions: raw.p ?? {},
      ownerName: raw.owner,
    };
  } catch {
    return null;
  }
}

/**
 * Extract a bare share token from a pasted URL, hash, or path.
 */
export function normalizeShareHash(input: string): string {
  const trimmed = input.trim().replace(/^.*\/b\//, "")
  return trimmed.split("?")[0].split("#")[0]
}

/**
 * Build the absolute share URL for a bracket token.
 */
export function buildShareUrl(token: string, locale: Locale = defaultLocale): string {
  const base = isClient()
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return appendShareLangParam(`${base}/b/${token}`, locale);
}

/**
 * Build a friendly WhatsApp-style share message.
 */
export function buildShareText(ownerName?: string, locale: Locale = defaultLocale): string {
  const who = ownerName ? `${ownerName} ` : ""
  return formatMessage(getMessages(locale).share.shareText, { who })
}
