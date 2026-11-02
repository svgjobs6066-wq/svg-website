import fs from "node:fs";
const file = "components/admin/workspace.tsx";
let text = fs.readFileSync(file, "utf8");
text = text.replace(
  "const router=useRouter();const [applications",
  "const [now,setNow]=useState(0);const router=useRouter();const [applications",
);
text = text.replace(
  "setApplications(apps.applications);",
  "setNow(Date.now());setApplications(apps.applications);",
);
text = text.replace("Math.min(...dates)-Date.now()", "Math.min(...dates)-now");
fs.writeFileSync(file, text);
