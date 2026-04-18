const translations = {
    es: {
        nav_home: "Inicio",
        nav_services: "Servicios",
        nav_about: "Nosotros",
        nav_projects: "Proyectos",
        nav_contact: "Contacto",
        hero_subtitle: "EXCELENCIA EN CONSTRUCCIÓN",
        hero_title: "CONSTRUIMOS TU <span class='text-accent'>SUEÑO</span> AMERICANO",
        hero_cta: "Cotizar Ahora",
        hero_cta_outline: "Ver Proyectos",
        services_title: "Nuestros Servicios",
        service_1_title: "Remodelaciones",
        service_1_desc: "Transformamos tus espacios con acabados de lujo y diseño funcional.",
        service_2_title: "Estructuras (Framing)",
        service_2_desc: "Estructuras sólidas y precisas cumpliendo con todos los códigos de construcción.",
        service_3_title: "Techos (Roofing)",
        service_3_desc: "Protección duradera con materiales de alta calidad para tu hogar.",
        about_title: "Sobre Nosotros",
        about_text: "Con años de experiencia en el mercado estadounidense, nos especializamos en ofrecer servicios de construcción de alta calidad. Nuestro compromiso es la satisfacción total del cliente a través de un trabajo profesional, honesto y puntual.",
        projects_title: "Proyectos Recientes",
        project_1_title: "Residencia Moderna",
        project_1_desc: "Remodelación completa de interiores en Miami.",
        project_2_title: "Estructura Comercial",
        project_2_desc: "Construcción de framing para plaza comercial en Texas.",
        project_3_title: "Villa de Lujo",
        project_3_desc: "Acabados premium y techado especializado.",
        why_title: "¿Por Qué Elegirnos?",
        why_1_title: "Calidad Certificada",
        why_2_title: "Precios Competitivos",
        why_3_title: "Seguro y Licencia",
        contact_title: "Contáctanos",
        'stat_satisfaction': 'Satisfacción',
        'form_name': 'Nombre',
        'form_email': 'Email',
        'form_message': 'Mensaje',
        footer_rights: "© 2025 ConstruccionUSA. Todos los derechos reservados."
    },
    en: {
        nav_home: "Home",
        nav_services: "Services",
        nav_about: "About Us",
        nav_projects: "Projects",
        nav_contact: "Contact",
        hero_subtitle: "EXCELLENCE IN CONSTRUCTION",
        hero_title: "BUILDING YOUR <span class='text-accent'>AMERICAN</span> DREAM",
        hero_cta: "Get a Quote",
        hero_cta_outline: "View Projects",
        services_title: "Our Services",
        service_1_title: "Remodeling",
        service_1_desc: "We transform your spaces with luxury finishes and functional design.",
        service_2_title: "Framing",
        service_2_desc: "Solid and precise structures complying with all building codes.",
        service_3_title: "Roofing",
        service_3_desc: "Durable protection with high-quality materials for your home.",
        about_title: "About Us",
        about_text: "With years of experience in the U.S. market, we specialize in offering high-quality construction services. Our commitment is total customer satisfaction through professional, honest, and timely work.",
        projects_title: "Recent Projects",
        project_1_title: "Modern Residence",
        project_1_desc: "Complete interior remodeling in Miami.",
        project_2_title: "Commercial Structure",
        project_2_desc: "Framing construction for a shopping center in Texas.",
        project_3_title: "Luxury Villa",
        project_3_desc: "Premium finishes and specialized roofing.",
        why_title: "Why Choose Us?",
        why_1_title: "Certified Quality",
        why_2_title: "Competitive Prices",
        why_3_title: "Insured & Licensed",
        contact_title: "Contact Us",
        'stat_satisfaction': 'Satisfaction',
        'form_name': 'Full Name',
        'form_email': 'Email Address',
        'form_message': 'Message',
        footer_rights: "© 2025 ConstruccionUSA. All rights reserved."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar-construction');
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
            const elementVisible = 100;
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
