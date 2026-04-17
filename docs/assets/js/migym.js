const translations = {
    es: {
        nav_home: "Inicio",
        nav_services: "Servicios",
        nav_nutrition: "Nutrición",
        nav_routines: "Rutinas",
        nav_staff: "Equipo",
        hero_subtitle: "EL PODER DEL MOVIMIENTO",
        hero_title: "DESPIERTA TU <span class='text-accent'>POTENCIAL</span> MÁXIMO",
        hero_cta: "Únete Ahora",
        services_title: "Nuestros Servicios",
        service_1_title: "Entrenamiento Pro",
        service_1_desc: "Planes personalizados diseñados por expertos para alcanzar tus metas.",
        service_2_title: "Área de Pesas",
        service_2_desc: "Equipamiento de última generación y ambiente de alto rendimiento.",
        service_3_title: "Cardio Hi-Tech",
        service_3_desc: "Máquinas inteligentes con monitoreo en tiempo real de tu progreso.",
        nutrition_title: "Nutrición Fit",
        nutrition_subtitle: "Recetas master para potenciar tus resultados.",
        routines_title: "Rutinas Maestras",
        routines_subtitle: "Entrenamientos estructurados por niveles de dificultad.",
        staff_title: "Staff Profesional",
        staff_subtitle: "Conoce a los expertos que te acompañarán en tu proceso.",
        footer_about: "MiGym - El santuario del fitness moderno y de alto rendimiento.",
        footer_contact: "Contacto",
        footer_rights: "© 2025 MiGym. Todos los derechos reservados."
    },
    en: {
        nav_home: "Home",
        nav_services: "Services",
        nav_nutrition: "Nutrition",
        nav_routines: "Routines",
        nav_staff: "Staff",
        hero_subtitle: "THE POWER OF MOVEMENT",
        hero_title: "AWAKEN YOUR <span class='text-accent'>MAXIMUM</span> POTENTIAL",
        hero_cta: "Join Now",
        services_title: "Our Services",
        service_1_title: "Pro Training",
        service_1_desc: "Custom plans designed by experts to reach your goals.",
        service_2_title: "Weight Area",
        service_2_desc: "State-of-the-art equipment and high-performance environment.",
        service_3_title: "Hi-Tech Cardio",
        service_3_desc: "Smart machines with real-time monitoring of your progress.",
        nutrition_title: "Fit Nutrition",
        nutrition_subtitle: "Master recipes to power up your results.",
        routines_title: "Master Routines",
        routines_subtitle: "Structured workouts by difficulty levels.",
        staff_title: "Professional Staff",
        staff_subtitle: "Meet the experts who will guide you in your process.",
        footer_about: "MiGym - The sanctuary of modern and high-performance fitness.",
        footer_contact: "Contact",
        footer_rights: "© 2025 MiGym. All rights reserved."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar-gym');
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
