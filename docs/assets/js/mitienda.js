const translations = {
    es: {
        nav_home: "Inicio",
        nav_promos: "Promociones",
        nav_products: "Productos",
        nav_auctions: "Subastas",
        nav_cart: "Carrito",
        hero_subtitle: "TECNOLOGÍA Y ESTILO",
        hero_title: "Tu Próxima <span class='text-emerald'>Experiencia</span> Digital",
        hero_cta: "Ver Catálogo",
        promos_title: "Ofertas Exclusivas",
        products_title: "Nuestros Productos",
        auctions_title: "Subastas Activas",
        cart_title: "Tu Carrito",
        nav_services: "Nuestros Servicios",
        service_1_title: "Envío Express",
        service_1_desc: "Entregas garantizadas en menos de 24 horas para productos seleccionados.",
        service_2_title: "Garantía Total",
        service_2_desc: "Protección extendida en todas tus compras y soporte técnico especializado.",
        service_3_title: "Soporte 24/7",
        service_3_desc: "Atención personalizada en cualquier momento para resolver tus dudas.",
        footer_about: "MiTienda - Liderando la innovación en comercio digital.",
        footer_contact: "Contacto",
        footer_rights: "© 2025 MiTienda. Todos los derechos reservados."
    },
    en: {
        nav_home: "Home",
        nav_promos: "Promotions",
        nav_products: "Products",
        nav_auctions: "Auctions",
        nav_cart: "Cart",
        hero_subtitle: "TECH AND STYLE",
        hero_title: "Your Next Digital <span class='text-emerald'>Experience</span>",
        hero_cta: "View Catalog",
        promos_title: "Exclusive Offers",
        products_title: "Our Products",
        auctions_title: "Live Auctions",
        cart_title: "Your Cart",
        nav_services: "Our Services",
        service_1_title: "Express Shipping",
        service_1_desc: "Guaranteed delivery in less than 24 hours for selected products.",
        service_2_title: "Total Warranty",
        service_2_desc: "Extended protection on all your purchases and specialized technical support.",
        service_3_title: "24/7 Support",
        service_3_desc: "Personalized attention at any time to answer your questions.",
        footer_about: "MiTienda - Leading innovation in digital commerce.",
        footer_contact: "Contact Us",
        footer_rights: "© 2025 MiTienda. All rights reserved."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar-store');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Reveal Animations using Intersection Observer
    const reveals = document.querySelectorAll('[data-reveal]');
    const observerOptions = {
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));

    // Language Switching Logic
    const langBtns = document.querySelectorAll('.lang-switch');
    let currentLang = 'es';

    const updateLanguage = (lang) => {
        currentLang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        langBtns.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.documentElement.lang = lang;
    };

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateLanguage(btn.dataset.lang);
        });
    });

    // Initialize with Spanish
    updateLanguage('es');
});
