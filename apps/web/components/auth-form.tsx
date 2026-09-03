"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "sign-in" | "sign-up";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${isSignUp ? "sign-up" : "sign-in"}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          isSignUp
            ? { name, email, password, callbackURL: "/" }
            : { email, password, callbackURL: "/" },
        ),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? payload?.message ?? "Authentication failed.");
      }

      router.push("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ width: "100%", maxWidth: 440 }}>
        <p style={{ fontSize: 11, letterSpacing: ".12em", color: "#777" }}>CREATIVE LAB</p>
        <h1 style={{ fontSize: 42, margin: "8px 0 12px" }}>{isSignUp ? "Create your account" : "Welcome back"}</h1>
        <p style={{ color: "#666", marginBottom: 28 }}>
          {isSignUp ? "Create an account to enter your workspace." : "Sign in to continue to your workspace."}
        </p>

        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #e3e3df", borderRadius: 16, padding: 28 }}>
          {isSignUp && (
            <label style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              <span>Name</span>
              <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
            </label>
          )}
          <label style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            <span>Email</span>
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            <span>Password</span>
            <input required minLength={8} type="password" autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} />
          </label>

          {error && <p role="alert" style={{ color: "#9b1c1c", margin: "0 0 16px" }}>{error}</p>}

          <button disabled={loading} type="submit" style={buttonStyle}>
            {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 20, color: "#666" }}>
          {isSignUp ? "Already have an account? " : "New to Creative Lab? "}
          <Link href={isSignUp ? "/login" : "/signup"}>{isSignUp ? "Sign in" : "Create an account"}</Link>
        </p>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #d7d7d2",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 16,
};

const buttonStyle = {
  width: "100%",
  border: 0,
  borderRadius: 8,
  padding: "12px 16px",
  background: "#111",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
};
