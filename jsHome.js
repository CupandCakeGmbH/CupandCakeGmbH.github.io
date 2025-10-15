    const slides = [
      { src: "Bilder/oreo.webp", alt: "Slide 1" },
      { src: "Bilder/Kokus.webp", alt: "Slide 4" }
    ];
        const INTERVAL_MS = 8000; // Zeit zwischen Slides
        const AUTOPLAY = true;

        // ===== Elemente =====
        const slidesContainer = document.getElementById('slidesContainer');
        const loader = document.getElementById('slideshow-loader');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const slideshow = document.getElementById('slideshow');

        let current = 0;
        let timerId = null;
        let isPaused = false;

        // ===== Funktionen =====
        function buildSlides() {
            slidesContainer.innerHTML = '';
            slides.forEach((s, i) => {
                const slideEl = document.createElement('div');
                slideEl.className = 'slide';
                const img = document.createElement('img');
                img.src = s.src;
                img.alt = s.alt;
                slideEl.appendChild(img);
                slidesContainer.appendChild(slideEl);
            });
        }

        function render() {
            const slideEls = slidesContainer.querySelectorAll('.slide');
            slideEls.forEach((el, idx) => {
                el.classList.toggle('is-active', idx === current);
            });
        }

        function goTo(index, userTriggered = false) {
            const n = slides.length;
            current = ((index % n) + n) % n;
            render();
            if (userTriggered) restartAutoplay();
        }
        function next() { goTo(current + 1, true); }
        function prev() { goTo(current - 1, true); }

        function startAutoplay() {
            if (!AUTOPLAY) return;
            stopAutoplay();
            timerId = setInterval(() => { if (!isPaused) next(); }, INTERVAL_MS);
        }
        function stopAutoplay() { if (timerId) clearInterval(timerId); }
        function restartAutoplay() { stopAutoplay(); startAutoplay(); }

        function hideLoaderWhenReady() {
            const images = slidesContainer.querySelectorAll('img');
            let loaded = 0;
            images.forEach(img => {
                img.addEventListener('load', () => {
                    loaded++;
                    if (loaded === images.length) {
                        loader.classList.add('hidden');
                        slideshow.classList.add('visible');
                    }
                });
            });
        }

        // Tastatursteuerung
        slideshow.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });

        // Pause beim Hovern
        slideshow.addEventListener('mouseenter', () => isPaused = true);
        slideshow.addEventListener('mouseleave', () => isPaused = false);

        // Buttons
        prevBtn.addEventListener('click', prev);
        nextBtn.addEventListener('click', next);

        function init() {
            buildSlides();
            render();
            hideLoaderWhenReady();
            startAutoplay();
        }
        document.addEventListener('DOMContentLoaded', init);
