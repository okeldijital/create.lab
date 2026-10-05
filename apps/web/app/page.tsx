import Link from "next/link";
import { WorkspaceShell } from "../components/workspace-shell";
import { listProjects } from "../lib/application-runtime";
import { getOptionalSession } from "../lib/auth/session";
import {
  getApplicationContext,
  MissingRequestContextError,
} from "../lib/request-context";

export default async function HomePage() {
  const session = await getOptionalSession();
  if (!session) {
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

  let projectCount = 0;
  try {
    const context = await getApplicationContext();
    projectCount = (await listProjects(context)).length;
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
  }

  return (
    <WorkspaceShell eyebrow="WORKSPACE" title="Overview">
      <article>
        <h2>{session.name}</h2>
        <p>Signed in. This workspace is open.</p>
        <p>
          {projectCount} {projectCount === 1 ? "project" : "projects"}.
        </p>
        <Link href="/projects">Open projects</Link>
      </article>
    </WorkspaceShell>
  );
}
