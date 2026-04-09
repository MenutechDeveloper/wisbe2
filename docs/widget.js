(function() {
    console.log('[Wisbe Widget] Iniciando script v3...');

    // Configuración Base
    let BASE_URL = 'https://wisbe.xyz';

    // Detectar si estamos en un entorno de desarrollo o local
    try {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const s = scripts[i];
            if (s.src && s.src.includes('widget.js')) {
                const url = new URL(s.src, window.location.href);
                // Si no es el dominio oficial, usamos el origen del script como base
                if (!url.hostname.includes('wisbe.xyz') && url.hostname !== '') {
                    BASE_URL = url.origin;
                    console.log('[Wisbe Widget] Usando base alternativa:', BASE_URL);
                }
                break;
            }
        }
    } catch(e) {
        console.error('[Wisbe Widget] Error detectando base:', e);
    }

    function createWidget(container, type) {
        if (container.dataset.wisbeActive) return;
        container.dataset.wisbeActive = 'true';

        const domain = container.getAttribute('domain') || window.location.hostname;
        console.log('[Wisbe Widget Legacy] Mapeando ' + type + ' para ' + domain + ' a Custom Element.');

        // Lazy load WisbeUI if not present
        if (!customElements.get('wisbe-gym' + type)) {
            const uiScript = document.createElement('script');
            uiScript.src = BASE_URL + '/wisbeUI.js';
            document.head.appendChild(uiScript);
        }

        // Reemplazar el contenedor heredado por el nuevo Custom Element
        const newWidget = document.createElement('wisbe-gym' + (type === 'nutricion' ? 'nutricion' : (type === 'rutinas' ? 'rutinas' : 'entrenadores')));
        newWidget.setAttribute('domain', domain);
        container.innerHTML = '';
        container.appendChild(newWidget);
    }

    function scan() {
        const config = [
            { id: 'wisbe-nutricion', type: 'nutricion' },
            { id: 'wisbe-rutinas', type: 'rutinas' },
            { id: 'wisbe-entrenadores', type: 'entrenadores' }
        ];

        config.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) createWidget(el, item.type);
        });
    }

    // Inicialización inmediata y repetitiva
    if (document.readyState === 'complete') {
        scan();
    } else {
        window.addEventListener('load', scan);
        document.addEventListener('DOMContentLoaded', scan);
    }

    // Intervalo para entornos dinámicos
    setInterval(scan, 1000);
})();
