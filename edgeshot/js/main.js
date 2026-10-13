/* Microsoft Store 제품 페이지 URL.
   비어 있으면 "출시 예정" 상태(버튼은 CTA 섹션으로 이동, 아이콘 숨김).
   출시 후 URL을 넣으면 모든 다운로드 버튼이 스토어로 연결되고 data-launch-label 문구로 바뀝니다.
   (CTA 섹션 제목·본문의 "곧 만나요" 문구는 출시 때 직접 수정) */
const EDGESHOT_STORE_URL = "";
if (EDGESHOT_STORE_URL) {
  document.querySelectorAll("[data-store-link]").forEach(el => {
    el.href = EDGESHOT_STORE_URL;
    el.target = "_blank";
    el.rel = "noopener";
    el.classList.remove("is-coming-soon");
    el.removeAttribute("aria-disabled");
    el.querySelectorAll("[data-launch-label]").forEach(label => { label.textContent = label.dataset.launchLabel; });
  });
}

const EDGESHOT_ASSETS = {
  toolbarLight: "assets/icons/embedded-a9172568a725.svg"
};
document.querySelectorAll("[data-asset]").forEach(el => {
  el.src = EDGESHOT_ASSETS[el.dataset.asset];
});



(() => {
  const header=document.getElementById('header');
  const sections=[...document.querySelectorAll('main>section')];
  const progress=document.getElementById('progress');
  const topBtn=document.getElementById('topBtn');
  const menu=document.getElementById('nav');
  const toggle=document.getElementById('menuToggle');


  const viewportSize=document.getElementById('viewportSize');
  const viewportMode=document.getElementById('viewportMode');
  const viewportRule=document.getElementById('viewportRule');

  const viewportQueries={
    mobile:matchMedia('(max-width:599px)'),
    tabletPortrait:matchMedia('(min-width:600px) and (max-width:899px)'),
    tabletLandscape:matchMedia('(min-width:900px) and (max-width:1199px)'),
    desktop:matchMedia('(min-width:1200px)')
  };

  const getViewportMode=()=>{
    if(viewportQueries.desktop.matches) return {mode:'Desktop',rule:'width >= 1200px'};
    if(viewportQueries.tabletLandscape.matches) return {mode:'Tablet - Landscape',rule:'900-1199px'};
    if(viewportQueries.tabletPortrait.matches) return {mode:'Tablet - Portrait',rule:'600-899px'};
    return {mode:'Mobile',rule:'width < 600px'};
  };

  const updateViewportSize=()=>{
    const w=document.documentElement.clientWidth;
    const h=document.documentElement.clientHeight;
    const info=getViewportMode();

    viewportSize.textContent=`${w} × ${h}px`;
    viewportMode.textContent=info.mode;
    viewportRule.textContent=info.rule;
  };

  updateViewportSize();
  window.addEventListener('resize',updateViewportSize,{passive:true});
  window.addEventListener('orientationchange',updateViewportSize,{passive:true});



  const initCarousel=(root)=>{
    const track=root.querySelector('.carousel-track');
    const items=[...track.children];
    const prev=root.querySelector('.carousel-arrow.prev');
    const next=root.querySelector('.carousel-arrow.next');
    let index=0;
    let wasMobile=viewportQueries.mobile.matches;

    const setItemState=(enabled)=>{
      items.forEach((item,itemIndex)=>{
        const isActive=enabled&&itemIndex===index;
        const isPreview=enabled&&Math.abs(itemIndex-index)===1;
        item.classList.toggle('is-carousel-active',isActive);
        item.classList.toggle('is-carousel-preview',isPreview);
        if(enabled){
          item.setAttribute('aria-hidden',String(!isActive));
          if(isActive) item.setAttribute('aria-current','true');
          else item.removeAttribute('aria-current');
        }else{
          item.removeAttribute('aria-hidden');
          item.removeAttribute('aria-current');
        }
      });
    };

    const update=()=>{
      const isMobile=viewportQueries.mobile.matches;
      if(isMobile&&!wasMobile) index=0;
      wasMobile=isMobile;

      if(!isMobile){
        track.style.transform='';
        setItemState(false);
        prev.disabled=true;
        next.disabled=true;
        return;
      }

      const activeItem=items[index];
      if(!activeItem) return;
      const itemCenter=activeItem.offsetLeft+activeItem.offsetWidth/2;
      const centeredOffset=root.clientWidth/2-itemCenter;
      track.style.transform=`translateX(${centeredOffset}px)`;
      setItemState(true);
      prev.disabled=index===0;
      next.disabled=index===items.length-1;
    };

    prev.addEventListener('click',()=>{if(index>0){index--;update();}});
    next.addEventListener('click',()=>{if(index<items.length-1){index++;update();}});
    window.addEventListener('resize',update,{passive:true});
    update();
  };

  document.querySelectorAll('.mobile-carousel').forEach(initCarousel);
const getHeaderHeight=()=>viewportQueries.desktop.matches?56:(viewportQueries.mobile.matches?48:52);
  /* Snap each section's top to the viewport top. Sections are at least one viewport tall and
     reserve the fixed header height in their own padding (see "Fixed header offset" CSS),
     so the content stays centered in the area below the header. */
  const getSectionTarget=section=>{
    const top=window.scrollY+section.getBoundingClientRect().top;
    const maxScroll=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
    return Math.min(maxScroll,Math.max(0,top));
  };
  const getClosestSectionIndex=()=>{
    const y=window.scrollY;
    let closest=0;
    let distance=Infinity;
    sections.forEach((section,index)=>{
      const nextDistance=Math.abs(getSectionTarget(section)-y);
      if(nextDistance<distance){distance=nextDistance;closest=index;}
    });
    return closest;
  };
  let headerPeek=false;
  const updateHeaderVisibility=index=>{
    if(!viewportQueries.desktop.matches||index===0){
      header.classList.remove('hidden');
      return;
    }
    header.classList.toggle('hidden',!headerPeek);
  };
  const updateProgress=index=>{
    dots.forEach((dot,i)=>{
      dot.classList.toggle('active',i===index);
      dot.classList.toggle('visited',i<index);
      dot.setAttribute('aria-current',i===index?'step':'false');
    });
    updateHeaderVisibility(index);
  };
  const prefersReducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollToSection=(index,behavior=prefersReducedMotion()?'auto':'smooth')=>{
    const next=Math.max(0,Math.min(sections.length-1,index));
    headerPeek=false;
    window.scrollTo({top:getSectionTarget(sections[next]),behavior});
    updateProgress(next);
    return next;
  };

  sections.forEach((section,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.title=section.dataset.title||`Section ${index+1}`;
    button.setAttribute('aria-label',button.title);
    button.addEventListener('click',()=>scrollToSection(index));
    progress.appendChild(button);
  });
  const dots=[...progress.children];
  updateProgress(getClosestSectionIndex());

  let progressFrame=0;
  const syncProgress=()=>{
    if(progressFrame) return;
    progressFrame=requestAnimationFrame(()=>{
      progressFrame=0;
      updateProgress(getClosestSectionIndex());
    });
  };

  /* Section wheel paging.
     - Accumulate wheel delta; move one section once it reaches WHEEL_THRESHOLD
       (one mouse-wheel notch ~100px moves at once, a light trackpad touch does not).
     - After moving, stay locked for at least WHEEL_LOCK_MS and until the wheel input
       has been quiet for WHEEL_QUIET_MS, so trackpad inertia cannot skip a section. */
  const WHEEL_THRESHOLD=50;
  const WHEEL_LOCK_MS=800;
  const WHEEL_QUIET_MS=150;
  let wheelLocked=false;
  let wheelLockUntil=0;
  let wheelAccum=0;
  let wheelQuietTimer=0;
  window.addEventListener('wheel',event=>{
    if(viewportQueries.mobile.matches||event.ctrlKey) return;
    event.preventDefault();
    clearTimeout(wheelQuietTimer);
    wheelQuietTimer=setTimeout(()=>{
      wheelAccum=0;
      if(wheelLocked) wheelQuietTimer=setTimeout(()=>{wheelLocked=false;},Math.max(0,wheelLockUntil-performance.now()));
    },WHEEL_QUIET_MS);
    if(wheelLocked) return;
    wheelAccum+=event.deltaMode===1?event.deltaY*40:event.deltaY;
    if(Math.abs(wheelAccum)<WHEEL_THRESHOLD) return;
    const direction=wheelAccum>0?1:-1;
    wheelAccum=0;
    const next=getClosestSectionIndex()+direction;
    if(next<0||next>=sections.length) return;
    wheelLocked=true;
    wheelLockUntil=performance.now()+WHEEL_LOCK_MS;
    scrollToSection(next);
  },{passive:false});

  window.addEventListener('resize',()=>{
    wheelLocked=false;
    syncProgress();
  },{passive:true});

  window.addEventListener('scroll',()=>{
    const y=scrollY;
    syncProgress();
    topBtn.classList.toggle('show',y>220);
    liftTopButton();
    header.classList.toggle('raised',y>8);
  },{passive:true});
  document.addEventListener('mousemove',event=>{
    if(!viewportQueries.desktop.matches) return;
    const index=getClosestSectionIndex();
    headerPeek=index>0&&event.clientY<=getHeaderHeight();
    updateHeaderVisibility(index);
  },{passive:true});
  window.addEventListener('blur',()=>{
    headerPeek=false;
    updateHeaderVisibility(getClosestSectionIndex());
  });

  /* Hero CTA placement (900px+): keep the buttons in the copy column while copy + buttons
     fit within the mockup height; otherwise move buttons + meta to a row under both. */
  const hero=document.getElementById('hero');
  const heroCopy=hero.querySelector('.hero-copy');
  const heroActions=hero.querySelector('.hero-cta .actions');
  const heroMockup=hero.querySelector('.hero-mockup-frame');
  function placeHeroCta(){
    if(window.innerWidth<900){hero.classList.remove('is-cta-below');return;}
    const rowGap=parseFloat(getComputedStyle(heroCopy.parentElement).rowGap)||0;
    const needed=heroCopy.offsetHeight+rowGap+heroActions.offsetHeight;
    hero.classList.toggle('is-cta-below',needed>heroMockup.offsetHeight);
  }
  window.addEventListener('resize',placeHeroCta,{passive:true});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(placeHeroCta);
  placeHeroCta();

  /* Keep the floating top button above the footer so it never covers footer text */
  const footer=document.querySelector('.footer');
  function liftTopButton(){
    const gap=16;
    const buttonBottom=window.innerHeight-parseFloat(getComputedStyle(topBtn).bottom);
    const lift=Math.max(0,buttonBottom-(footer.getBoundingClientRect().top-gap));
    topBtn.style.transform=lift?`translateY(${-lift}px)`:'';
  }
  window.addEventListener('resize',liftTopButton,{passive:true});
  liftTopButton();
  topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:prefersReducedMotion()?'auto':'smooth'}));
  toggle.addEventListener('click',()=>{
    const open=menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
  });
  menu.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
    const section=document.querySelector(link.getAttribute('href'));
    const index=sections.indexOf(section);
    menu.classList.remove('open');
    if(index<0) return;
    event.preventDefault();
    scrollToSection(index);
  }));
})();
