import { useEffect, useRef, useState, useCallback } from 'react';
import SplineScene, { sceneForProject, SCENES } from './SplineScene.jsx';
import OpeningSequence from './OpeningSequence.jsx';
const labels={architecture:'Architecture',interior:'Interior design',photography:'Photography',visual:'Visual arts',sound:'Sound'};
const base=import.meta.env.BASE_URL || '/';
function Letters({text,as:Tag='span',className=''}) { return <Tag className={className}>{text}</Tag>; }
// SVG paths keep arrows monochrome on every platform, including mobile.
function Arrow({direction='right'}) {
 const paths={right:'M4 12h16m-7-7 7 7-7 7',left:'M20 12H4m7-7-7 7 7 7',diagonal:'M5 19 19 5M5 5h14v14'};
 return <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}><path d={paths[direction]}/></svg>;
}
// Shared gesture controller. No frames are requested when the surface is idle.
function useHorizontal(ref,enabled=true) {
 const api=useRef({go:()=>{},step:()=>{}});
 useEffect(()=>{
  const el=ref.current;if(!el||!enabled)return;
  const root=el.closest('.motion-surface'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,timer=0,target=el.scrollLeft,drag=null,last=el.scrollLeft,lastTime=0,native=false,ignoreClick=false,settled=true;
  const module=()=>innerWidth<820?60:84,max=()=>Math.max(0,el.scrollWidth-el.clientWidth),clamp=v=>Math.min(max(),Math.max(0,v));
  const paint=()=>{};
  const tick=time=>{
   const dt=lastTime?Math.min(40,time-lastTime):16.67;lastTime=time;
   if(!native&&!drag){const a=reduce.matches?1:1-Math.pow(1-.085,dt/16.67);el.scrollLeft=clamp(el.scrollLeft+(target-el.scrollLeft)*a);}
   paint(el.scrollLeft-last);last=el.scrollLeft;
   if(!native&&!drag&&Math.abs(target-el.scrollLeft)<8){el.scrollLeft=target;paint(0);frame=0;settled=true;lastTime=0;return;}
   if(native){frame=0;lastTime=0;return;}frame=requestAnimationFrame(tick);
  };
  const start=()=>{settled=false;if(!frame)frame=requestAnimationFrame(tick);};
  const snap=()=>{native=false;target=clamp(Math.round((drag?el.scrollLeft:target)/module())*module());start();};
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>{target=el.scrollLeft;snap();},160);};
  const go=v=>{native=false;clearTimeout(timer);target=clamp(Math.round(v/module())*module());start();};
  api.current={go,step:d=>go(el.scrollLeft+d*(innerWidth<820?300:420))};
  const wheel=e=>{
   if(e.ctrlKey||e.target.closest('audio,video,input,textarea,select'))return;e.preventDefault();native=false;
   const d=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?21:e.deltaMode===2?el.clientWidth:1);
   if(settled)target=el.scrollLeft;target=clamp(target+d);start();clearTimeout(timer);timer=setTimeout(snap,160);
  };
  const down=e=>{
   if(e.pointerType!=='mouse'){native=true;target=el.scrollLeft;return;}
   if(e.button!==0||e.target.closest('audio,video,input,textarea,select'))return;
   drag={x:e.clientX,left:el.scrollLeft,id:e.pointerId};native=false;target=el.scrollLeft;ignoreClick=false;clearTimeout(timer);el.classList.add('is-dragging');
  };
  const move=e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>5){ignoreClick=true;el.setPointerCapture?.(drag.id);}el.scrollLeft=clamp(drag.left-dx);target=el.scrollLeft;paint(el.scrollLeft-last);last=el.scrollLeft;};
  const up=()=>{if(!drag)return;drag=null;el.classList.remove('is-dragging');snap();};
  const click=e=>{if(ignoreClick){e.preventDefault();e.stopPropagation();ignoreClick=false;}};
  const scroll=()=>{if(native){paint(el.scrollLeft-last);last=el.scrollLeft;schedule();}else if(!frame&&!drag){target=el.scrollLeft;paint(0);}};
  const key=e=>{
   if(e.target.closest('audio,video,input,textarea,select'))return;
   if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();api.current.step(e.key==='ArrowRight'?1:-1);}
   if(e.key==='Home'){e.preventDefault();go(0);}if(e.key==='End'){e.preventDefault();go(max());}
  };
  const layout=()=>{const m=module();root?.style.setProperty('--screen',Math.ceil(innerWidth/m)*m+'px');el.style.paddingRight=el.clientWidth%m+'px';
   for(const block of el.querySelectorAll('.text-block')){block.style.width='';if(innerHeight<=520){const extra=block.scrollWidth-block.clientWidth;if(extra>1)block.style.width=Math.ceil((block.getBoundingClientRect().width+extra+30)/m)*m+'px';}}
   target=clamp(Math.round(el.scrollLeft/m)*m);el.scrollLeft=target;};
  layout();let disposed=false;document.fonts.ready.then(()=>{if(!disposed)layout();});const observer=new ResizeObserver(layout);observer.observe(el);
  const events=[['wheel',wheel,{passive:false}],['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up],['click',click,true],['scroll',scroll,{passive:true}],['keydown',key]];
  events.forEach(args=>el.addEventListener(...args));
  return()=>{disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);observer.disconnect();paint(0);events.forEach(args=>el.removeEventListener(...args));};
 },[enabled]);return api;
}
function Picture({asset,alt='',className='',eager=false,sizes='(max-width: 819px) 100vw, 80vw'}) {
 return asset?<img className={className} src={asset.thumb} srcSet={asset.srcSet} sizes={sizes} width={asset.width} height={asset.height} alt={alt} loading={eager?'eager':'lazy'} decoding="async" draggable="false"/>:null;
}
const mediaURL=src=>/^(https?:)?\//.test(src)?src:base+src.replace(/^\.\//,'');
function AudioBlock({block}){
 const [error,setError]=useState('');
 return <div className="audio-player"><audio preload="metadata" onError={()=>setError('This recording is unavailable.')} src={mediaURL(block.src)} controls aria-label={block.title}/>{error&&<p role="status">{error}</p>}</div>;
}
function MediaBlocks({project}) {
 let imageIndex=0;
 return project.blocks.flatMap((b,i)=>{
  if(b.type==='text')return <section className="block text-block" key={i}>{b.title&&<p className="eyebrow">{b.title}</p>}<p>{b.text}</p></section>;
  if(b.type==='gallery')return b.images.map((m,j)=><figure className={'block media-block gallery-frame '+project.type} key={i+'-'+j}><Picture asset={m.asset} alt={m.alt} eager={imageIndex++===0}/>{m.caption&&<figcaption>{m.caption}</figcaption>}</figure>);
  if(b.type==='image'||b.type==='drawing')return <figure className={'block media-block '+b.type} key={i}><Picture asset={b.asset} alt={b.alt} eager={imageIndex++===0}/>{b.caption&&<figcaption>{b.caption}</figcaption>}</figure>;
  if(b.type==='video')return <figure className="block media-block" key={i}><video controls playsInline preload="none" poster={b.poster?.src} aria-label={b.caption} src={mediaURL(b.src)}/>{b.caption&&<figcaption>{b.caption}</figcaption>}{b.transcript&&<p>{b.transcript}</p>}</figure>;
  if(b.type==='audio')return <section className="block text-block sound-block" key={i}><h2>{b.title}</h2><AudioBlock block={b}/>{b.transcript&&<p>{b.transcript}</p>}</section>;
  return [];
 });
}
function ProjectDialog({project,onClose,dialogRef}){
 const track=useRef(null);const controls=useHorizontal(track,!!project);
 useEffect(()=>{
  const dialog=dialogRef.current;if(!project||!dialog)return;dialog.showModal();track.current.scrollLeft=0;
  return()=>{dialog.querySelectorAll('audio,video').forEach(m=>m.pause());if(dialog.open)dialog.close();};
 },[project?.slug]);
 if(!project)return null;
 return <dialog ref={dialogRef} className="project-dialog motion-surface" aria-labelledby="detail-title" onCancel={e=>{e.preventDefault();onClose();}}>
  <div className="grid" aria-hidden="true"/>
  <SplineScene key={project.slug} scene={sceneForProject(project)}/>
  <header className="detail-header"><button onClick={onClose} autoFocus aria-label="Close project and return to portfolio">Close <span aria-hidden="true">×</span></button><span className="eyebrow">{labels[project.type]}</span><span className="eyebrow detail-header-title">{project.title}</span></header>
  <div ref={track} className="horizontal detail-track" tabIndex={0} aria-label={project.title+', horizontal project sequence'}>
   <section className={'detail-intro block '+project.type}><span className="eyebrow">{project.number&&project.number+' / '}{labels[project.type]}</span><h1 id="detail-title">{project.title}</h1><p className="detail-subtitle">{project.subtitle}</p><p className="detail-meta">{[project.year,project.location].filter(Boolean).join(' — ')}</p><p className="detail-summary">{project.summary}</p></section>
   <MediaBlocks project={project}/><section className="block project-end"><button onClick={onClose}>Back to works <Arrow direction="diagonal"/></button></section>
  </div>
  <footer className="footer"><span className="eyebrow">Scroll to explore</span><div><button onClick={()=>controls.current.step(-1)} aria-label="Previous project column"><Arrow direction="left"/></button><button onClick={()=>controls.current.step(1)} aria-label="Next project column"><Arrow/></button></div></footer>
 </dialog>;
}
export default function Portfolio({projects,initialSlug='',standalone=false}) {
 const track=useRef(null),dialog=useRef(null),returnFocus=useRef(null),pushed=useRef(false);
 const [active,setActive]=useState(()=>projects.find(p=>p.slug===initialSlug)||null),[section,setSection]=useState('opening');
 const controls=useHorizontal(track,!active);
 const close=useCallback(()=>{if(pushed.current){history.back();return;}history.replaceState(null,'',base);setActive(null);requestAnimationFrame(()=>returnFocus.current?.focus({preventScroll:true}));},[]);
 useEffect(()=>{
  const sync=()=>{const match=location.hash.match(/^#project\/(.+)$/);const slug=match?decodeURIComponent(match[1]):(location.pathname.includes('/projects/')?initialSlug:'');setActive(projects.find(p=>p.slug===slug)||null);if(!slug){pushed.current=false;requestAnimationFrame(()=>returnFocus.current?.focus({preventScroll:true}));}};
  sync();window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);
  return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
 },[initialSlug]);
 useEffect(()=>{
  const el=track.current;if(!el)return;let raf=0;
  const surface=el.closest('.portfolio'),opening=el.querySelector('.opening'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const smooth=v=>{const n=Math.max(0,Math.min(1,v));return n*n*(3-2*n);};
  const update=()=>{raf=0;
   const progress=Math.max(0,Math.min(1,el.scrollLeft/(opening.offsetWidth||1)));
   // The quote leaves first; the name and navigation enter afterwards, driven only by scroll.
   const reveal=reduce.matches?(progress>=.65?1:0):smooth((progress-.65)/.35);
   surface.style.setProperty('--opening-opacity',reduce.matches?(progress<.65?'1':'0'):String(1-smooth(progress/.65)));
   surface.style.setProperty('--content-reveal',String(reveal));
   surface.style.setProperty('--content-visibility',reveal>0?'visible':'hidden');
   const x=el.scrollLeft+el.clientWidth*.35;let current='opening';for(const s of el.querySelectorAll('[data-section]'))if(s.offsetLeft<=x)current=s.dataset.section;setSection(current);
  };
  const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);};el.addEventListener('scroll',scroll,{passive:true});update();
  const observer=new ResizeObserver(scroll);observer.observe(el);reduce.addEventListener('change',scroll);
  return()=>{el.removeEventListener('scroll',scroll);cancelAnimationFrame(raf);observer.disconnect();reduce.removeEventListener('change',scroll);};
 },[]);
 const open=(e,p)=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();returnFocus.current=e.currentTarget;history.pushState(null,'',base+'#project/'+p.slug);pushed.current=true;setActive(p);};
 const go=id=>{const el=track.current?.querySelector('[data-section="'+id+'"]');if(el)controls.current.go(el.offsetLeft);};
 const card=p=><a className={'project-card '+(p.archive?'archive-card':'')} key={p.slug} href={standalone?base+'#project/'+p.slug:base+'projects/'+p.slug+'/'} onClick={e=>open(e,p)} aria-label={'Open '+p.title}>
   <span className="project-number">{p.number?<Letters text={p.number}/>:<span className="eyebrow">{labels[p.type]}</span>}</span>
   <div className="project-heading"><Letters text={p.title} as="h3"/><p>{p.subtitle}</p></div>
   <div className="project-thumb"><Picture asset={p.cover} alt={p.title} sizes="(max-width:819px) 240px, 336px"/></div>
   <p className="project-summary">{p.summary}</p><div className="project-meta"><span>{p.year}</span><span>{p.location}</span><span aria-hidden="true"><Arrow direction="diagonal"/></span></div>
  </a>;
 return <div className={'portfolio motion-surface '+(active?'has-project':'')}>
  <div className="grid" aria-hidden="true"/>
  {!active&&<SplineScene scene={SCENES.home}/>}
  <header className="header"><button className="home-link" onClick={()=>go('intro')}>Marco Braga</button><nav aria-label="Portfolio"><button aria-current={section==='works'?'page':undefined} onClick={()=>go('works')}>Works</button><button aria-current={section==='archive'?'page':undefined} onClick={()=>go('archive')}>Archive</button><button aria-current={section==='profile'||section==='record'?'page':undefined} onClick={()=>go('profile')}>Profile</button><button aria-current={section==='contact'?'page':undefined} onClick={()=>go('contact')}>Contact</button></nav><span className="eyebrow header-location">Milano, IT</span></header>
  <main ref={track} className="horizontal home-track" tabIndex={0} aria-label="Portfolio, scroll horizontally to explore">
   <OpeningSequence/>
   <section className="intro" data-section="intro" aria-labelledby="intro-name"><div className="intro-name" id="intro-name"><Letters as="h1" text="Marco Braga"/></div><p className="intro-disciplines">Interior design — Photography — Visual arts</p><button className="intro-enter" onClick={()=>go('works')}>Explore works <span aria-hidden="true"><Arrow/></span></button></section>
   <section className="word-panel" data-section="works" aria-label="Works"><span className="eyebrow">Selected projects</span><Letters as="h2" text="Works"/><span className="eyebrow word-bottom">Space / form / experience</span></section>
   {projects.filter(p=>!p.archive).map(card)}
   <section className="word-panel" data-section="archive" aria-label="Archive"><span className="eyebrow">Personal works</span><Letters as="h2" text="Archive"/><span className="eyebrow word-bottom">Photography / visual arts / sound</span></section>
   {projects.filter(p=>p.archive).map(card)}
   <section className="word-panel" data-section="profile" aria-label="Profile"><span className="eyebrow">About</span><Letters as="h2" text="Profile"/></section>
   <section className="profile-panel copy-panel"><h2 className="eyebrow">Marco Braga / Junior Interior Designer</h2><p className="profile-lead">Observing,<br/>interpreting,<br/>transforming.</p><p>Born in Brescia in 2004 and raised in the countryside. I approach design as a way to observe, interpret and transform the world around me.</p><p>My interests span spatial design, photography, digital visual art and sound. I study Interior Design at Politecnico di Milano. In 2026, I joined the Environmental Design department at Kyushu University in Fukuoka and Professor Masaaki Iwamoto’s studio as a research student.</p></section>
   <section className="skills-panel copy-panel"><div><h2 className="eyebrow">Professional</h2><p>Concept-driven<br/>Visual sensitivity<br/>Critical thinking<br/>Initiative<br/>Collaboration<br/>Reliability<br/>Organization</p></div><div><h2 className="eyebrow">Technical</h2><p>Adobe Creative Suite<br/>Rhinoceros 3D / Archicad<br/>Revit / AutoCAD<br/>Twinmotion / AI Prompting</p></div><div><h2 className="eyebrow">Languages</h2><p>Italian — Native<br/>English — Fluent / IELTS Academic C1<br/>Japanese — Basic</p></div></section>
   <section className="word-panel" data-section="record" aria-label="Record"><span className="eyebrow">Education & experience</span><Letters as="h2" text="Record"/></section>
   <section className="record-panel copy-panel"><h2 className="eyebrow">Education</h2><div className="record"><span>2026</span><p>Exchange Program<br/>Environmental Design<br/>Kyushu University, Fukuoka</p><p className="award">+ Ando Prize</p></div><div className="record"><span>2023 — now</span><p>Interior Design / Bachelor’s Degree<br/>Politecnico di Milano</p><p className="award">+ Best First-Year Student Award, 2023</p></div><div className="record"><span>2018 — 2023</span><p>Scientific High School<br/>Francesco Gonzaga Institute<br/>Castiglione delle Stiviere</p></div></section>
   <section className="record-panel copy-panel"><h2 className="eyebrow">Experience</h2><div className="record"><span>2026</span><p>Research student<br/>Professor Masaaki Iwamoto’s studio<br/>Fukuoka, Japan</p></div><div className="record"><span>2024</span><p>Personal exhibition / Visual arts<br/>Carpenedolo, Italy</p></div><div className="record"><span>2022</span><p>Internship / Fenaroli Photographic Studio<br/>Montichiari, Italy</p></div></section>
   <section className="contact-panel" data-section="contact"><span className="eyebrow">Get in touch / Milano, Italy</span><Letters as="h2" text="Contact"/><div className="contact-links"><a href="https://www.instagram.com/marcoobraga/" target="_blank" rel="noreferrer">@marcoobraga</a><a href="tel:+393494241959">+39 349 424 1959</a></div></section>
  </main>
  <footer className="footer"><span className="eyebrow scroll-hint"><span className="desktop-hint">Scroll / drag to explore</span><span className="mobile-hint">Swipe to explore</span></span><div><button onClick={()=>controls.current.step(-1)} aria-label="Previous column"><Arrow direction="left"/></button><button onClick={()=>controls.current.step(1)} aria-label="Next column"><Arrow/></button></div></footer>
  <ProjectDialog project={active} onClose={close} dialogRef={dialog}/>
 </div>;
}
