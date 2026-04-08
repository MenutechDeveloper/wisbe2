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

                console.log(`[Wisbe Widget] Initializing div: ${c.id} for ${domain}`);

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
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidgets);
    } else {
        initWidgets();
    }

    // MutationObserver para detectar widgets añadidos dinámicamente
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                initWidgets();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Reintento de seguridad
    setTimeout(initWidgets, 1000);
    setTimeout(initWidgets, 3000);
})();
