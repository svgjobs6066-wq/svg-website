import { z } from "zod";
export const qualifications = [
  "10th",
  "12th",
  "ITI",
  "Diploma",
  "Any Degree",
  "Other",
] as const;
export const experiences = [
  "Fresher",
  "0–1 year",
  "1–3 years",
  "3+ years",
] as const;
export const applicationSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/),
  job: z.string().min(1).max(120),
  preferred_location: z.string().trim().min(2).max(120),
  qualification: z.enum(qualifications),
  experience: z.union([z.enum(experiences), z.literal("")]),
  consent: z.boolean().refine((v) => v === true),
  website: z.string().max(0).optional(),
  uploadTicket: z.string().uuid().optional(),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;
export const resumeTypes: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
export const MAX_RESUME_SIZE = 5 * 1024 * 1024;
export function validateResume(name: string, type: string, size: number) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return size > 0 && size <= MAX_RESUME_SIZE && resumeTypes[ext] === type
    ? ext
    : null;
}
export function validFileSignature(bytes: Uint8Array, ext: string) {
  if (ext === "pdf")
    return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (ext === "doc")
    return [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every(
      (b, i) => bytes[i] === b,
    );
  return (
    ext === "docx" &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 3 &&
    bytes[3] === 4
  );
}
