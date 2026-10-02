(() => {
    const root = new URL('.', document.currentScript.src);
    const english = document.documentElement.lang.toLowerCase() === 'en';
    const home = new URL(english ? 'EN/index.html' : 'index.html', root);
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    const brand = () => {
        const link = document.createElement('a');
        link.className = 'brand';
        link.href = home.href;
        link.setAttribute('aria-label', 'Cup & Cake GmbH Home');
        link.innerHTML = '<span>Cup <em>&amp;</em> Cake</span><small>GmbH</small>';
        return link;
    };
    for (const container of [nav, footer]) {
        if (!container) continue;
        container.prepend(brand());
        container.classList.add('has-brand');
    }
    document.querySelectorAll('nav a[href]').forEach(link => {
        if (link.href === location.href) link.setAttribute('aria-current', 'page');
    });
    document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = 'noopener noreferrer');
    document.querySelectorAll('main img').forEach(img => {
        if (!img.closest('.hero')) img.loading = 'lazy';
        img.decoding = 'async';
    });
    if (window.lucide) window.lucide.createIcons();
    document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.tabIndex = 0);
    document.querySelectorAll('#backToTop').forEach((button, index) => { if (index) button.remove(); });
    const shop = document.querySelector('nav a[href*="marketplace.penworldwide.org"]');
    if (shop) document.querySelectorAll('.BuyNow[href=""]').forEach(link => {
        link.href = shop.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    });

    let menuTrigger;
    window.closeMenu = () => {
        const active = document.querySelector('.sidenav.active');
        if (!active) return;
        active.classList.remove('active');
        active.inert = true;
        active.setAttribute('aria-hidden', 'true');
        document.getElementById('overlay')?.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuTrigger?.setAttribute('aria-expanded', 'false');
        menuTrigger?.focus();
    };
    window.openMenu = id => {
        window.closeMenu();
        const menu = document.getElementById(id);
        if (!menu) return;
        menuTrigger = document.querySelector('[aria-controls="' + id + '"]');
        menu.inert = false;
        menu.setAttribute('aria-hidden', 'false');
        menu.classList.add('active');
        menuTrigger?.setAttribute('aria-expanded', 'true');
        document.getElementById('overlay')?.classList.add('active');
        document.body.classList.add('menu-open');
        menu.querySelector('.closebtn')?.focus();
    };
    document.querySelectorAll('.sidenav').forEach(menu => {
        menu.inert = true;
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-modal', 'true');
        menu.setAttribute('aria-hidden', 'true');
        menu.setAttribute('aria-label', menu.querySelector('.title')?.textContent || 'Menu');
        menu.querySelector('.closebtn')?.setAttribute('aria-label', english ? 'Close menu' : 'Menü schließen');
        menu.addEventListener('keydown', event => {
            if (event.key !== 'Tab') return;
            const links = [...menu.querySelectorAll('a[href]')];
            const first = links[0], last = links.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
        menu.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', () => {
            if (link.hash && link.pathname === location.pathname) window.closeMenu();
        }));
    });
    document.querySelectorAll('nav a[onclick]').forEach(link => {
        const id = link.getAttribute('onclick').match(/'([^']+)'/)?.[1];
        link.setAttribute('role', 'button');
        link.tabIndex = 0;
        link.setAttribute('aria-controls', id);
        link.setAttribute('aria-expanded', 'false');
        link.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.openMenu(id); }
        });
    });

    const languageButton = document.getElementById('langBtn');
    const dropdown = document.getElementById('dropdown');
    const setLanguageOpen = open => {
        dropdown?.classList.toggle('show', open);
        languageButton?.setAttribute('aria-expanded', String(open));
        const down = document.getElementById('arrowDown'), left = document.getElementById('arrowLeft');
        if (down) down.style.display = open ? 'inline' : 'none';
        if (left) left.style.display = open ? 'none' : 'inline';
    };
    if (languageButton && dropdown) {
        languageButton.setAttribute('role', 'button');
        languageButton.setAttribute('aria-label', english ? 'Language' : 'Sprache');
        languageButton.setAttribute('aria-expanded', 'false');
        languageButton.tabIndex = 0;
        const toggle = event => { event.stopPropagation(); setLanguageOpen(!dropdown.classList.contains('show')); };
        languageButton.addEventListener('click', toggle);
        languageButton.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(event); }
        });
        const option = dropdown.querySelector('[data-lang]');
        if (option) {
            option.tabIndex = 0;
            option.setAttribute('role', 'link');
            const switchLanguage = () => { location.href = new URL(english ? 'index.html' : 'EN/index.html', root).href; };
            option.addEventListener('click', switchLanguage);
            option.addEventListener('keydown', event => { if (event.key === 'Enter') switchLanguage(); });
        }
        document.addEventListener('click', () => setLanguageOpen(false));
    }
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') { window.closeMenu(); setLanguageOpen(false); }
    });

    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        const update = () => backToTop.classList.toggle('show', window.scrollY > 350);
        window.addEventListener('scroll', update, { passive: true });
        update();
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
    }
})();
