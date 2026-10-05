import Link from "next/link";
import { Card } from "@creative-lab/ui";
import { WorkspaceShell } from "../../components/workspace-shell";
import { getOrganization } from "../../lib/application-runtime";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function OrganizationPage() {
  try {
    const context = await getApplicationContext();
    const organization = await getOrganization(context);

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title={organization.displayName || organization.name}>
        <div className="cl-organization">
          <section className="cl-organization__hero">
            <div>
              <p className="cl-kicker">WORKSPACE SETTINGS</p>
              <h2>{organization.displayName || organization.name}</h2>
              <p>Core workspace identity and commercial defaults for this creative business.</p>
            </div>
            <div className="cl-organization__status">
              <span>Status</span>
              <strong>{organization.status}</strong>
            </div>
          </section>
          <section className="cl-org-grid">
            <Card>
              <h2>Workspace profile</h2>
              <dl className="cl-org-detail">
                <dt>Slug</dt><dd>{organization.slug}</dd>
                <dt>Timezone</dt><dd>{organization.timezone}</dd>
                <dt>Locale</dt><dd>{organization.locale}</dd>
                <dt>Currency</dt><dd>{organization.currency}</dd>
              </dl>
            </Card>
            <Card>
              <h2>Configuration</h2>
              <p className="cl-organization__note">Services, quotes and other commercial workflows will use these workspace defaults as their configuration surface expands.</p>
              <Link className="cl-button cl-button--secondary" href="/services">Review services</Link>
            </Card>
          </section>
        </div>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="WORKSPACE" title="Organization"><Card title="Workspace access required"><p>Your authenticated organization context is not available yet.</p><Link href="/login">Sign in</Link></Card></WorkspaceShell>;
  }
}