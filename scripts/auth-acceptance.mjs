const required = [
  "AUTH_ACCEPTANCE_BASE_URL",
  "AUTH_ACCEPTANCE_EMAIL",
  "AUTH_ACCEPTANCE_PASSWORD",
  "AUTH_ACCEPTANCE_ORGANIZATION_ID",
  "AUTH_ACCEPTANCE_PROJECT_ID",
];

for (const name of required) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(2);
  }
}

const baseUrl = process.env.AUTH_ACCEPTANCE_BASE_URL.replace(/\/$/, "");
const email = process.env.AUTH_ACCEPTANCE_EMAIL;
const password = process.env.AUTH_ACCEPTANCE_PASSWORD;
const organizationId = process.env.AUTH_ACCEPTANCE_ORGANIZATION_ID;
const projectId = process.env.AUTH_ACCEPTANCE_PROJECT_ID;
const unauthorizedOrganizationId = process.env.AUTH_ACCEPTANCE_UNAUTHORIZED_ORGANIZATION_ID;

function cookieHeader(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers
      .getSetCookie()
      .map((value) => value.split(";", 1)[0])
      .join("; ");
  }

  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return "";
  return setCookie
    .split(/,(?=\s*[^;=]+=[^;]+)/)
    .map((value) => value.split(";", 1)[0])
    .join("; ");
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  });
  return response;
}

console.log("AUTH-002 authenticated runtime acceptance");
console.log(`Base URL: ${baseUrl}`);

const signIn = await request("/api/auth/sign-in/email", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin: baseUrl,
  },
  body: JSON.stringify({
    email,
    password,
    rememberMe: true,
  }),
});

if (!signIn.ok) {
  const body = await signIn.text();
  console.error(`FAIL sign-in: HTTP ${signIn.status}`);
  console.error(body.slice(0, 1000));
  process.exit(1);
}

const cookie = cookieHeader(signIn);
if (!cookie) {
  console.error("FAIL sign-in: no session cookie returned");
  process.exit(1);
}
console.log("PASS authenticated Better Auth sign-in returned a session cookie");

const session = await request("/api/auth/get-session", {
  headers: { cookie },
});

if (!session.ok) {
  console.error(`FAIL session resolution: HTTP ${session.status}`);
  process.exit(1);
}

const sessionBody = await session.json();
if (!sessionBody?.user?.id) {
  console.error("FAIL session resolution: no authenticated user identity returned");
  process.exit(1);
}
console.log(`PASS session resolves to application actor candidate ${sessionBody.user.id}`);

const projectPath = `/projects/${encodeURIComponent(projectId)}`;
const authorizedProject = await request(projectPath, {
  headers: {
    cookie,
    "x-creative-lab-organization-id": organizationId,
  },
});

if (!authorizedProject.ok) {
  console.error(`FAIL authorized project access: HTTP ${authorizedProject.status}`);
  process.exit(1);
}
console.log("PASS authenticated authorized project access returned HTTP 2xx");

if (unauthorizedOrganizationId) {
  const crossTenantProject = await request(projectPath, {
    headers: {
      cookie,
      "x-creative-lab-organization-id": unauthorizedOrganizationId,
    },
  });

  if (crossTenantProject.ok) {
    console.error("FAIL cross-tenant denial: unauthorized organization received HTTP 2xx");
    process.exit(1);
  }
  console.log(`PASS cross-tenant denial returned HTTP ${crossTenantProject.status}`);
} else {
  console.log("SKIP cross-tenant denial: set AUTH_ACCEPTANCE_UNAUTHORIZED_ORGANIZATION_ID to execute it");
}

console.log("AUTH-002 acceptance harness completed");
