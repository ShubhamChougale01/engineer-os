"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { oauthStartUrl, useAuth } from "@/lib/auth";
import { usePlatformSettings } from "@/lib/settings";
import { AppleIcon, GitHubIcon, GoogleIcon } from "@/components/ProviderIcons";

type Mode = "signin" | "signup";

function AuthCard() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, signIn, signUp, signOut } = useAuth();
  const { settings } = usePlatformSettings();

  const [modeState, setMode] = useState<Mode>("signin");
  // Admin turned sign-ups off → only sign-in is available.
  const mode: Mode = settings.signup_enabled ? modeState : "signin";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "signups_disabled"
      ? "Sign-ups are currently disabled."
      : params.get("error")
        ? `Sign-in was cancelled or failed (${params.get("error")}).`
        : null,
  );

  // Already signed in → account view.
  if (user) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface-raised p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-xl font-bold text-accent">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-lg font-semibold">{user.name}</h1>
        <p className="text-sm text-ink-muted">{user.email}</p>
        <p className="mt-1 text-xs text-ink-faint">
          Signed in{user.provider !== "local" ? ` with ${user.provider}` : ""}
        </p>
        <button
          onClick={signOut}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-ink-muted hover:border-rose-500/50 hover:text-rose-500"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") await signUp(name, email, password);
      else await signIn(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const providers = [
    { id: "github" as const, label: "Continue with GitHub", icon: <GitHubIcon /> },
    { id: "google" as const, label: "Continue with Google", icon: <GoogleIcon /> },
    { id: "apple" as const, label: "Continue with Apple", icon: <AppleIcon /> },
  ];

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-surface-raised p-8">
      <h1 className="text-xl font-semibold tracking-tight">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {mode === "signin"
          ? "Sign in to sync your progress and bookmarks."
          : "Start tracking your journey to Senior AI Engineer."}
      </p>

      {/* Mode toggle — hidden when the admin has disabled sign-ups */}
      {settings.signup_enabled && (
        <div className="mt-5 grid grid-cols-2 rounded-lg border border-line p-1 text-sm">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`rounded-md py-1.5 font-medium transition-colors ${
                mode === m ? "bg-accent-soft text-accent" : "text-ink-faint hover:text-ink"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
      )}

      {/* OAuth providers */}
      <div className="mt-5 space-y-2">
        {providers.map((p) => (
          <a
            key={p.id}
            href={oauthStartUrl(p.id)}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink-faint"
          >
            {p.icon}
            {p.label}
          </a>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-faint">
        <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
      </div>

      {/* Email + password */}
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            maxLength={120}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-ink-faint focus:border-accent"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-ink-faint focus:border-accent"
        />
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Password (min. 8 characters)" : "Password"}
            required
            minLength={mode === "signup" ? 8 : 1}
            maxLength={72}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 pr-10 text-sm outline-none placeholder:text-ink-faint focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink-faint hover:text-ink"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-faint">
        <ShieldCheck size={12} />
        Passwords are bcrypt-hashed on the server — never stored in plain text.
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Suspense>
        <AuthCard />
      </Suspense>
    </div>
  );
}
