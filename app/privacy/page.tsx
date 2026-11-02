import { Legal } from "@/components/legal";
import { retentionDays } from "@/lib/api";
export const metadata = { title: "Privacy" };
export default function Page() {
  return <Legal kind="privacy" days={retentionDays()} />;
}
