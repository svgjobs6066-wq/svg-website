import { createClient } from '@supabase/supabase-js';
process.loadEnvFile('.env.local');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
if(!url||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){console.log('Supabase is not configured');process.exit(0);}
const db=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
const {data,error,status}=await db.from('jobs').select('id').eq('status','active');
console.log(JSON.stringify({jobsReadable:!error&&Array.isArray(data),activeJobs:Array.isArray(data)?data.length:null,errorCode:error?.code||null,status}));
