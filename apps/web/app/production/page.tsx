import Link from "next/link";
import { WorkspaceShell } from "../../components/workspace-shell";
import { listProjects } from "../../lib/application-runtime";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function ProductionPage() {
  try {
    const context = await getApplicationContext();
    const projects = await listProjects(context);
    const productionProjects = projects.filter((project) => {
      const status = project.status.toLowerCase();
      return status === "in_progress" || status === "in-progress";
    });
    return <WorkspaceShell eyebrow="WORKSPACE" title="Production">
      <section className="cl-page-intro"><div><p className="cl-page-intro__eyebrow">PRODUCTION</p><h2>Move creative work forward.</h2><p>Production is the working view for projects currently being made. Production records will connect here as the workflow context becomes active.</p></div></section>
      <section className="cl-production" aria-labelledby="production-heading">
        <div className="cl-section-heading"><div><p className="cl-section-heading__eyebrow">ACTIVE WORK</p><h2 id="production-heading">Production queue</h2></div><span className="cl-status-note">{productionProjects.length} projects</span></div>
        {productionProjects.length === 0 ? <div className="cl-empty-state"><strong>No active production work.</strong><p>Projects will appear here when they enter production.</p></div> :
          <div className="cl-production-list">{productionProjects.map(project => <Link key={project.id} href={`/projects/${project.id}`} className="cl-production-row"><span><strong>{project.name}</strong><small>{project.description ?? "No project description"}</small></span><span className="cl-status-badge">{project.status.replace(/_/g," ")}</span></Link>)}</div>}
      </section>
    </WorkspaceShell>;
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="WORKSPACE" title="Production"><article><h2>Sign in required</h2><p>Your session was not found. Sign in again to open this workspace.</p><Link href="/login">Sign in</Link></article></WorkspaceShell>;
  }
}
