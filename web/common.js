const cfg = window.MF_CONFIG;
export const db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
window.DOMPurify.addHook('afterSanitizeAttributes', node => {
  if(node.tagName==='IFRAME'){
    try {const u=new URL(node.getAttribute('src'));if(u.protocol!=='https:'||!['www.youtube.com','www.youtube-nocookie.com'].includes(u.hostname)||!u.pathname.startsWith('/embed/'))node.remove();else{node.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');node.setAttribute('referrerpolicy','strict-origin-when-cross-origin');}}catch{node.remove();}
  }
  if(node.tagName==='FORM'){node.removeAttribute('action');node.removeAttribute('target');}
});
export const clean = (html) =>
  DOMPurify.sanitize(html, { ADD_ATTR: ["target", "allowfullscreen", "allow", "controls", "playsinline", "preload"], ADD_TAGS: ["iframe"], FORBID_TAGS: ["style", "script"] });
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
