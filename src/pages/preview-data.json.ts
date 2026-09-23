import { loadProjects } from '../lib/projects';
export async function GET(){return new Response(JSON.stringify(await loadProjects()),{headers:{'Content-Type':'application/json'}});}
