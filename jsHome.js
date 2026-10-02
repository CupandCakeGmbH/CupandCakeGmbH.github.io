(() => {
    const root = new URL('.', document.currentScript.src);
    const slides = [{ src: new URL('Bilder/plakat.png', root).href, alt: 'Plakat Cup and Cake' }];
    const container = document.getElementById('slidesContainer');
    const loader = document.getElementById('slideshow-loader');
    const slideshow = document.getElementById('slideshow');
    const previous = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if (!container || !slideshow) return;
    let current = 0;
    let timer;
    const render = () => container.querySelectorAll('.slide').forEach((slide, index) => slide.classList.toggle('is-active', index === current));
    const stop = () => clearInterval(timer);
    const start = () => {
        stop();
        if (slides.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden) {
            timer = setInterval(() => { current = (current + 1) % slides.length; render(); }, 8000);
        }
    };
    const move = direction => { current = (current + direction + slides.length) % slides.length; render(); start(); };
    let loaded = 0;
    const complete = () => {
        loaded++;
        if (loaded === slides.length) { loader?.classList.add('hidden'); slideshow.classList.add('visible'); }
    };
    for (const slide of slides) {
        const element = document.createElement('div');
        element.className = 'slide';
        const image = document.createElement('img');
        image.alt = slide.alt;
        image.loading = 'eager';
        image.addEventListener('load', complete, { once: true });
        image.addEventListener('error', complete, { once: true });
        image.src = slide.src;
        element.append(image);
        container.append(element);
    }
    previous.hidden = next.hidden = slides.length < 2;
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    slideshow.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    });
    slideshow.addEventListener('mouseenter', stop);
    slideshow.addEventListener('mouseleave', start);
    slideshow.addEventListener('focusin', stop);
    slideshow.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    render();
    start();
})();
