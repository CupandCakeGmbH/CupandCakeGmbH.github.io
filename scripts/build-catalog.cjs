const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'CupCakes/catalog-2026-27.json'), 'utf8'));
const shop = 'https://marketplace.penworldwide.org/?enterprisePenCode=AT010000851';
const templates = Object.fromEntries(['de', 'en'].map(lang => [lang, fs.readFileSync(path.join(root, lang === 'en' ? 'EN/CupCakes/redVelvet.html' : 'CupCakes/redVelvet.html'), 'utf8')]));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const price = (item, lang) => item.price === null ? (lang === 'de' ? 'Auf Anfrage' : 'On request') : `${item.price.toFixed(2).replace('.', ',')} EUR${item.unit ? ' ' + item.unit[lang] : ''}`;
const image = item => `Bilder/Katalog-2026-27/${item.id}.png`;
const write = (relative, html) => fs.writeFileSync(path.join(root, relative), html);
const replaceMain = (html, content) => {
    const pattern = /(<main>[\s\S]*?<\/button>)[\s\S]*?(<\/main>)/;
    if (!pattern.test(html)) throw new Error('Missing main content boundary');
    return html.replace(pattern, (_, start, end) => `${start}\n${content.replace(/[ \t]+$/gm, '')}\n    ${end}`);
};
const tax = (vat, lang) => lang === 'de' ? `Preise exkl. ${vat} % USt.` : `Prices exclude ${vat}% VAT.`;
const allergenNames = {
    A: { icon: 'wheat', anchor: 'gluten', de: 'Gluten', en: 'Gluten' },
    C: { icon: 'egg', anchor: 'eier', de: 'Eier', en: 'Eggs' },
    G: { icon: 'milk', anchor: 'milch', de: 'Milch', en: 'Milk' }
};

