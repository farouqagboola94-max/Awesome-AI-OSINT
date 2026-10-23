(()=>{'use strict';
 const status=document.getElementById('access-status'),form=document.getElementById('production-login');
 const sb=window.supabase?.createClient('https://oxnpmgbwwsjfseirfxej.supabase.co','sb_publishable_Ac7QJhrz4teLLONsAoU1_Q_MT6o9Yk4',{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,storageKey:'catalystverse-auth-oxnpmgbwwsjfseirfxej'}});
 function say(text){status.textContent=text;}
 async function open(){
  if(!sb)throw Error('Sign-in is unavailable. Please reload.');
  const {data,error}=await sb.auth.getSession();if(error||!data.session)throw Error('Sign in with your approved production account.');
  const res=await fetch('/production-session',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token}});
  if(!res.ok)throw Error(res.status===403?'Your account is signed in, but has not been approved for production access.':res.status===401?'Your session expired. Sign in again.':'Access verification is temporarily unavailable.');
  location.assign('/production-reader/');
 }
 form.addEventListener('submit',async e=>{e.preventDefault();const button=document.getElementById('sign-in');button.disabled=true;say('Verifying your account…');try{if(!sb)throw Error('Sign-in is unavailable. Please reload.');const {error}=await sb.auth.signInWithPassword({email:document.getElementById('email').value.trim(),password:document.getElementById('password').value});if(error)throw Error('Sign-in failed. Check your email and password.');document.getElementById('password').value='';await open();}catch(e){say(e.message);}finally{button.disabled=false;}});
 document.getElementById('use-session').addEventListener('click',()=>open().catch(e=>say(e.message)));
})();
