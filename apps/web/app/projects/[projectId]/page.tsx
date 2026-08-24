import Link from "next/link";
import { getProject } from "../../../lib/application-runtime";
import { getApplicationContext } from "../../../lib/request-context";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const context = await getApplicationContext();
  const { projectId } = await params;
  const project = await getProject(projectId, context);

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
        <p>PROJECT</p>
        <h1>{project.name}</h1>
        <article>
          <p>{project.description ?? "No project description."}</p>
          <dl>
            <div><dt>Status</dt><dd>{project.status}</dd></div>
            <div><dt>Owner</dt><dd>{project.ownerId}</dd></div>
            <div><dt>Organization</dt><dd>{project.organizationId}</dd></div>
          </dl>
        </article>
      </section>
    </main>
  );
}
