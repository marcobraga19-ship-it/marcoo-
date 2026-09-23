import { useEffect, useRef, useState } from 'react';

export const SCENES = {
 home: 'https://prod.spline.design/7qFqfBQ8f2h65fhd/scene.splinecode',
 interiors: 'https://prod.spline.design/pZWQ3IsNG4BMm9Bh/scene.splinecode',
 archive: 'https://prod.spline.design/r0ejOtfenr4wyggd/scene.splinecode',
};
export const sceneForProject = project => project.archive ? SCENES.archive
 : ['interior', 'architecture'].includes(project.type) ? SCENES.interiors : null;

// One scene per visible surface; an idle or hidden page does not keep animating.
export default function SplineScene({ scene }) {
 const canvasRef = useRef(null);
 const [state, setState] = useState('loading');
 useEffect(() => {
  if (!scene) return;
  const canvas = canvasRef.current;
  const surface = canvas.closest('.motion-surface');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  let app, disposed = false, ready = false, idle = 0, frame = 0;
  const pause = () => { clearTimeout(idle); if (ready) { app.stop(); canvas.dataset.motion = "idle"; } };
  const wake = () => {
   if (!ready || reduced.matches || document.hidden) return;
   if (app.isStopped) app.play(); canvas.dataset.motion = "active"; clearTimeout(idle); idle = setTimeout(pause, 650);
  };
  const visibility = () => { if (document.hidden) pause(); };
  const preference = () => { if (reduced.matches) pause(); else if (!app) load(); };
  const events = ['pointermove', 'pointerdown', 'touchmove', 'wheel', 'keydown'];
  async function load() {
   if (disposed || reduced.matches || app) return;
   try {
    const { Application } = await import('@splinetool/runtime');
    if (disposed || reduced.matches || app) return;
    // Scenes supplied as embeds: keep their optional HTML isolated from the site.
    app = new Application(canvas, { htmlContentMode: 'sandbox', renderer: 'webgl', renderMode: 'auto' });
    await app.load(scene, undefined, { signal: abort.signal });
    if (disposed) return;
    app.setBackgroundColor('#000000');
    app.setGlobalEvents(true);
    ready = true;
    setState('ready');
    // Present the initial scene, then let the user's gestures drive it.
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(pause); });
   } catch (error) {
    if (!disposed) { ready = false; setState('unavailable'); console.warn('Spline scene unavailable:', scene, error); app?.dispose(); app = null; }
   }
  }
  setState('loading');
  events.forEach(type => surface.addEventListener(type, wake, { passive: true }));
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', preference);
  load();
  return () => {
   disposed = true; ready = false; abort.abort(); clearTimeout(idle); cancelAnimationFrame(frame);
   events.forEach(type => surface.removeEventListener(type, wake));
   document.removeEventListener('visibilitychange', visibility);
   reduced.removeEventListener('change', preference);
   app?.dispose();
  };
 }, [scene]);
 if (!scene) return null;
 return <div className="spline-scene" data-scene={scene} data-state={state} aria-hidden="true">
  <canvas ref={canvasRef} tabIndex={-1}/>
 </div>;
}
