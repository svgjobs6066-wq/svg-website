import fs from 'node:fs';
function edit(path, transform) { const source=fs.readFileSync(path,'utf8'); fs.writeFileSync(path,transform(source)); }
edit('components/careers/careers.tsx',s=>s
 .replace('import Script from "next/script";\n','').replace('  Check,\n','')
 .replace(/declare global \{[\s\S]*?(?=export function Careers)/,'')
 .replace('  const [token, setToken] = useState("");\n','')
 .replace('  const [botReset, setBotReset] = useState(0);\n','')
 .replace('botToken: token,','website: data.website,')
 .replace('JSON.stringify({ ...data, botToken: token, uploadTicket })','JSON.stringify({ ...data, uploadTicket })')
 .replace('      setToken("");\n','').replace('      setBotReset(n => n + 1);\n','').replace('      setBotReset((n) => n + 1);\n','')
 .replace(/\s*<BotCheck onToken=\{setToken\} reset=\{botReset\} \/>/,''));
edit('lib/api.ts',s=>s.replace(/export async function verifyBot\([\s\S]*?(?=export function retentionDays)/,''));
edit('lib/validation.ts',s=>s.replace('  botToken: z.string().optional(),\n',''));
edit('app/api/applications/route.ts',s=>s.replace('  verifyBot,\n','').replace('    } else {\n      await verifyBot(input.botToken);\n    }','    }'));
edit('app/api/uploads/route.ts',s=>s.replace('  verifyBot,\n','').replace('        botToken: z.string().optional(),','        website: z.string().max(0).optional(),').replace('    await verifyBot(body.data.botToken);\n',''));
for(const path of ['.env.example','.env.local']) if(fs.existsSync(path)) edit(path,s=>s.split(/\r?\n/).filter(line=>!/^\s*(NEXT_PUBLIC_TURNSTILE_SITE_KEY|TURNSTILE_SECRET_KEY|ALLOW_LOCAL_BOT_BYPASS)\s*=/.test(line)&&!/^# Cloudflare Turnstile/.test(line)&&line!=='# Development only. Never works in production.').join('\n'));
edit('playwright.config.ts',s=>s.replace('NEXT_PUBLIC_TURNSTILE_SITE_KEY: "", ',''));
edit('SETUP.md',s=>s
 .replace('rate-limit secret and Turnstile keys','rate-limit secret')
 .replace('4. Configure Cloudflare Turnstile for your exact application hostname. Use the corresponding site/secret keys. `APP_URL` must equal the site origin. For local development only, `ALLOW_LOCAL_BOT_BYPASS=true` allows a missing Turnstile secret; production always requires verification.','4. Set `APP_URL` to your exact website origin. Follow [SUPABASE_BUCKET_STEPS.md](./SUPABASE_BUCKET_STEPS.md) for the private resume bucket. The form uses a hidden honeypot and Supabase-backed rate limiting; no external CAPTCHA service is required.')
 .replace('after validation and bot verification','after validation, honeypot checks and rate limiting')
 .replace('Turnstile on your domain, and the cron job','the rate limiter, and the cron job'));
