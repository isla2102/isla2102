(()=>{
  const capture=document.querySelector('.hero-capture');
  const annotation=document.querySelector('.annotation');
  if(!capture||!annotation) return;

  const updateAnnotationPosition=()=>{
    annotation.classList.remove('is-relocated');
    const captureRect=capture.getBoundingClientRect();
    const annotationRect=annotation.getBoundingClientRect();
    const sunX=captureRect.left+captureRect.width*Number(capture.dataset.sunX);
    const sunY=captureRect.top+captureRect.height*Number(capture.dataset.sunY);
    const protectX=captureRect.width*.045;
    const protectY=captureRect.height*.075;
    const overlapsSun=
      annotationRect.right>sunX-protectX&&
      annotationRect.left<sunX+protectX&&
      annotationRect.bottom>sunY-protectY&&
      annotationRect.top<sunY+protectY;

    annotation.classList.toggle('is-relocated',captureRect.width<560&&overlapsSun);
  };

  new ResizeObserver(updateAnnotationPosition).observe(capture);
  document.fonts?.ready.then(updateAnnotationPosition);
  window.addEventListener('load',updateAnnotationPosition,{once:true});
})();
