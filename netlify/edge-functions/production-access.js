const API='https://oxnpmgbwwsjfseirfxej.supabase.co';
const KEY='sb_publishable_Ac7QJhrz4teLLONsAoU1_Q_MT6o9Yk4';
const COOKIE='__Host-catalyst-production';
export const privateHeaders={'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Netlify-CDN-Cache-Control':'no-store','Pragma':'no-cache','Vary':'Cookie, Authorization','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff'};
function deny(status,message){return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Protected production reader | Catalyst</title><style>body{margin:0;background:#090c13;color:#f3edde;font:18px/1.6 system-ui;padding:8vw;max-width:48rem}a{color:#edba53}h1{font-size:clamp(2rem,6vw,4rem)}</style><p>CATALYST · THE AWAKENING</p><h1>Production reader is protected</h1><p>${message}</p><p><a href="/production-access.html">Sign in for production access</a></p><p><a href="/">Back to the public showcase</a></p></html>`,{status,headers:{...privateHeaders,'Content-Type':'text/html; charset=utf-8'}});}
export async function authorize(token,fetcher=fetch){
  if(!token||token.length>3800||/[\s;]/.test(token))return {status:401};
  const headers={apikey:KEY,Authorization:'Bearer '+token};
  const check=await fetcher(API+'/auth/v1/user',{headers,signal:AbortSignal.timeout(8000)});
  if(!check.ok)return {status:401};
  const user=await check.json();if(!user.id||user.is_anonymous)return {status:401};
  const res=await fetcher(API+'/rest/v1/production_reader_access?select=role&user_id=eq.'+encodeURIComponent(user.id),{headers,signal:AbortSignal.timeout(8000)});
  if(!res.ok)return {status:503};
  const rows=await res.json(),role=Array.isArray(rows)&&rows[0]?.role;
  return ['admin','reviewer'].includes(role)?{status:200,role}:{status:403};
}
export default async function handler(request,context){
  const url=new URL(request.url),session=url.pathname==='/production-session';
  try{
    if(session&&request.headers.get('origin')!==url.origin)return deny(403,'Open this request from the Catalyst website.');
    if(session&&request.method==='DELETE')return new Response(null,{status:204,headers:{...privateHeaders,'Set-Cookie':COOKIE+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}});
    if(session&&request.method!=='POST')return deny(405,'Use the production sign-in screen.');
    const bearer=(request.headers.get('authorization')||'').match(/^Bearer ([^\s]+)$/)?.[1];
    const saved=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
    const token=session?bearer:saved,auth=await authorize(token);
    if(auth.status!==200)return deny(auth.status,auth.status===403?'This account has not been approved for production access.':auth.status===503?'Access verification is temporarily unavailable. Please try again shortly.':'Sign in with an approved production account to read these works in progress.');
    if(url.pathname.startsWith('/production-admin')&&auth.role!=='admin')return deny(403,'This page requires approved administrator access.');
    if(session)return new Response(JSON.stringify({approved:true,role:auth.role}),{status:200,headers:{...privateHeaders,'Content-Type':'application/json','Set-Cookie':COOKIE+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900'}});
    if(/^\/read\/issue-[12](?:[./-]|$)/.test(url.pathname))return new Response(null,{status:302,headers:{...privateHeaders,Location:'/production-reader/#issue-'+(url.pathname.includes('issue-2')?'2':'1')+'-page-1'}});
    const response=await context.next(),headers=new Headers(response.headers);
    Object.entries(privateHeaders).forEach(([k,v])=>headers.set(k,v));
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }catch(_){return deny(503,'We could not verify access. Please try again shortly.');}
}
export const config={path:['/production-session','/production-reader','/production-reader/*','/production-admin','/production-admin/*','/read/*','/private/*','/script-studio','/script-studio/*'],onError:'fail'};
