import Link from "next/link";

export default function HomePage() {
  return (
    <main className="auth-landing">
      <section className="auth-landing__card" aria-labelledby="landing-title">
        <div className="auth-landing__brand">Create Lab</div>
        <h1 id="landing-title">Creative work, organized.</h1>
        <p className="auth-landing__description">
          Sign in to your workspace or create an account to get started.
        </p>
        <div className="auth-landing__actions">
          <Link className="auth-landing__primary" href="/signup">
            Create Account
          </Link>
          <Link className="auth-landing__secondary" href="/login">
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
