import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.marcobraga.net',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  integrations: [react()],
  vite: process.env.LOCAL_BUILD_WITHOUT_SCAN ? { plugins: [{name:'local-sandbox-build',configResolved(config){config.optimizeDeps.include=[];config.optimizeDeps.noDiscovery=true;config.optimizeDeps.entries=[];if(config.ssr?.optimizeDeps){config.ssr.optimizeDeps.include=[];config.ssr.optimizeDeps.noDiscovery=true;}}}] } : {},
});