for (const lang of ['de', 'en']) {
    const folder = lang === 'en' ? 'EN/CupCakes/' : 'CupCakes/';
    const prefix = lang === 'en' ? '../../' : '../';
    for (const item of catalog.items) {
        const allergens = item.allergens.length ? `<div class="blockIcons">${item.allergens.map(code => {
            const allergen = allergenNames[code];
            return `<a class="icon" href="../AboutUS/allergene.html#${allergen.anchor}"><i data-lucide="${allergen.icon}" aria-hidden="true"></i><p>${allergen[lang]} (${code})</p></a>`;
        }).join('')}</div>` : `<p>${lang === 'de' ? 'Im Katalog nicht angegeben.' : 'Not specified in the catalogue.'}</p>`;
        const content = `        <section class="CupCake catalog-current" data-product="${item.id}">
            <div class="CupCakeImg"><img src="${prefix}${image(item)}" alt="${escape(item.name[lang])}" decoding="async"></div>
            <div class="description">
                <h1>${escape(item.name[lang])}</h1>
                <h3>${lang === 'de' ? 'Beschreibung' : 'Description'}</h3>
                <p class="product-description">${escape(item.description[lang])}</p>
                <h3>${lang === 'de' ? 'Allergene' : 'Allergens'}</h3>
                ${allergens}
                <div class="preis"><h3>${lang === 'de' ? 'Preis' : 'Price'}</h3><p class="product-price">${price(item, lang)}</p></div>
                ${item.note ? `<p class="order-note">${escape(item.note[lang])}</p>` : ''}
                <p class="tax-note">${tax(item.vat, lang)}</p>
                <div class="buy">
                    <a class="BuyNow" href="${item.category === 'backkurse' ? `mailto:cupandcake851@uebungsfirmen.at?subject=${encodeURIComponent(item.name[lang])}` : shop}"${item.category === 'backkurse' ? '' : ' target="_blank" rel="noopener noreferrer"'}>${item.category === 'backkurse' ? (lang === 'de' ? 'Anfragen' : 'Enquire') : (lang === 'de' ? 'Jetzt kaufen' : 'Shop now')}</a>
                    <a class="browseOther" href="CupCakeOverfew.html">${lang === 'de' ? 'Unser gesamtes Angebot' : 'Browse all offerings'}</a>
                </div>
            </div>
        </section>`;
        let html = replaceMain(templates[lang], content);
        html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(item.name[lang])} | Cup &amp; Cake</title>`);
        write(folder + item.id + '.html', html.replace(/[ \t]+(?=\r?$)/gm, ''));
    }
    const overviewFile = folder + 'CupCakeOverfew.html';
    let overview = fs.readFileSync(path.join(root, overviewFile), 'utf8');
    const cards = catalog.categories.map(category => `        <section class="Container" aria-labelledby="${category.id}">
            <h2 id="${category.id}">${escape(category[lang])}</h2>
${catalog.items.filter(item => item.category === category.id).map(item => `            <a class="CupCake" href="${item.id}.html" data-product="${item.id}">
                <img src="${prefix}${image(item)}" alt="${escape(item.name[lang])}" loading="lazy" decoding="async">
                <div class="beschriftung"><p class="name">${escape(item.name[lang])}</p><p class="preis">${price(item, lang)}</p></div>
                <p class="catalog-description">${escape(item.description[lang])}</p>
                ${item.note ? `<p class="catalog-order-note">${escape(item.note[lang])}</p>` : ''}
                <div class="dicover"><p>${lang === 'de' ? 'Mehr erfahren' : 'Discover more'} <i data-lucide="arrow-up-right" aria-hidden="true"></i></p></div>
            </a>`).join('\n')}
            <p class="category-tax">${tax(category.id === 'backkurse' ? 20 : 10, lang)}</p>
        </section>`).join('\n');
    overview = replaceMain(overview, `        <h1>${lang === 'de' ? 'Unsere Cupcakes' : 'Our Cupcakes'}</h1>\n${cards}\n        <section class="katalog"><a id="download-link" href="${prefix}${catalog.source}" download><i data-lucide="download" aria-hidden="true"></i>${lang === 'de' ? 'Katalog 2026/27 herunterladen' : 'Download the 2026/27 catalogue'}</a></section>`);
    // The former SVG-only download animation no longer belongs to the download button.
    overview = overview.replace(/\s*<script>[\s\S]*?<\/script>\s*(?=<\/html>)/, '\n');
    write(overviewFile, overview);

    const homeFile = lang === 'en' ? 'EN/index.html' : 'index.html';
    const homePrefix = lang === 'en' ? '../' : '';
    let home = fs.readFileSync(path.join(root, homeFile), 'utf8');
    const highlights = ['redVelvet', 'biscoff', 'einhorn'].map(id => catalog.items.find(item => item.id === id));
    home = home.replace(/<section class="cupcakesPresentation">[\s\S]*?<\/section>/, `<section class="cupcakesPresentation">${highlights.map(item => `
            <div class="cupcake">
                <img src="${homePrefix}${image(item)}" alt="${escape(item.name[lang])}">
                <div class="text"><div><h2>${escape(item.name[lang])}</h2><p>${escape(item.description[lang])}</p></div><a href="CupCakes/${item.id}.html" class="mehrErfahren">${lang === 'de' ? 'Mehr erfahren' : 'Discover more'}</a></div>
            </div>`).join('')}\n        </section>`);
    home = home.replace(/<div class="hero-fallback"><img[^>]*><\/div>/, `<div class="hero-fallback"><img src="${homePrefix}${image(highlights[0])}" alt="Red Velvet Cupcake"></div>`);
    home = home.replace(/src="[^"]*Heidelbeer about\.jpg" alt="[^"]*"/, `src="${homePrefix}${image(catalog.items.find(item => item.id === 'miniCupcakes'))}" alt="Mini-Cupcakes"`);
    write(homeFile, home);

    const retired = ['ananas', 'bananen', 'brombeerLimette', 'cheesecake', 'heidelbeere', 'mango', 'pinaColada', 'schoko', 'schokoMousse', 'tiramisu', 'vanille', 'vanilleKipferl', 'weißeSchoko', 'zitrone', 'kokusStracciatella'];
    for (const id of retired) {
        const target = id === 'kokusStracciatella' ? 'kokos.html' : 'CupCakeOverfew.html';
        const label = lang === 'de' ? 'Aktuelles Sortiment 2026/27' : 'Current 2026/27 range';
        write(folder + id + '.html', `<!DOCTYPE html>\n<html lang="${lang}">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>${label} | Cup &amp; Cake</title><link rel="stylesheet" href="${prefix}style.css"></head>\n<body><main><h1>${label}</h1><a href="${target}">${label}</a></main></body>\n</html>\n`);
    }
}

function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) visit(file);
        else if (entry.name.endsWith('.html')) {
            let html = fs.readFileSync(file, 'utf8');
            const menu = html.indexOf('<div id="menuCupCake"');
            if (menu === -1) continue;
            const start = html.indexOf('<div class="sidenav-inner">', menu) + '<div class="sidenav-inner">'.length;
            const end = html.indexOf('</div>', start);
            if (start < menu || end === -1) throw new Error('Missing cupcake menu boundary: ' + file);
            const relative = path.relative(root, file).replace(/\\/g, '/');
            const lang = relative.startsWith('EN/') ? 'en' : 'de';
            const folder = lang === 'en' ? 'EN/CupCakes' : 'CupCakes';
            const href = target => escape(path.posix.relative(path.posix.dirname(relative), folder + '/' + target));
            const links = `\n                <a href="${href('CupCakeOverfew.html')}" class="title">${lang === 'de' ? 'Unsere Cupcakes' : 'Our Cupcakes'}</a>\n` + catalog.categories.map(category => `                <a href="${href('CupCakeOverfew.html')}#${category.id}" class="subtitle">${escape(category[lang])}</a>\n` + catalog.items.filter(item => item.category === category.id).map(item => `                <a href="${href(item.id + '.html')}">${escape(item.name[lang])}</a>\n`).join('')).join('') + '            ';
            html = html.slice(0, start) + links + html.slice(end);
            fs.writeFileSync(file, html);
        }
    }
}
visit(root);
console.log(`Built ${catalog.items.length} catalogue offerings in German and English.`);
