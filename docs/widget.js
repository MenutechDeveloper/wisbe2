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
        const height = container.getAttribute('height') || '1300px';

        console.log('[Wisbe Widget] Creando ' + type + ' para ' + domain);

        // Loader con diseño integrado
        const loader = document.createElement('div');
        loader.style.cssText = 'padding: 60px 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff; border-radius: 30px; border: 2px dashed #cbd5e1; color: #475569; margin: 10px 0;';
        loader.innerHTML = '<div style="font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 10px; color: #0f172a;">Wisbe.xyz</div>' +
                          '<div style="font-size: 12px; margin-bottom: 15px;">Sincronizando con el gimnasio...</div>' +
                          '<div style="font-size: 11px; font-mono; color: #3b82f6;">' + domain + '</div>';
        container.appendChild(loader);

        const iframe = document.createElement('iframe');
        iframe.src = BASE_URL + '/' + type + '.html?domain=' + encodeURIComponent(domain) + '&embedded=true';
        iframe.style.cssText = 'width: 100%; height: ' + height + '; border: none; border-radius: 20px; display: none; overflow: hidden;';
        iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture');

        iframe.onload = function() {
            loader.remove();
            iframe.style.display = 'block';
            console.log('[Wisbe Widget] ' + type + ' cargado correctamente.');
        };

        // Error fallback
        setTimeout(function() {
            if (iframe.style.display === 'none') {
                loader.innerHTML = '<div style="color: #ef4444; font-weight: bold;">Error de carga</div><div style="font-size: 11px; margin-top: 5px;">Asegúrate de que el dominio ' + domain + ' esté registrado y tenga contenido.</div>';
                iframe.style.display = 'block';
                iframe.style.opacity = '0.5';
            }
        }, 10000);

        container.appendChild(iframe);
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
