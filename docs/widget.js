(function() {
    // Priorizar Wisbe.xyz como BASE_URL pero permitir detección dinámica para testing
    let BASE_URL = 'https://wisbe.xyz';

    // Intentar detectar si el script se está ejecutando desde otro origen (ej. localhost en desarrollo)
    const scriptTag = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        for (let s of scripts) {
            if (s.src && s.src.includes('widget.js')) return s;
        }
        return null;
    })();

    if (scriptTag && scriptTag.src && !scriptTag.src.includes('wisbe.xyz')) {
        try {
            BASE_URL = new URL(scriptTag.src).origin;
            console.log('[Wisbe Widget] Custom BASE_URL detected:', BASE_URL);
        } catch(e) {}
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

                console.log(`[Wisbe Widget] Iniciando modulo: ${c.type} para el dominio: ${domain}`);

                // Crear un div de carga temporal
                const loader = document.createElement('div');
                loader.className = 'wisbe-loader';
                loader.innerHTML = `
                    <div style="padding: 40px; text-align: center; font-family: sans-serif; color: #64748b; background: #f8fafc; border-radius: 20px; border: 2px dashed #e2e8f0;">
                        <div style="margin-bottom: 10px; font-weight: bold;">Sincronizando con Wisbe.xyz...</div>
                        <div style="font-size: 12px;">Cargando contenido para ${domain}</div>
                    </div>
                `;
                el.appendChild(loader);

                const iframe = document.createElement('iframe');
                // IMPORTANTE: encodeURIComponent asegura que el dominio se pase correctamente aunque tenga caracteres especiales
                iframe.src = `${BASE_URL}/${c.type}.html?domain=${encodeURIComponent(domain)}&embedded=true`;
                iframe.style.width = '100%';
                iframe.style.height = height;
                iframe.style.border = 'none';
                iframe.style.borderRadius = '20px';
                iframe.style.overflow = 'hidden';
                iframe.style.opacity = '0'; // Usar opacidad en lugar de display para asegurar disparo de eventos
                iframe.style.transition = 'opacity 0.5s ease-in-out';
                iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture');
                iframe.setAttribute('loading', 'lazy');

                // Mostrar iframe y quitar loader cuando esté listo
                const showIframe = () => {
                    if (loader.parentNode) loader.remove();
                    iframe.style.opacity = '1';
                    iframe.style.display = 'block';
                    console.log(`[Wisbe Widget] Modulo ${c.type} cargado correctamente.`);
                };

                iframe.onload = showIframe;
                iframe.onerror = function() {
                    console.error(`[Wisbe Widget] Error al cargar el modulo ${c.type}. Es posible que el origen esté bloqueado.`);
                    loader.innerHTML = '<div style="color: red;">Error al cargar el contenido. Por favor, revisa la consola del navegador.</div>';
                };

                // Fallback por si el onload no dispara (ej. cache o error silencioso)
                setTimeout(() => {
                    if (iframe.style.opacity === '0') {
                        console.warn('[Wisbe Widget] El iframe tarda demasiado en responder, forzando visualización...');
                        showIframe();
                    }
                }, 6000);

                el.appendChild(iframe);
                el.dataset.initialized = 'true';
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
