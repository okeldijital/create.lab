export const IncidentType = {
  TECHNICAL: "TECHNICAL",
  RESOURCE: "RESOURCE",
  CLIENT: "CLIENT",
  ENVIRONMENT: "ENVIRONMENT",
  OTHER: "OTHER",
} as const;

export type IncidentType = (typeof IncidentType)[keyof typeof IncidentType];
