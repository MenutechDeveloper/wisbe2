/**
 * WisbeUI.js - Sistema de Widgets mediante Custom Elements
 * DISEÑO ORIGINAL PRESERVADO - PARIDAD 100% CON PUBLIC PAGES (TAILWIND MAPPED)
 */

(function() {
    const CONFIG = {
        SUPABASE_URL: 'https://wwcmtqqbxdamxebkfsqk.supabase.co',
        SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Y210cXFieGRhbXhlYmtmc3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDUzNzksImV4cCI6MjA5MDA4MTM3OX0.4C5gGKxJrpF5BS8FfEAu8FLa9VudEHxCYxwwtb991Io'
    };

    // Lazy load Supabase
    let isSupabaseLoading = false;
    async function getSupabase() {
        if (window.supabase) return window.supabase;
        if (isSupabaseLoading) {
            return new Promise((resolve) => {
                const check = setInterval(() => {
                    if (window.supabase) { clearInterval(check); resolve(window.supabase); }
                }, 100);
            });
        }
        isSupabaseLoading = true;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.async = true;
            script.onload = () => {
                isSupabaseLoading = false;
                if (window.supabase) resolve(window.supabase);
                else reject(new Error('Supabase no se inicializó.'));
            };
            script.onerror = () => { isSupabaseLoading = false; reject(new Error('Error Supabase script.')); };
            document.head.appendChild(script);
        });
    }

    const BASE_STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Lato:ital,wght@0,400;0,700;1,400&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :host {
            display: block !important;
            width: 100% !important;
            font-family: 'Lato', sans-serif;
            --emerald-500: #10b981;
            --emerald-600: #059669;
            --blue-500: #3b82f6;
            --blue-600: #2563eb;
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-400: #94a3b8;
            --slate-500: #64748b;
            --slate-600: #475569;
            --slate-800: #1e293b;
            --slate-900: #0f172a;
            --slate-950: #020617;
        }

        * { box-sizing: border-box; }

        .container { width: 100%; margin: 0 auto; padding: 0; }
        .grid { display: grid; gap: 2.5rem; width: 100%; }

        /* Utility for animation */
        .animate-fade-in { animation: fadeIn 0.7s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .loader { padding: 80px; text-align: center; color: var(--slate-400); font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; }
        .error { padding: 40px; text-align: center; color: #ef4444; background: #fef2f2; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; border: 1px solid #fee2e2; }

        /* --- NUTRICION (recovered_nutricion.html parity) --- */
        .n-filters {
            background: white; border-radius: 40px; shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); border: 1px solid var(--slate-100);
            padding: 2rem; margin-bottom: 5rem; display: flex; flex-wrap: wrap; gap: 1.5rem;
            align-items: center; justify-content: space-between;
        }
        .n-filter-select {
            background: var(--slate-50); padding: 0.75rem 2rem; border-radius: 1rem;
            font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;
            color: var(--slate-500); border: none; outline: none; cursor: pointer; transition: all 0.2s;
        }
        .n-filter-select:focus { box-shadow: 0 0 0 2px var(--emerald-500); }
        .n-results-count { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate-400); }

        .n-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

        .n-card {
            background: white; border-radius: 50px; shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); border: 1px solid var(--slate-50);
            overflow: hidden; transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column; cursor: default;
        }
        .n-card:hover { transform: translateY(-0.75rem); box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }

        .n-img-wrapper { height: 16rem; position: relative; overflow: hidden; background: var(--slate-200); }
        .n-img { width: 100%; height: 100%; object-fit: cover; transition: all 1s; filter: grayscale(0.2); }
        .n-card:hover .n-img { transform: scale(1.25); filter: grayscale(0); }

        .n-badge {
            position: absolute; top: 1.5rem; left: 1.5rem;
            background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px);
            padding: 0.5rem 1rem; border-radius: 1rem;
            font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;
            color: var(--emerald-600); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .n-content { padding: 2.5rem; flex-grow: 1; display: flex; flex-direction: column; }
        .n-title { font-size: 1.5rem; font-weight: 900; color: var(--slate-800); margin: 0 0 1.5rem 0; line-height: 1.2; letter-spacing: -0.025em; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

        .n-stats { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--slate-50); border-bottom: 1px solid var(--slate-50); padding: 1.5rem 0; margin-bottom: 2.5rem; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate-400); }
        .n-stat { text-align: center; }
        .n-stat-val { display: block; font-size: 1.5rem; font-weight: 900; color: var(--emerald-600); margin-bottom: 0.25rem; }
        .n-stat-val-alt { display: block; font-size: 1.5rem; font-weight: 900; color: var(--slate-800); margin-bottom: 0.25rem; }

        .n-btn { width: 100%; padding: 1.25rem; background: var(--slate-900); color: white; border-radius: 1.875rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; border: none; cursor: pointer; transition: all 0.3s; margin-top: auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .n-btn:hover { background: var(--emerald-600); box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.2); }

        /* --- NUTRICION MODAL --- */
        .n-modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(24px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .n-modal-container { background: white; width: 100%; max-width: 72rem; max-height: 95vh; border-radius: 60px; overflow: hidden; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5); display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.1); }
        @media (min-width: 1280px) { .n-modal-container { flex-direction: row; } }

        .n-modal-left { position: relative; height: 20rem; }
        @media (min-width: 1280px) { .n-modal-left { width: 41.66%; height: auto; } }
        .n-modal-img { width: 100%; height: 100%; object-fit: cover; }
        .n-modal-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 3rem; }
        .n-modal-badge { background: var(--emerald-500); color: white; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; padding: 0.5rem 1.25rem; border-radius: 1rem; width: fit-content; margin-bottom: 1rem; box-shadow: 0 20px 25px -5px rgba(6, 78, 59, 0.4); }
        .n-modal-title { font-size: 3rem; font-weight: 900; color: white; line-height: 0.9; letter-spacing: -0.05em; margin: 0; }

        .n-modal-right { flex-grow: 1; padding: 2rem; overflow-y: auto; background: white; display: flex; flex-direction: column; }
        @media (min-width: 1280px) { .n-modal-right { padding: 4rem; width: 58.33%; } }

        .n-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem; }
        .n-modal-macros { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; width: 100%; margin-right: 3rem; }
        .n-macro-box { background: var(--slate-50); padding: 1.5rem; border-radius: 35px; text-align: center; border: 1px solid var(--slate-100); transition: all 0.3s; }
        .n-macro-box:hover { background: #f0fdf4; }
        .n-macro-val { display: block; font-size: 1.875rem; font-weight: 900; color: var(--emerald-600); margin-bottom: 0.25rem; }
        .n-macro-val-dark { color: var(--slate-800); }
        .n-macro-label { font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate-400); }

        .n-close-btn { color: var(--slate-200); cursor: pointer; font-size: 1.875rem; transition: all 0.3s; background: none; border: none; padding: 0; }
        .n-close-btn:hover { color: var(--emerald-500); }

        .n-section-grid { display: grid; gap: 3rem; margin-bottom: 4rem; }
        @media (min-width: 768px) { .n-section-grid { grid-template-columns: repeat(2, 1fr); } }

        .n-sec-title { font-size: 1.25rem; font-weight: 900; color: var(--slate-800); margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: -0.025em; display: flex; align-items: center; }
        .n-sec-num { width: 2rem; height: 2rem; background: #ecfdf5; color: var(--emerald-600); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin-right: 0.75rem; font-weight: 900; }

        .n-ingredients { color: var(--slate-600); line-height: 2; font-style: italic; font-size: 0.875rem; white-space: pre-wrap; padding-left: 1.5rem; border-left: 2px solid #ecfdf5; }
        .n-biodata { display: flex; flex-direction: column; gap: 1rem; }
        .n-bio-row { background: var(--slate-50); padding: 1rem; border-radius: 1rem; border: 1px solid var(--slate-100); display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
        .n-bio-label { color: var(--slate-400); }
        .n-bio-val { color: var(--slate-900); }
        .n-bio-val-accent { color: var(--emerald-600); }
        .n-instructions-box { background: var(--slate-50); padding: 2.5rem; border-radius: 40px; border: 2px dashed var(--slate-200); color: var(--slate-600); font-size: 0.875rem; line-height: 1.625; white-space: pre-wrap; }

        /* --- RUTINAS (recovered_rutinas.html parity) --- */
        .r-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        .r-card {
            background: white; border-radius: 20px; border: 1px solid var(--slate-100); padding: 2rem;
            transition: all 0.3s; cursor: pointer; display: flex; flex-direction: column; height: 100%;
        }
        .r-card:hover { border-color: var(--blue-500); transform: translateY(-5px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); }
        .r-icon { width: 4rem; height: 4rem; background: #eff6ff; color: var(--blue-500); border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 2rem; border: 1px solid #dbeafe; transition: all 0.3s; }
        .r-card:hover .r-icon { background: var(--blue-500); color: white; }
        .r-title { font-size: 1.25rem; font-weight: 900; color: var(--slate-900); margin: 0 0 0.5rem 0; text-transform: uppercase; letter-spacing: -0.025em; }
        .r-meta { display: flex; align-items: center; gap: 1rem; font-size: 10px; font-weight: 900; text-transform: uppercase; color: var(--slate-400); letter-spacing: 0.1em; margin-bottom: 2rem; }
        .r-badge { background: var(--slate-50); padding: 0.125rem 0.5rem; border-radius: 0.25rem; border: 1px solid var(--slate-100); }
        .r-footer { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--slate-100); color: var(--blue-600); font-size: 10px; font-weight: 900; text-transform: uppercase; display: flex; align-items: center; letter-spacing: 0.1em; }
        .r-footer i { margin-left: 0.5rem; transition: transform 0.3s; }
        .r-card:hover .r-footer i { transform: translateX(0.5rem); }

        /* --- RUTINAS MODAL --- */
        .r-modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .r-modal-container { background: white; width: 100%; max-width: 64rem; border-radius: 40px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); position: relative; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; }
        .r-modal-close { position: absolute; top: 2rem; right: 2rem; width: 3rem; height: 3rem; background: var(--slate-100); color: var(--slate-400); border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.3s; z-index: 10; }
        .r-modal-close:hover { background: #fee2e2; color: #ef4444; }
        .r-modal-header { padding: 3rem; background: var(--slate-50); border-bottom: 1px solid var(--slate-100); }
        .r-modal-title { font-size: 2.25rem; font-weight: 900; color: var(--slate-900); text-transform: uppercase; letter-spacing: -0.025em; margin: 0; }
        .r-modal-subtitle { color: var(--blue-600); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; display: block; }
        .r-modal-meta { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .r-meta-box { background: white; padding: 0.75rem 1.5rem; border-radius: 1rem; border: 1px solid var(--slate-200); }
        .r-meta-label { font-size: 10px; color: var(--slate-400); font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
        .r-meta-val { font-size: 1rem; color: var(--slate-700); font-weight: 700; margin: 0; }
        .r-modal-body { padding: 3rem; overflow-y: auto; flex-grow: 1; }
        .r-day-section { margin-bottom: 3rem; }
        .r-day-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .r-day-badge { font-size: 0.875rem; font-weight: 900; color: var(--slate-900); text-transform: uppercase; letter-spacing: 0.1em; background: var(--slate-100); padding: 0.5rem 1.5rem; border-radius: 9999px; border: 1px solid var(--slate-200); }
        .r-day-line { flex-grow: 1; height: 1px; background: var(--slate-100); }
        .r-exercises-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .r-ex-card { background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: 1rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .r-ex-name { color: var(--slate-900); font-weight: 700; text-transform: uppercase; letter-spacing: -0.025em; font-size: 0.875rem; margin-bottom: 0.25rem; }
        .r-ex-stats { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate-400); }
        .r-ex-accent { color: var(--blue-500); }
        .r-video-btn { width: 2.5rem; height: 2.5rem; background: white; color: var(--blue-500); border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--slate-200); text-decoration: none; transition: all 0.3s; }
        .r-video-btn:hover { background: var(--blue-500); color: white; }

        /* --- ENTRENADORES (recovered_entrenadores.html parity) --- */
        .t-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 3rem; }
        .t-card {
            background: white; border-radius: 1rem; border: 1px solid var(--slate-100); padding: 2.5rem;
            text-align: center; display: flex; flex-direction: column; align-items: center; transition: all 0.3s; height: 100%;
        }
        .t-card:hover { border-color: var(--blue-500); transform: translateY(-5px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); }
        .t-avatar { width: 7rem; height: 7rem; border-radius: 9999px; border: 4px solid var(--slate-50); overflow: hidden; margin-bottom: 2rem; transition: all 0.5s; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
        .t-card:hover .t-avatar { transform: scale(1.05); }
        .t-img { width: 100%; height: 100%; object-fit: cover; }
        .t-specialty { color: var(--blue-600); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; background: #eff6ff; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 0.5rem; border: 1px solid #dbeafe; display: inline-block; }
        .t-name { font-size: 1.25rem; font-weight: 900; color: var(--slate-900); text-transform: uppercase; letter-spacing: -0.025em; margin: 0 0 1.5rem 0; }
        .t-bio { color: var(--slate-500); font-size: 0.875rem; line-height: 1.625; margin-bottom: 2rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .t-actions { width: 100%; display: flex; gap: 1rem; margin-top: auto; padding-top: 2rem; border-top: 1px solid var(--slate-100); }
        .t-wa-btn { flex-grow: 1; background: var(--blue-500); color: white; padding: 0.75rem; border-radius: 0.5rem; font-weight: 900; text-transform: uppercase; font-size: 10px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2); }
        .t-wa-btn:hover { box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.2); background: var(--blue-600); }
        .t-ig-btn { width: 3rem; height: 3rem; background: var(--slate-50); color: var(--slate-500); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s; font-size: 1.25rem; border: 1px solid var(--slate-100); }
        .t-ig-btn:hover { background: var(--slate-100); color: var(--blue-500); }
    `;

    function ensureArray(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try { return JSON.parse(data); } catch(e) { return []; }
    }

    class WisbeBase extends HTMLElement {
        constructor() { super(); this.attachShadow({ mode: 'open' }); this.supabase = null; this.ownerId = null; }

        async connectedCallback() {
            this.renderLoading();
            try {
                const supabaseLib = await getSupabase();
                this.supabase = supabaseLib.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
                const domain = this.getAttribute('domain');
                if (!domain) return this.renderError('Atributo [domain] no configurado.');
                this.ownerId = await this.resolveOwner(domain);
                if (!this.ownerId) return this.renderError(`Dominio "${domain}" no reconocido.`);
                this.loadData();
            } catch (err) { this.renderError('Error de red Wisbe.'); }
        }

        async resolveOwner(domain) {
            const clean = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
            let { data: u } = await this.supabase.from('wisbe_users').select('id').ilike('domain', domain.trim()).eq('role', 'gym-owner').maybeSingle();
            if (u) return u.id;
            let { data: u2 } = await this.supabase.from('wisbe_users').select('id').ilike('domain', clean).eq('role', 'gym-owner').maybeSingle();
            if (u2) return u2.id;
            return null;
        }

        renderLoading() { this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="loader"><i class="fas fa-spinner fa-spin"></i> Sincronizando...</div>`; }
        renderError(msg) { this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="container"><div class="error"><i class="fas fa-exclamation-triangle"></i> ${msg}</div></div>`; }
    }

    class WisbeNutricion extends WisbeBase {
        async loadData() {
            const { data, error } = await this.supabase.from('gym_recipes').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Fallo base de datos.');
            this.recipes = data || [];
            this.render();
        }

        render() {
            if (this.recipes.length === 0) { this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="loader">Biblioteca vacía.</div>`; return; }
            this.shadowRoot.innerHTML = `
                <style>${BASE_STYLES}</style>
                <div class="container">
                    <div class="n-filters animate-fade-in">
                        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
                            <select id="f-diet" class="n-filter-select">
                                <option value="All">Dieta: Todas</option><option value="Keto">Keto</option><option value="Vegana">Vegana</option><option value="Alta Proteína">Alta Proteína</option><option value="Sin Gluten">Sin Gluten</option><option value="Equilibrada">Equilibrada</option>
                            </select>
                            <select id="f-cat" class="n-filter-select">
                                <option value="All">Categoría: Todas</option><option value="Desayuno">Desayuno</option><option value="Almuerzo">Almuerzo</option><option value="Cena">Cena</option><option value="Postre Fitness">Postre</option><option value="Snack Proteico">Snack</option>
                            </select>
                        </div>
                        <div id="count" class="n-results-count">Escaneando...</div>
                    </div>
                    <div id="grid" class="grid n-grid"></div>
                </div>
                <div id="modal-host"></div>
            `;
            const upd = () => {
                const d = this.shadowRoot.getElementById('f-diet').value, c = this.shadowRoot.getElementById('f-cat').value;
                const f = this.recipes.filter(r => (d === 'All' || r.diet_type === d) && (c === 'All' || r.category === c));
                this.shadowRoot.getElementById('count').innerText = `${f.length} Opciones Maestro`;
                this.renderGrid(f);
            };
            this.shadowRoot.getElementById('f-diet').onchange = upd;
            this.shadowRoot.getElementById('f-cat').onchange = upd;
            upd();
        }

        renderGrid(recipes) {
            const grid = this.shadowRoot.getElementById('grid');
            grid.innerHTML = recipes.map((r, i) => `
                <div class="n-card animate-fade-in" style="animation-delay:${i*0.05}s">
                    <div class="n-img-wrapper">
                        <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}" class="n-img">
                        <span class="n-badge">${r.category}</span>
                    </div>
                    <div class="n-content">
                        <h3 class="n-title">${r.title}</h3>
                        <div class="n-stats">
                            <div class="n-stat"><span class="n-stat-val">${r.calories || 0}</span><span>Kcal</span></div>
                            <div class="n-stat"><span class="n-stat-val-alt">${r.protein || 0}g</span><span>Prote</span></div>
                        </div>
                        <button class="n-btn open-btn" data-id="${r.id}">Receta Master</button>
                    </div>
                </div>
            `).join('');
            grid.querySelectorAll('.open-btn').forEach(b => b.onclick = () => this.openModal(this.recipes.find(x => x.id == b.dataset.id)));
        }

        openModal(r) {
            const host = this.shadowRoot.getElementById('modal-host');
            host.innerHTML = `
                <div class="n-modal-overlay">
                    <div class="n-modal-container animate-fade-in">
                        <div class="n-modal-left">
                            <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'}" class="n-modal-img">
                            <div class="n-modal-img-overlay">
                                <span class="n-modal-badge">${r.category}</span>
                                <h2 class="n-modal-title">${r.title}</h2>
                            </div>
                        </div>
                        <div class="n-modal-right">
                            <div class="n-modal-header">
                                <div class="n-modal-macros">
                                    <div class="n-macro-box"><span class="n-macro-val">${r.calories || 0}</span><span class="n-macro-label">Kcal</span></div>
                                    <div class="n-macro-box"><span class="n-macro-val n-macro-val-dark">${r.protein || 0}</span><span class="n-macro-label">Proteínas</span></div>
                                    <div class="n-macro-box"><span class="n-macro-val n-macro-val-dark">${r.carbs || 0}</span><span class="n-macro-label">Carbs</span></div>
                                    <div class="n-macro-box"><span class="n-macro-val n-macro-val-dark">${r.fats || 0}</span><span class="n-macro-label">Grasas</span></div>
                                </div>
                                <button class="n-close-btn m-close"><i class="fas fa-times-circle"></i></button>
                            </div>
                            <div class="n-section-grid">
                                <div>
                                    <h4 class="n-sec-title"><span class="n-sec-num">01</span> Ingredientes</h4>
                                    <div class="n-ingredients">${ensureArray(r.ingredients).join('\n') || r.ingredients}</div>
                                </div>
                                <div>
                                    <h4 class="n-sec-title"><span class="n-sec-num">02</span> Bio-Datos</h4>
                                    <div class="n-biodata">
                                        <div class="n-bio-row"><span class="n-bio-label">⏱ Tiempo</span><span class="n-bio-val">${r.prep_time || '20 min'}</span></div>
                                        <div class="n-bio-row"><span class="n-bio-label">🔪 Dificultad</span><span class="n-bio-val n-bio-val-accent">${r.difficulty || 'Media'}</span></div>
                                        <div class="n-bio-row"><span class="n-bio-label">🥗 Estilo</span><span class="n-bio-val">${r.diet_type || 'Equilibrada'}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 class="n-sec-title"><span class="n-sec-num">03</span> Preparación Master</h4>
                                <div class="n-instructions-box">${ensureArray(r.instructions).join('\n') || r.instructions}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            host.querySelector('.m-close').onclick = () => { host.innerHTML = ''; document.body.style.overflow = 'auto'; };
            document.body.style.overflow = 'hidden';
        }
    }

    class WisbeRutinas extends WisbeBase {
        async loadData() {
            const { data, error } = await this.supabase.from('gym_routines').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Fallo rutinas.');
            this.routines = data || [];
            this.render();
        }

        render() {
            if (this.routines.length === 0) { this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="loader">Sin planes activos.</div>`; return; }
            this.shadowRoot.innerHTML = `
                <style>${BASE_STYLES}</style>
                <div class="container">
                    <div id="grid" class="grid r-grid">
                        ${this.routines.map((r, i) => `
                            <div class="r-card animate-fade-in open-btn" style="animation-delay:${i*0.1}s" data-id="${r.id}">
                                <div class="r-icon"><i class="fas fa-dumbbell"></i></div>
                                <h3 class="r-title">${r.title}</h3>
                                <div class="r-meta">
                                    <span class="r-badge">${r.difficulty_level}</span>
                                    <span><i class="far fa-calendar-alt"></i> ${r.plan_duration_weeks} SEMANAS</span>
                                </div>
                                <div class="r-footer">Explorar Plan <i class="fas fa-arrow-right"></i></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div id="modal-host"></div>
            `;
            this.shadowRoot.querySelectorAll('.open-btn').forEach(b => b.onclick = () => this.openModal(this.routines.find(x => x.id == b.dataset.id)));
        }

        openModal(r) {
            const host = this.shadowRoot.getElementById('modal-host');
            const exData = ensureArray(r.exercises);
            host.innerHTML = `
                <div class="r-modal-overlay">
                    <div class="r-modal-container animate-fade-in">
                        <button class="r-modal-close m-close"><i class="fas fa-times"></i></button>
                        <div class="r-modal-header">
                            <span class="r-modal-subtitle">${r.difficulty_level}</span>
                            <h2 class="r-modal-title">${r.title}</h2>
                            <div class="r-modal-meta">
                                <div class="r-meta-box"><p class="r-meta-label">Duración</p><p class="r-meta-val">${r.plan_duration_weeks} Semanas</p></div>
                                <div class="r-meta-box"><p class="r-meta-label">Público</p><p class="r-meta-val">${r.target_gender}</p></div>
                            </div>
                        </div>
                        <div class="r-modal-body">
                            ${exData.map((d, i) => `
                                <div class="r-day-section">
                                    <div class="r-day-header"><span class="r-day-badge">${d.day}</span><div class="r-day-line"></div></div>
                                    <div class="r-exercises-grid">
                                        ${ensureArray(d.exercises).map(ex => `
                                            <div class="r-ex-card">
                                                <div><p class="r-ex-name">${ex.name}</p><p class="r-ex-stats"><span class="r-ex-accent">${ex.sets}</span> Series &times; <span class="r-ex-accent">${ex.reps}</span> Reps</p></div>
                                                ${ex.video ? `<a href="${ex.video}" target="_blank" class="r-video-btn"><i class="fas fa-play" style="font-size:10px;"></i></a>` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            host.querySelector('.m-close').onclick = () => { host.innerHTML = ''; document.body.style.overflow = 'auto'; };
            document.body.style.overflow = 'hidden';
        }
    }

    class WisbeEntrenadores extends WisbeBase {
        async loadData() {
            const { data, error } = await this.supabase.from('gym_trainers').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Fallo equipo.');
            this.trainers = data || [];
            this.render();
        }

        render() {
            if (this.trainers.length === 0) { this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="loader">Equipo en actualización.</div>`; return; }
            this.shadowRoot.innerHTML = `
                <style>${BASE_STYLES}</style>
                <div class="container"><div class="grid t-grid">
                    ${this.trainers.map((t, i) => `
                        <div class="t-card animate-fade-in" style="animation-delay:${i*0.1}s">
                            <div class="t-avatar"><img src="${t.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80'}" class="t-img"></div>
                            <span class="t-specialty">${t.specialty}</span>
                            <h3 class="t-name">${t.full_name}</h3>
                            <p class="t-bio">${t.bio || 'Sin descripción.'}</p>
                            <div class="t-actions">
                                ${t.whatsapp_url ? `<a href="${t.whatsapp_url}" target="_blank" class="t-wa-btn">Contactar <i class="fab fa-whatsapp"></i></a>` : ''}
                                ${t.instagram_url ? `<a href="https://instagram.com/${t.instagram_url.replace('@','')}" target="_blank" class="t-ig-btn"><i class="fab fa-instagram"></i></a>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div></div>
            `;
        }
    }

    if (!customElements.get('wisbe-gymnutricion')) customElements.define('wisbe-gymnutricion', WisbeNutricion);
    if (!customElements.get('wisbe-gymrutinas')) customElements.define('wisbe-gymrutinas', WisbeRutinas);
    if (!customElements.get('wisbe-gymentrenadores')) customElements.define('wisbe-gymentrenadores', WisbeEntrenadores);
})();
