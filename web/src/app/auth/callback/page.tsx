"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * OAuth landing page. The backend redirects here with #token=<jwt> in the
 * URL fragment (fragments never reach servers or logs). We adopt the token,
 * fetch the user, and go home.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { adoptToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against strict-mode double effect
    ran.current = true;

    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      setError("No token received from the sign-in provider.");
      return;
    }
    window.history.replaceState(null, "", window.location.pathname); // scrub the hash
    adoptToken(token)
      .then(() => router.replace("/"))
      .catch((e) => setError(e instanceof Error ? e.message : "Sign-in failed"));
  }, [adoptToken, router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-sm text-ink-muted">
      {error ? (
        <>
          <p className="text-rose-500">{error}</p>
          <button onClick={() => router.replace("/auth")} className="text-accent underline">
            Back to sign in
          </button>
        </>
      ) : (
        <>
          <Loader2 size={20} className="animate-spin text-accent" />
          Completing sign-in…
        </>
      )}
    </div>
  );
}
