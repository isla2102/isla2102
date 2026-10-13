(() => {
  const links = [...document.querySelectorAll('.g-aside nav a')];
  const sections = [...document.querySelectorAll('.g-block')];
  const setCurrent = id => links.forEach(link => {
    if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  let scheduled = false;
  const update = () => {
    const current = sections.filter(section => section.getBoundingClientRect().top < innerHeight * .4).at(-1);
    setCurrent(current ? current.id : '');
    scheduled = false;
  };
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, {passive:true});
  links.forEach(link => link.addEventListener('click', () => setCurrent(link.hash.slice(1))));
  update();
})();
