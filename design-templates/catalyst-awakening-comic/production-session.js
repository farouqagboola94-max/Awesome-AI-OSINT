/* Renew the HttpOnly production perimeter from the verified account SDK. */
(()=>{'use strict';
 const sb=window.supabase?.createClient('https://oxnpmgbwwsjfseirfxej.supabase.co','sb_publishable_Ac7QJhrz4teLLONsAoU1_Q_MT6o9Yk4',{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,storageKey:'catalystverse-auth-oxnpmgbwwsjfseirfxej'}});
 let pending=false;
 async function renew(){if(pending)return;pending=true;try{const {data,error}=await sb.auth.getSession();if(error||!data.session)throw Error('session');const r=await fetch('/production-session',{method:'POST',cache:'no-store',credentials:'same-origin',headers:{Authorization:'Bearer '+data.session.access_token}});if(!r.ok)throw Error('access');}catch(_){location.replace('/production-access.html');}finally{pending=false;}}
 if(!sb){location.replace('/production-access.html');return;}
 document.getElementById('production-sign-out')?.addEventListener('click',async()=>{try{await fetch('/production-session',{method:'DELETE',credentials:'same-origin'});await sb.auth.signOut({scope:'local'});}finally{location.replace('/production-access.html');}});
 sb.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')location.replace('/production-access.html');});
 setInterval(renew,300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)renew();});
})();
