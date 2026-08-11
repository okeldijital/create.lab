export const DepartmentStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type DepartmentStatus =
  (typeof DepartmentStatus)[keyof typeof DepartmentStatus];
