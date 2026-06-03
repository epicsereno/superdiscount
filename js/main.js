const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
const siteHeader = document.querySelector(".site-header");
const serviceCards = document.querySelectorAll(".service-card");

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

if (siteHeader) {
    const syncHeaderShadow = () => {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 4);
    };

    syncHeaderShadow();
    window.addEventListener("scroll", syncHeaderShadow, { passive: true });
}

if (serviceCards.length) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    serviceCards.forEach((card) => {
        card.classList.add("reveal-card");
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        serviceCards.forEach((card) => {
            card.classList.add("is-visible");
        });
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18 });

        serviceCards.forEach((card) => {
            revealObserver.observe(card);
        });
    }
}
