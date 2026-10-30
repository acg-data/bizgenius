// Preserve the live app's domains, environment, resources, and routes. Replace only its image sources.
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
const env=process.env, base='https://api.digitalocean.com/v2';
const call=async(path,method='GET',body)=>{
  const response=await fetch(base+path,{method,headers:{Authorization:`Bearer ${env.DIGITALOCEAN_ACCESS_TOKEN}`,'content-type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`DigitalOcean ${method} failed: HTTP ${response.status}`);
  return response.json();
};
const {registry}=await call('/registry');
if(!/^[a-z0-9-]+$/.test(registry?.name))throw new Error('A DigitalOcean Container Registry is required; none was created automatically.');
const directory=await mkdtemp(join(tmpdir(),'bizgenius-registry-'));
try {
  const authfile=join(directory,'auth.json');
  await writeFile(authfile,JSON.stringify({auths:{[env.CI_REGISTRY]:{auth:Buffer.from(`${env.CI_REGISTRY_USER}:${env.CI_REGISTRY_PASSWORD}`).toString('base64')},'registry.digitalocean.com':{auth:Buffer.from(`${env.DIGITALOCEAN_ACCESS_TOKEN}:${env.DIGITALOCEAN_ACCESS_TOKEN}`).toString('base64')}}}),{mode:0o600});
  for(const part of ['backend','frontend'])await new Promise((resolve,reject)=>{
    const child=spawn('skopeo',['copy','--authfile',authfile,`docker://${env.CI_REGISTRY_IMAGE}/${part}:${env.CI_COMMIT_SHA}`,`docker://registry.digitalocean.com/${registry.name}/${env.CI_PROJECT_NAME}-${part}:${env.CI_COMMIT_SHA}`],{stdio:'inherit'});
    child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(`Image mirror exited ${code}`)));
  });
} finally {await rm(directory,{recursive:true,force:true});}
const {app}=await call(`/apps/${encodeURIComponent(env.APP_ID)}`);const spec=structuredClone(app.spec);
let changed=0;
for(const field of ['services','workers','jobs','static_sites'])for(const component of spec[field]||[]){
  if(!['backend','frontend'].includes(component.name))continue;
  for(const key of ['github','gitlab','git','dockerfile_path','source_dir','build_command'])delete component[key];
  component.image={registry_type:'DOCR',registry:registry.name,repository:`${env.CI_PROJECT_NAME}-${component.name}`,tag:env.CI_COMMIT_SHA,deploy_on_push:{enabled:false}};
  changed++;
}
if(!changed)throw new Error('No known backend/frontend components in the live app; refusing to change an unknown specification.');
await call(`/apps/${encodeURIComponent(env.APP_ID)}`,'PUT',{spec});
const {deployment}=await call(`/apps/${encodeURIComponent(env.APP_ID)}/deployments`,'POST',{force_build:false});
for(let i=0;i<120;i++){
  const state=(await call(`/apps/${encodeURIComponent(env.APP_ID)}/deployments/${deployment.id}`)).deployment.phase;
  if(state==='ACTIVE'){console.log('DigitalOcean deployment is ACTIVE.');process.exit(0);}
  if(['ERROR','CANCELED','SUPERSEDED'].includes(state))throw new Error(`DigitalOcean deployment ${state}`);
  await new Promise(resolve=>setTimeout(resolve,5000));
}
throw new Error('Timed out waiting for DigitalOcean deployment.');
