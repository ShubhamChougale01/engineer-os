"use client";

import { useCallback } from "react";
import { useStoredState } from "./storage";

/**
 * Client-side auth: talks to the FastAPI backend, keeps the JWT + user in
 * localStorage via the same pub/sub storage hooks the rest of the app uses.
 * The password is only ever held in memory during the request; the server
 * stores a bcrypt hash.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  provider: string;
  is_admin?: boolean;
}

interface Session {
  token: string;
  user: AuthUser;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the API server — is it running? (cd api && uv run uvicorn app.main:app)");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail;
    throw new Error(typeof detail === "string" ? detail : `Request failed (${res.status})`);
  }
  return data as T;
}

export function useAuth() {
  const [session, setSession] = useStoredState<Session | null>("aeos:session", null);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const out = await post<{ access_token: string; user: AuthUser }>("/auth/register", {
        name,
        email,
        password,
      });
      setSession({ token: out.access_token, user: out.user });
    },
    [setSession],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const out = await post<{ access_token: string; user: AuthUser }>("/auth/login", {
        email,
        password,
      });
      setSession({ token: out.access_token, user: out.user });
    },
    [setSession],
  );

  const signOut = useCallback(() => setSession(null), [setSession]);

  /** Called by /auth/callback after an OAuth redirect (#token=...). */
  const adoptToken = useCallback(
    async (token: string) => {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("OAuth sign-in failed — token rejected");
      const user = (await res.json()) as AuthUser;
      setSession({ token, user });
    },
    [setSession],
  );

  return { user: session?.user ?? null, token: session?.token ?? null, signIn, signUp, signOut, adoptToken };
}

export const oauthStartUrl = (provider: "github" | "google" | "apple") =>
  `${API_BASE}/api/v1/auth/oauth/${provider}/start`;
