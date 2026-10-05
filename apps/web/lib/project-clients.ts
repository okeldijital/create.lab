import { randomUUID } from "node:crypto";
import { getBetterAuthRuntime } from "./auth/better-auth";

export type ProjectClient = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

const ENSURE_SQL = `
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  customer_number text NOT NULL,
  name text NOT NULL,
  legal_name text,
  status text NOT NULL,
  industry text,
  billing_address text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  archived_at timestamptz
);
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text,
  is_primary boolean NOT NULL DEFAULT false,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  archived_at timestamptz
);
CREATE TABLE IF NOT EXISTS project_clients (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  project_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  created_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS project_clients_project_idx ON project_clients (project_id);
`;

async function database() {
  const client = getBetterAuthRuntime().database.client;
  await client.unsafe(ENSURE_SQL);
  return client;
}

export async function listProjectClients(organizationId: string, projectId: string): Promise<ProjectClient[]> {
  const client = await database();
  return client<ProjectClient[]>`
    select c.id, c.name, t.email, t.phone
    from project_clients pc
    join customers c on c.id = pc.customer_id
    join contacts t on t.id = pc.contact_id
    where pc.organization_id = ${organizationId} and pc.project_id = ${projectId}
    order by pc.created_at asc
  `;
}

export async function addProjectClient(input: {
  organizationId: string;
  projectId: string;
  name: string;
  email: string;
  phone: string | null;
}) {
  const client = await database();
  const customerId = randomUUID();
  const contactId = randomUUID();
  const [firstName, ...rest] = input.name.split(/\s+/);
  const lastName = rest.join(" ") || firstName;
  await client`
    insert into customers (
      id, organization_id, customer_number, name, status, created_at, updated_at
    ) values (
      ${customerId}, ${input.organizationId}, ${`CL-${customerId.slice(0, 8)}`}, ${input.name}, 'active', now(), now()
    )
  `;
  await client`
    insert into contacts (
      id, organization_id, customer_id, first_name, last_name, email, phone, is_primary, status, created_at, updated_at
    ) values (
      ${contactId}, ${input.organizationId}, ${customerId}, ${firstName}, ${lastName}, ${input.email}, ${input.phone}, true, 'active', now(), now()
    )
  `;
  await client`
    insert into project_clients (
      id, organization_id, project_id, customer_id, contact_id, created_at
    ) values (
      ${randomUUID()}, ${input.organizationId}, ${input.projectId}, ${customerId}, ${contactId}, now()
    )
  `;
}
