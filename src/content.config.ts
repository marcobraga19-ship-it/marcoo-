import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const projects = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/projects' }),
  schema: ({ image }) => {
    const media = z.object({ src: image(), alt: z.string().min(1), caption: z.string().default('') });
    return z.object({
      slug: z.string(), title: z.string(), subtitle: z.string(),
      type: z.enum(['architecture','interior','photography','visual','sound']),
      number: z.string().default(''), year: z.string().default(''), yearNote: z.string().optional(),
      location: z.string().default(''), order: z.number(), archive: z.boolean().default(false),
      cover: image().optional(), summary: z.string().default(''),
      sourcePages: z.string().optional(), descriptionStatus: z.string().optional(),
      blocks: z.array(z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), text: z.string(), title: z.string().optional() }),
        media.extend({ type: z.literal('image') }),
        media.extend({ type: z.literal('drawing') }),
        z.object({ type: z.literal('gallery'), images: z.array(media).min(1) }),
        z.object({ type: z.literal('video'), src: z.string().min(1), caption: z.string(), poster: image().optional(), transcript: z.string().optional() }),
        z.object({ type: z.literal('audio'), src: z.string().min(1), title: z.string(), transcript: z.string().optional() })
      ]))
    });
  }
});
export const collections = { projects };
