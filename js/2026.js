// Intraform 2026 — clean interactions
document.addEventListener('DOMContentLoaded',()=>{

  // Scroll reveal — scale + translateY
  const els = document.querySelectorAll('[data-reveal]')
  if(els.length){
    const o = new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target)}})
    },{rootMargin:'0px 0px -60px 0px',threshold:.1})
    els.forEach(el=>o.observe(el))
  }

  // Nav hide/show on scroll
  const nav = document.querySelector('.nav')
  if(nav){
    let ls=0
    window.addEventListener('scroll',()=>{
      const cs=window.scrollY
      if(cs>150) nav.style.transform=cs>ls?'translateY(-120%)':'translateY(0)'
      else nav.style.transform='translateY(0)'
      nav.style.transition='transform .35s cubic-bezier(0.16,1,0.3,1)'
      ls=cs
    })
  }
})