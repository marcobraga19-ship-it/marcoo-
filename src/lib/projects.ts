import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
export async function loadProjects() {
  const entries = (await getCollection('projects')).sort((a,b) => a.data.order-b.data.order);
  const cache = new Map();
  async function resolve(src: any) {
    if (!src) return undefined;
    if(src.format==='svg') return {src:src.src,thumb:src.src,width:src.width,height:src.height};
    if (cache.has(src.src)) return cache.get(src.src);
    const work = (async () => {
      const small = await getImage({ src, width: Math.min(640,src.width), format:'webp', quality:85 });
      const medium = await getImage({ src, width: Math.min(1280,src.width), format:'webp', quality:90 });
      return { src:src.src, thumb:small.src, width:src.width, height:src.height,
        srcSet:`${small.src} ${small.options.width}w, ${medium.src} ${medium.options.width}w, ${src.src} ${src.width}w` };
    })();
    cache.set(src.src,work); return work;
  }
  return Promise.all(entries.map(async ({data}) => ({...data,
    cover:await resolve(data.cover),
    blocks:await Promise.all(data.blocks.map(async (b:any) => {
      if (b.type==='gallery') return {...b,images:await Promise.all(b.images.map(async (m:any)=>({...m,asset:await resolve(m.src),src:undefined})))};
      if (b.type==='image'||b.type==='drawing') return {...b,asset:await resolve(b.src),src:undefined};
      if (b.type==='video') return {...b,poster:await resolve(b.poster)};
      return b;
    }))
  })));
}
