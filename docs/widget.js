(function() {
    // Detectar automáticamente la base URL desde el script
    let BASE_URL = 'https://wisbe.xyz';
    const scriptTag = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        for (let s of scripts) {
            if (s.src && s.src.includes('widget.js')) return s;
        }
        return null;
    })();

    if (scriptTag && scriptTag.src) {
        try {
            BASE_URL = new URL(scriptTag.src).origin;
        } catch(e) {
            console.warn('[Wisbe Widget] Fallback to default BASE_URL');
        }
    }

    class WisbeWidget extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
            const type = this.getAttribute('type') || 'rutinas';
            const domain = this.getAttribute('domain') || window.location.hostname;
            const height = this.getAttribute('height') || '800px';

            console.log(`[Wisbe Widget] Initializing custom element: ${type} for ${domain}`);

            const iframe = document.createElement('iframe');
            iframe.src = `${BASE_URL}/${type}.html?domain=${encodeURIComponent(domain)}&embedded=true`;
            iframe.style.width = '100%';
            iframe.style.height = height;
            iframe.style.border = 'none';
            iframe.style.borderRadius = '20px';
            iframe.style.overflow = 'hidden';
            iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture');
            iframe.setAttribute('loading', 'lazy');

            this.shadowRoot.appendChild(iframe);
        }
    }

    if (!customElements.get('wisbe-widget')) {
        customElements.define('wisbe-widget', WisbeWidget);
    }

    // Compatibilidad con divs tradicionales
    function initWidgets() {
        const containers = [
            { id: 'wisbe-rutinas', type: 'rutinas' },
            { id: 'wisbe-nutricion', type: 'nutricion' },
            { id: 'wisbe-entrenadores', type: 'entrenadores' }
        ];

        containers.forEach(c => {
            const el = document.getElementById(c.id);
            if (el && !el.dataset.initialized) {
                const domain = el.getAttribute('domain') || window.location.hostname;
                const height = el.getAttribute('height') || '1300px';

                console.log(`[Wisbe Widget] Encontrado contenedor: ${c.id} para ${domain}`);

                const iframe = document.createElement('iframe');
                iframe.src = `${BASE_URL}/${c.type}.html?domain=${encodeURIComponent(domain)}&embedded=true`;
                iframe.style.width = '100%';
                iframe.style.height = height;
                iframe.style.border = 'none';
                iframe.style.borderRadius = '20px';
                iframe.style.overflow = 'hidden';
                iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture');
                iframe.setAttribute('loading', 'lazy');

                el.appendChild(iframe);
                el.dataset.initialized = 'true';
                console.log(`[Wisbe Widget] Inyectado iframe en ${c.id}`);
            }
        });
    }

    // Asegurar ejecución en múltiples estados de carga
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidgets);
    } else {
        initWidgets();
    }

    window.addEventListener('load', initWidgets);

    // MutationObserver con salvaguarda para document.body
    function setupObserver() {
        if (!document.body) {
            setTimeout(setupObserver, 50);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            let shouldInit = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) shouldInit = true;
            });
            if (shouldInit) initWidgets();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    setupObserver();

    // Reintentos agresivos (múltiples disparos para asegurar captura del DOM)
    [100, 500, 1000, 2000, 3000, 5000].forEach(delay => {
        setTimeout(initWidgets, delay);
    });
})();
