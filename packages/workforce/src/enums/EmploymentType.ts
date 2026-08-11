export const EmploymentType = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  FREELANCE: "FREELANCE",
  VOLUNTEER: "VOLUNTEER",
  INTERN: "INTERN",
} as const;

export type EmploymentType =
  (typeof EmploymentType)[keyof typeof EmploymentType];
