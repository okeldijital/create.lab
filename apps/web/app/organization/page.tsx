import Link from "next/link";
import { WorkspaceShell } from "../../components/workspace-shell";
import { getOrganization } from "../../lib/application-runtime";
import {
  getApplicationContext,
  MissingRequestContextError,
} from "../../lib/request-context";

export default async function OrganizationPage() {
  try {
    const context = await getApplicationContext();
    const organization = await getOrganization(context);

    return (
      <WorkspaceShell
        eyebrow="WORKSPACE"
        title={organization.displayName || organization.name}
      >
        <article>
          <h2>Organization</h2>
          <dl>
            <dt>Slug</dt>
            <dd>{organization.slug}</dd>
            <dt>Status</dt>
            <dd>{organization.status}</dd>
            <dt>Timezone</dt>
            <dd>{organization.timezone}</dd>
            <dt>Locale</dt>
            <dd>{organization.locale}</dd>
            <dt>Currency</dt>
            <dd>{organization.currency}</dd>
          </dl>
        </article>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;

    return (
      <main>
        <h1>Organization access required</h1>
        <p>An authenticated organization and actor context is required before organization data can be accessed.</p>
        <Link href="/login">Sign in</Link>
      </main>
    );
  }
}
