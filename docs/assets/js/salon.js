const translations = {
    es: {
        nav_home: "Inicio",
        nav_services: "Servicios",
        nav_about: "Nosotros",
        nav_booking: "Citas",
        hero_subtitle: "Elegancia y Estilo",
        hero_title: "Donde la Belleza Encuentra su <span class='text-gold'>Perfección</span>",
        hero_cta: "Reserva Ahora",
        services_title: "Nuestros Servicios",
        services_hair: "Corte y Peinado",
        services_hair_desc: "Estilos personalizados que resaltan tu personalidad.",
        services_nails: "Manicura y Pedicura",
        services_nails_desc: "Cuidado excepcional para tus manos y pies.",
        services_aesthetics: "Estética Avanzada",
        services_aesthetics_desc: "Tratamientos faciales y corporales de última generación.",
        booking_title: "Agenda tu Cita",
        booking_subtitle: "Selecciona el servicio y profesional de tu preferencia.",
        nav_menu: "Menú",
        menu_title: "Menú de Belleza",
        menu_subtitle: "Nuestros servicios más exclusivos con precios transparentes.",
        stylists_title: "Nuestros Expertos",
        stylists_subtitle: "Profesionales dedicados a realzar tu belleza natural.",
        test_1: '"La mejor experiencia en salón. Elena transformó mi cabello por completo. El ambiente es puro lujo."',
        test_2: '"Tratamientos faciales increíbles. Salí con la piel radiante. ¡Altamente recomendado!"',
        test_3: '"Un oasis en la ciudad. El servicio de manicura spa es excepcional y muy relajante."',
        footer_about: "Wisbe Beauty Salon - Tu oasis de belleza y relajación.",
        footer_contact: "Contacto",
        footer_rights: "© 2025 Wisbe Beauty. Todos los derechos reservados."
    },
    en: {
        nav_home: "Home",
        nav_services: "Services",
        nav_about: "About",
        nav_booking: "Booking",
        hero_subtitle: "Elegance and Style",
        hero_title: "Where Beauty Meets <span class='text-gold'>Perfection</span>",
        hero_cta: "Book Now",
        services_title: "Our Services",
        services_hair: "Hair & Styling",
        services_hair_desc: "Custom styles that highlight your personality.",
        services_nails: "Manicure & Pedicure",
        services_nails_desc: "Exceptional care for your hands and feet.",
        services_aesthetics: "Advanced Aesthetics",
        services_aesthetics_desc: "Cutting-edge facial and body treatments.",
        booking_title: "Book Your Appointment",
        booking_subtitle: "Select your preferred service and professional.",
        nav_menu: "Menu",
        menu_title: "Beauty Menu",
        menu_subtitle: "Our most exclusive services with transparent pricing.",
        stylists_title: "Our Experts",
        stylists_subtitle: "Dedicated professionals enhancing your natural beauty.",
        test_1: '"The best salon experience. Elena completely transformed my hair. The atmosphere is pure luxury."',
        test_2: '"Amazing facial treatments. I left with radiant skin. Highly recommended!"',
        test_3: '"An oasis in the city. The spa manicure service is exceptional and very relaxing."',
        footer_about: "Wisbe Beauty Salon - Your oasis of beauty and relaxation.",
        footer_contact: "Contact Us",
        footer_rights: "© 2025 Wisbe Beauty. All rights reserved."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar-salon');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Reveal Animations
    const reveals = document.querySelectorAll('[data-reveal]');
    const revealOnScroll = () => {
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('revealed');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Language Switching Logic
    const langBtns = document.querySelectorAll('.lang-switch');
    let currentLang = 'es';

    const updateLanguage = (lang) => {
        currentLang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
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
