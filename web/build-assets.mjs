import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.dirname(new URL(import.meta.url).pathname);
const base=new URL('.',import.meta.url);
const assets=JSON.parse(await fs.readFile(new URL('asset-sources.json',base)));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
await fs.mkdir(new URL('assets/',base),{recursive:true});
for(let i=0;i<assets.length;i+=10)await Promise.all(assets.slice(i,i+10).map(async a=>{
 const dest=new URL(a.file,base);
 try{const b=await fs.readFile(dest);if(hash(b)===a.sha256)return;}catch{}
 if(a.checkedIn)throw Error('Missing checked-in stylesheet: '+a.file);
 let last;
 for(let attempt=0;attempt<3;attempt++)try{
   const r=await fetch(a.url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('HTTP '+r.status);
   const b=Buffer.from(await r.arrayBuffer());if(hash(b)!==a.sha256)throw Error('Asset changed: '+a.url);
   await fs.writeFile(dest,b);return;
 }catch(e){last=e;}
 throw last;
}));
console.log('Verified '+assets.length+' local assets.');
