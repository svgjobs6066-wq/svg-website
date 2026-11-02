export type Job = {
  id: string;
  slug: string;
  title: string;
  department: string;
  highlight: string;
  location: string | null;
  job_type: string | null;
  eligibility: string | null;
  status: string;
};
export const departments = [
  "Machining",
  "Fabrication",
  "Assembly",
  "Finishing",
  "Office",
] as const;
export const seedJobs: Job[] = [
  ["CNC Machine Operator", "Machining", "Precision part production"],
  ["VMC Machine Operator", "Machining", "Vertical machining centre"],
  ["HMC Machine Operator", "Machining", "Horizontal machining centre"],
  ["Lathe Operator", "Machining", "Turning and finishing"],
  ["Laser Machine Operator", "Fabrication", "Sheet cutting"],
  ["CNC Bending Machine Operator", "Fabrication", "Accurate sheet bends"],
  ["Powder Coating Operator", "Finishing", "Quality surface finish"],
  ["Assembly Technician", "Assembly", "Build and fit assemblies"],
  ["Accounts", "Office", "Books and billing"],
  ["Purchase", "Office", "Sourcing and vendors"],
].map(([title, department, highlight], i) => ({
  id: `seed-${i}`,
  slug: title.toLowerCase().replaceAll(" ", "-"),
  title,
  department,
  highlight,
  location: null,
  job_type: null,
  eligibility: null,
  status: "active",
}));
export const statuses = [
  "new",
  "contacted",
  "shortlisted",
  "interview",
  "selected",
  "joined",
  "not_selected",
  "withdrawn",
] as const;
