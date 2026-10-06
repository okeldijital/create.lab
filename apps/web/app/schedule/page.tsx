import Link from "next/link";
import { WorkspaceShell } from "../../components/workspace-shell";
import { listProjects } from "../../lib/application-runtime";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function SchedulePage() {
  try {
    const context = await getApplicationContext();
    const projects = await listProjects(context);
    const activeProjects = projects.filter((project) => project.status.toLowerCase() !== "completed");

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title="Schedule">
        <section className="cl-page-intro">
          <div>
            <p className="cl-page-intro__eyebrow">SCHEDULE</p>
            <h2>Know what is happening next.</h2>
            <p>Upcoming creative work will appear here as scheduling records become available.</p>
          </div>
        </section>
        <section className="cl-schedule" aria-labelledby="schedule-heading">
          <div className="cl-section-heading">
            <div><p className="cl-section-heading__eyebrow">UPCOMING WORK</p><h2 id="schedule-heading">This week</h2></div>
            <span className="cl-status-note">No events</span>
          </div>
          <div className="cl-schedule__grid">
            {["Mon","Tue","Wed","Thu","Fri"].map((day) => (
              <div className="cl-schedule__day" key={day}>
                <span className="cl-schedule__day-name">{day}</span>
                <div className="cl-schedule__empty">No scheduled work</div>
              </div>
            ))}
          </div>
        </section>
        <section className="cl-schedule__projects">
          <div className="cl-section-heading">
            <div><p className="cl-section-heading__eyebrow">WORK CONTEXT</p><h2>Projects awaiting scheduling</h2></div>
            <span className="cl-status-note">{activeProjects.length} active</span>
          </div>
          {activeProjects.length === 0 ? (
            <div className="cl-empty-state"><strong>No projects require scheduling.</strong><p>Create a project to make it available to the scheduling workflow.</p></div>
          ) : (
            <div className="cl-project-list">
              {activeProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="cl-project-row">
                  <span className="cl-project-row__main"><strong>{project.name}</strong><span>{project.description ?? "No project description"}</span></span>
                  <span className="cl-project-row__meta"><span className="cl-status-badge">{project.status.replace(/_/g, " ")}</span><span className="cl-project-row__arrow" aria-hidden="true">→</span></span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="WORKSPACE" title="Schedule"><article><h2>Sign in required</h2><p>Your session was not found. Sign in again to open this workspace.</p><Link href="/login">Sign in</Link></article></WorkspaceShell>;
  }
}
