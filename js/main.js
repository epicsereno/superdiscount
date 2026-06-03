const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        navLinks.classList.toggle("is-open", !isOpen);
        document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target instanceof HTMLAnchorElement) {
            menuToggle.setAttribute("aria-expanded", "false");
            navLinks.classList.remove("is-open");
            document.body.classList.remove("menu-open");
        }
    });
}

// Phase 3: Translation and Interactive Logic
const translations = {
    en: {
        nav_services: "Services",
        nav_about: "About",
        nav_location: "Location",
        nav_contact: "Contact",
        banner_deal: "<strong>DEAL OF THE WEEK:</strong> 20% Off All Party Balloons! 🎈",
        hero_eyebrow: "El Sereno One-Stop Shop",
        hero_h1: "Super Discount",
        call: "Call (323) 223-8115",
        get_directions: "Get Directions",
        open_now: "Open Now",
        closed: "Closed",
        skip_link: "Skip to content",
        services_eyebrow: "Window-To-Window Convenience",
        services_h2: "Dense aisles, loud signs, fast neighborhood errands"
    },
    es: {
        nav_services: "Servicios",
        nav_about: "Nosotros",
        nav_location: "Ubicación",
        nav_contact: "Contacto",
        banner_deal: "<strong>OFERTA DE LA SEMANA:</strong> ¡20% de descuento en globos! 🎈",
        hero_eyebrow: "Su tienda en El Sereno",
        hero_h1: "Super Discount",
        call: "Llamar (323) 223-8115",
        get_directions: "Direcciones",
        open_now: "Abierto",
        closed: "Cerrado",
        skip_link: "Saltar al contenido",
        services_eyebrow: "Conveniencia de ventana a ventana",
        services_h2: "Pasillos densos, letreros ruidosos, mandados rápidos"
    }
};

let currentLang = "en";

function updateOpenStatus() {
    const statusElement = document.getElementById("open-status");
    if (!statusElement) return;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "numeric",
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === "hour").value);
    const minute = parseInt(parts.find(p => p.type === "minute").value);

    const currentTime = hour + minute / 60;
    const openTime = 9.5; // 9:30 AM
    const closeTime = 21; // 9:00 PM

    const isOpen = currentTime >= openTime && currentTime < closeTime;
    statusElement.textContent = translations[currentLang][isOpen ? "open_now" : "closed"];
    statusElement.classList.toggle("is-open", isOpen);
    statusElement.classList.toggle("is-closed", !isOpen);
}

function toggleLanguage() {
    currentLang = currentLang === "en" ? "es" : "en";
    const btn = document.getElementById("lang-toggle");
    if (btn) btn.textContent = currentLang === "en" ? "ESP" : "ENG";
    
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[currentLang][key]) {
            if (key === "banner_deal") {
                el.innerHTML = translations[currentLang][key];
            } else {
                el.textContent = translations[currentLang][key];
            }
        }
    });
    
    updateOpenStatus();
}

const langToggle = document.getElementById("lang-toggle");
if (langToggle) {
    langToggle.addEventListener("click", toggleLanguage);
}

// Form Handlers
const rentalForm = document.getElementById("rental-inquiry");
if (rentalForm) {
    rentalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Thanks for your inquiry! We'll check availability and get back to you soon. For immediate answers, please call us!");
        rentalForm.reset();
    });
}

const smsForm = document.getElementById("sms-signup");
if (smsForm) {
    smsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Welcome to the list! You'll start receiving neighbor-only deals soon.");
        smsForm.reset();
    });
}

// Initial calls
updateOpenStatus();
setInterval(updateOpenStatus, 60000);
