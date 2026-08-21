import Link from "next/link";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";
import { getOrganization } from "../../lib/application-runtime";

export default async function OrganizationPage() {
  try {
    const context = await getApplicationContext();
    const organization = await getOrganization(context);

    return (
      <main>
        <aside>
          <strong>Creative Lab</strong>
          <nav>
            <Link href="/">Overview</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/organization">Organization</Link>
          </nav>
        </aside>
        <section>
          <p>WORKSPACE</p>
          <h1>{organization.displayName || organization.name}</h1>
          <article>
            <h2>Organization</h2>
            <dl>
              <dt>Slug</dt><dd>{organization.slug}</dd>
              <dt>Status</dt><dd>{organization.status}</dd>
              <dt>Timezone</dt><dd>{organization.timezone}</dd>
              <dt>Locale</dt><dd>{organization.locale}</dd>
              <dt>Currency</dt><dd>{organization.currency}</dd>
            </dl>
          </article>
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof MissingRequestContextError) {
      return (
        <main>
          <h1>Organization access required</h1>
          <p>An authenticated organization and actor context is required before organization data can be accessed.</p>
        </main>
      );
    }
    throw error;
  }
}
