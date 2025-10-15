console.log("Test");
// Menü Öffnen / Schließen

function openMenu(id) {
  closeMenu(); // schließt evtl. offenes Menü
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("active");
  document.getElementById("overlay").classList.add("active");
}

function closeMenu() {
  document.querySelectorAll(".sidenav.active").forEach(el => el.classList.remove("active"));
  document.getElementById("overlay").classList.remove("active");
}

// NEU: Menü schließen, wenn interner Link geklickt wird
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href');

    // Falls kein href vorhanden → ignorieren
    if (!href) return;

    // Wenn der Link zu derselben Seite führt (also kein http/https und kein anderer Pfad)
    const isSamePage =
      href.startsWith('CupCakeOverfew.html#') ||             // interner Ankerlink
      href === '' ||                      // leerer Link
      href === window.location.pathname || // exakter Seitenpfad
      href === './' || href === './index.html';

    if (isSamePage) {
      closeMenu();
    }
  });
});

// Sprachenauswahl DE Standard
const langBtn = document.getElementById("langBtn");
  const dropdown = document.getElementById("dropdown");
  const currentLangSpan = document.getElementById("currentLang");
  const arrow = document.getElementById("arrow");

  let currentLang = "de"; // Standard-Sprache

  const langLinks = {
    de: "#",
    en: "EN/index.html"
  };

  // Toggle Dropdown
  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
    document.getElementById("arrowDown").style.display = dropdown.classList.contains("show") ? "inline" : "none";
    document.getElementById("arrowLeft").style.display = dropdown.classList.contains("show") ? "none" : "inline";
  });

  // Klick im Dropdown
  dropdown.addEventListener("click", (e) => {
    const target = e.target;
    if (target.dataset.lang) {
      if (target.dataset.lang === currentLang) {
        // aktuelle Sprache → Menü schließen
        dropdown.classList.remove("show");
        document.getElementById("arrowDown").style.display = dropdown.classList.contains("show") ? "inline" : "none";
        document.getElementById("arrowLeft").style.display = dropdown.classList.contains("show") ? "none" : "inline";
      } else {
        // andere Sprache → weiterleiten
        window.location.href = langLinks[target.dataset.lang];
      }
    }
  });

  // Klick außerhalb → Menü schließen
  document.addEventListener("click", () => {
    if (dropdown.classList.contains("show")) {
      dropdown.classList.remove("show");
        document.getElementById("arrowDown").style.display = dropdown.classList.contains("show") ? "inline" : "none";
        document.getElementById("arrowLeft").style.display = dropdown.classList.contains("show") ? "none" : "inline";
    }
  });





// back to Top Btn
const backToTopBtn = document.getElementById("backToTop");

if (backToTopBtn) { // <-- Nur ausführen, wenn Button existiert
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}