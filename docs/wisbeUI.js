/**
 * WisbeUI.js - Sistema de Widgets mediante Custom Elements
 * Diseño de Lujo - Sin Dependencias Externas de Renderizado (CSS Nativo)
 */

(function() {
    const CONFIG = {
        SUPABASE_URL: 'https://wwcmtqqbxdamxebkfsqk.supabase.co',
        SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Y210cXFieGRhbXhlYmtmc3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDUzNzksImV4cCI6MjA5MDA4MTM3OX0.4C5gGKxJrpF5BS8FfEAu8FLa9VudEHxCYxwwtb991Io'
    };

    // Lazy load Supabase if not present
    let supabaseLoadingPromise = null;
    async function getSupabase() {
        if (window.supabase) return window.supabase;
        if (supabaseLoadingPromise) return supabaseLoadingPromise;

        supabaseLoadingPromise = new Promise((resolve) => {
            const existingScript = document.querySelector('script[src*="supabase-js"]');
            if (existingScript) {
                if (window.supabase) resolve(window.supabase);
                else {
                    const checkInterval = setInterval(() => {
                        if (window.supabase) {
                            clearInterval(checkInterval);
                            resolve(window.supabase);
                        }
                    }, 100);
                }
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => resolve(window.supabase);
            document.head.appendChild(script);
        });
        return supabaseLoadingPromise;
    }

    const SHARED_STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700;900&family=Playfair+Display:wght@700;900&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :host {
            display: block !important;
            width: 100% !important;
            font-family: 'Raleway', 'Inter', -apple-system, sans-serif;
            --wisbe-emerald: #059669;
            --wisbe-emerald-light: #ecfdf5;
            --wisbe-blue: #2563eb;
            --wisbe-blue-light: #eff6ff;
            --wisbe-slate-950: #020617;
            --wisbe-slate-900: #0f172a;
            --wisbe-slate-800: #1e293b;
            --wisbe-slate-500: #64748b;
            --wisbe-slate-400: #94a3b8;
            --wisbe-slate-200: #e2e8f0;
            --wisbe-slate-100: #f1f5f9;
            --wisbe-slate-50: #f8fafc;
        }

        * { box-sizing: border-box; }

        .wisbe-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 20px; box-sizing: border-box; }

        /* Loader & Errors */
        .wisbe-loader { padding: 100px 20px; text-align: center; color: var(--wisbe-slate-500); font-weight: bold; }
        .wisbe-error { padding: 40px; text-align: center; color: #ef4444; background: #fef2f2; border-radius: 20px; }
        .wisbe-empty { padding: 80px 20px; text-align: center; color: var(--wisbe-slate-400); font-style: italic; }

        /* Robust Grid System */
        .wisbe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2.5rem;
            width: 100%;
        }

        /* Cards Luxury Design */
        .card {
            background: white;
            border-radius: 50px;
            border: 1px solid var(--wisbe-slate-50);
            overflow: hidden;
            transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            height: 100%;
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .card:hover {
            transform: translateY(-12px);
            box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        }

        .card-image-wrapper { height: 16rem; position: relative; overflow: hidden; background: var(--wisbe-slate-100); }
        .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 1s; filter: grayscale(0.2); }
        .card:hover .card-image { transform: scale(1.25); filter: grayscale(0); }

        .badge {
            position: absolute; top: 1.5rem; left: 1.5rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;
            color: var(--wisbe-emerald);
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            z-index: 10;
        }

        .card-content { padding: 2.5rem; flex-grow: 1; display: flex; flex-direction: column; }
        .card-title { font-size: 1.5rem; font-weight: 900; color: var(--wisbe-slate-900); margin-bottom: 1.5rem; letter-spacing: -0.025em; line-height: 1.2; }

        .card-stats {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 2.5rem; padding: 1.5rem 0;
            border-top: 1px solid var(--wisbe-slate-100); border-bottom: 1px solid var(--wisbe-slate-100);
            font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--wisbe-slate-400);
            gap: 1rem;
        }
        .stat-item { text-align: center; flex: 1; }
        .stat-value { display: block; font-size: 1.5rem; font-weight: 900; color: var(--wisbe-slate-900); margin-bottom: 0.25rem; }
        .stat-value.emerald { color: var(--wisbe-emerald); }

        .btn-primary {
            width: 100%; padding: 1.25rem 0.5rem; background: var(--wisbe-slate-900); color: white;
            font-weight: 900; border-radius: 1.5rem; border: none; cursor: pointer;
            transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            display: block; margin-top: auto;
            text-align: center; text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .btn-primary:hover { background: var(--wisbe-emerald); box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.2); }

        /* Filters */
        .filters-container {
            background: white; border-radius: 40px; border: 1px solid var(--wisbe-slate-100);
            padding: 2rem; margin-bottom: 5rem;
            display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; justify-content: space-between;
        }
        .filter-group { display: flex; flex-wrap: wrap; gap: 1rem; }
        .filter-select {
            background: var(--wisbe-slate-50); padding: 0.75rem 2rem; border-radius: 1rem;
            font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--wisbe-slate-500);
            border: 1px solid transparent; outline: none; transition: all 0.3s; cursor: pointer;
        }
        .filter-select:focus { border-color: var(--wisbe-emerald); background: white; }
        .results-count { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--wisbe-slate-400); }

        /* Modal Ultra Luxury */
        .modal-overlay {
            position: fixed; inset: 0; background: rgba(2, 6, 23, 0.85); z-index: 10000;
            display: flex; align-items: center; justify-content: center; padding: 2rem; backdrop-filter: blur(12px);
        }
        .modal-container {
            background: white; width: 100%; max-width: 1152px; max-height: 90vh;
            border-radius: 60px; overflow: hidden; display: flex; flex-direction: column;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        @media (min-width: 1280px) { .modal-container { flex-direction: row; } }

        .modal-aside { position: relative; width: 100%; height: 20rem; flex-shrink: 0; }
        @media (min-width: 1280px) { .modal-aside { width: 41.666667%; height: auto; } }
        .modal-aside-img { width: 100%; height: 100%; object-fit: cover; }
        .modal-aside-overlay {
            position: absolute; inset: 0; background: linear-gradient(to top, black, transparent);
            display: flex; flex-direction: column; justify-content: flex-end; padding: 3rem;
        }
        .modal-aside-badge {
            background: var(--wisbe-emerald); color: white; padding: 0.5rem 1.25rem; border-radius: 1rem;
            font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; width: fit-content; margin-bottom: 1rem;
        }
        .modal-aside-title { font-size: 3rem; font-weight: 900; color: white; line-height: 0.9; letter-spacing: -0.05em; margin: 0; }

        .modal-main { width: 100%; padding: 2rem; overflow-y: auto; background: white; display: flex; flex-direction: column; flex-grow: 1; }
        @media (min-width: 1280px) { .modal-main { width: 58.333333%; padding: 4rem; } }

        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem; }
        .modal-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; width: 100%; margin-right: 1.5rem; }
        @media (min-width: 640px) { .modal-stats-grid { grid-template-columns: repeat(4, 1fr); } }

        .modal-stat-card {
            background: var(--wisbe-slate-50); padding: 1.5rem; border-radius: 35px; text-align: center; border: 1px solid var(--wisbe-slate-100); transition: all 0.3s;
        }
        .modal-stat-card:hover { background: var(--wisbe-emerald-light); }
        .modal-stat-card .val { display: block; font-size: 1.875rem; font-weight: 900; color: var(--wisbe-emerald); transition: transform 0.3s; }
        .modal-stat-card:hover .val { transform: scale(1.1); }
        .modal-stat-card .label { font-size: 8px; font-weight: 900; color: var(--wisbe-slate-400); text-transform: uppercase; letter-spacing: 0.1em; }

        .close-btn { color: var(--wisbe-slate-400); font-size: 1.5rem; background: var(--wisbe-slate-50); width: 3.5rem; height: 3.5rem; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.3s; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .close-btn:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

        .modal-container-full { max-height: 95vh; overflow-y: auto; }
        @media (min-width: 1280px) { .modal-container-full { overflow-y: hidden; } }

        .modal-section-title { font-size: 1.25rem; font-weight: 900; color: var(--wisbe-slate-800); margin-bottom: 1.5rem; display: flex; align-items: center; text-transform: uppercase; letter-spacing: -0.025em; }
        .num-tag { width: 2rem; height: 2rem; background: var(--wisbe-emerald-light); color: var(--wisbe-emerald); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin-right: 0.75rem; font-weight: 900; flex-shrink: 0; }

        .modal-ingredients { color: var(--wisbe-slate-600); line-height: 2; white-space: pre-wrap; padding-left: 1.5rem; border-left: 2px solid var(--wisbe-emerald-light); font-size: 0.875rem; font-style: italic; }
        .modal-bio-data { display: flex; flex-direction: column; gap: 1rem; }
        .bio-item { background: var(--wisbe-slate-50); padding: 1rem; border-radius: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 900; text-transform: uppercase; color: var(--wisbe-slate-400); border: 1px solid var(--wisbe-slate-100); }
        .bio-item span:last-child { color: var(--wisbe-slate-900); }
        .bio-item .highlight { color: var(--wisbe-emerald); }

        .modal-instructions { color: var(--wisbe-slate-600); line-height: 1.625; white-space: pre-wrap; font-size: 0.875rem; background: var(--wisbe-slate-50); padding: 2.5rem; border-radius: 40px; border: 2px dashed var(--wisbe-slate-100); }

        /* Routines Extras */
        .routine-icon-box { width: 4rem; height: 4rem; background: var(--wisbe-blue-light); color: var(--wisbe-blue); border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 2rem; transition: all 0.5s; border: 1px solid #dbeafe; }
        .card:hover .routine-icon-box { background: var(--wisbe-blue); color: white; transform: scale(1.1); }
        .routine-badges { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .routine-badge { padding: 0.375rem 1rem; border-radius: 0.5rem; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border: 1px solid var(--wisbe-slate-100); }
        .routine-badge.difficulty { background: var(--wisbe-slate-50); color: var(--wisbe-slate-400); }
        .routine-badge.duration { background: var(--wisbe-blue-light); color: var(--wisbe-blue); border-color: #dbeafe; }

        .day-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .day-tag { display: inline-block; padding: 0.625rem 1.75rem; background: var(--wisbe-slate-50); color: var(--wisbe-slate-900); border-radius: 9999px; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; border: 1px solid var(--wisbe-slate-200); }
        .day-line { flex-grow: 1; h-px: 1px; background: var(--wisbe-slate-100); }

        .exercise-card { padding: 1.5rem; background: var(--wisbe-slate-50); border-radius: 20px; border: 1px solid var(--wisbe-slate-200); transition: all 0.3s; display: flex; justify-content: space-between; align-items: center; text-align: left; }
        .exercise-card:hover { border-color: var(--wisbe-blue); background: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .exercise-name { font-weight: 900; color: var(--wisbe-slate-900); font-size: 0.875rem; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: -0.01em; }
        .exercise-meta { display: flex; gap: 0.5rem; font-size: 9px; font-weight: 900; color: var(--wisbe-slate-400); text-transform: uppercase; letter-spacing: 0.1em; }
        .exercise-meta .highlight { color: var(--wisbe-blue); }
        .exercise-video-btn { width: 2.5rem; height: 2.5rem; background: white; color: var(--wisbe-blue); border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--wisbe-slate-200); transition: all 0.3s; text-decoration: none; }
        .exercise-video-btn:hover { background: var(--wisbe-blue); color: white; transform: scale(1.1); }

        /* Trainers Extras */
        .trainer-avatar { width: 7rem; height: 7rem; border-radius: 9999px; border: 4px solid var(--wisbe-slate-50); overflow: hidden; margin-bottom: 2rem; background: var(--wisbe-slate-100); position: relative; transition: transform 0.5s; }
        .card:hover .trainer-avatar { transform: scale(1.05); }
        .trainer-specialty { font-size: 10px; font-weight: 900; color: var(--wisbe-blue); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; padding: 0.25rem 0.75rem; background: var(--wisbe-blue-light); border-radius: 9999px; display: inline-block; border: 1px solid #dbeafe; }
        .trainer-bio { font-size: 0.875rem; color: var(--wisbe-slate-500); margin-bottom: 2rem; line-height: 1.625; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .trainer-footer { border-top: 1px solid var(--wisbe-slate-100); padding-top: 1.5rem; width: 100%; display: flex; justify-content: center; gap: 0.75rem; margin-top: auto; }
        .social-link { width: 3rem; height: 3rem; border-radius: 0.75rem; background: var(--wisbe-slate-50); color: var(--wisbe-slate-400); display: flex; align-items: center; justify-content: center; font-size: 1.125rem; transition: all 0.3s; text-decoration: none; border: 1px solid var(--wisbe-slate-100); }
        .social-link.wa-btn { flex-grow: 1; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; background: var(--wisbe-blue); color: white; border: none; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2); display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .social-link.wa-btn:hover { background: #10b981; transform: translateY(-2px); }
        .social-link.ig:hover { background: white; color: #ec4899; border-color: #f9a8d4; transform: translateY(-2px); }

        /* Utils */
        .animate-fade-in { animation: fadeIn 0.8s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hidden { display: none !important; }

        .grid-layout { display: flex; flex-direction: column; gap: 4rem; }
    `;

    // --- UTILS ---
    function formatList(data) {
        if (!data) return "";
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            if (Array.isArray(parsed)) {
                return parsed.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join('\n');
            }
            return parsed;
        } catch(e) {
            return data;
        }
    }

    function ensureParsed(data) {
        if (!data) return [];
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return Array.isArray(parsed) ? parsed : [];
        } catch(e) {
            console.error("[Wisbe] Parse error:", e);
            return [];
        }
    }

    class WisbeBaseWidget extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.supabase = null;
            this.ownerId = null;
        }

        async connectedCallback() {
            this.renderLoading();
            const supabaseLib = await getSupabase();
            this.supabase = supabaseLib.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

            const domain = this.getAttribute('domain');
            if (!domain) {
                this.renderError('Atributo "domain" es requerido.');
                return;
            }

            this.ownerId = await this.resolveOwner(domain);
            if (!this.ownerId) {
                this.renderError('Gimnasio no encontrado o no configurado.');
                return;
            }

            this.fetchAndRender();
        }

        async resolveOwner(domain) {
            let cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            let { data: user } = await this.supabase.from('wisbe_users').select('id').ilike('domain', domain.trim()).eq('role', 'gym-owner').maybeSingle();
            if (!user) {
                let { data: users } = await this.supabase.from('wisbe_users').select('id').ilike('domain', `%${cleanDomain}%`).eq('role', 'gym-owner').limit(1);
                user = users ? users[0] : null;
            }
            return user ? user.id : null;
        }

        renderLoading() {
            this.shadowRoot.innerHTML = `
                <style>${SHARED_STYLES}</style>
                <div class="wisbe-loader"><i class="fas fa-sync fa-spin"></i> Sincronizando con Wisbe.xyz...</div>
            `;
        }

        renderError(msg) {
            this.shadowRoot.innerHTML = `
                <style>${SHARED_STYLES}</style>
                <div class="wisbe-error">${msg}</div>
            `;
        }

        renderEmpty() {
             this.shadowRoot.innerHTML = `
                <style>${SHARED_STYLES}</style>
                <div class="wisbe-container">
                    <div class="wisbe-empty">Aún no hay contenido disponible para este gimnasio.</div>
                </div>
            `;
        }
    }

    // --- WIDGET NUTRICION ---
    class WisbeGymNutricion extends WisbeBaseWidget {
        constructor() {
            super();
            this.allRecipes = [];
        }

        async fetchAndRender() {
            const { data, error } = await this.supabase.from('gym_recipes').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Error de conexión.');

            this.allRecipes = data || [];
            if (this.allRecipes.length === 0) return this.renderEmpty();

            this.renderLayout();
            this.filterRecipes();
        }

        renderLayout() {
            this.shadowRoot.innerHTML = `
                <style>${SHARED_STYLES}</style>
                <div class="wisbe-container">
                    <div class="filters-container">
                        <div class="filter-group">
                            <select id="diet-filter" class="filter-select">
                                <option value="All">Dieta: Todas</option>
                                <option value="Keto">Keto</option>
                                <option value="Vegana">Vegana</option>
                                <option value="Alta Proteína">Alta Proteína</option>
                                <option value="Sin Gluten">Sin Gluten</option>
                                <option value="Equilibrada">Equilibrada</option>
                            </select>
                            <select id="cat-filter" class="filter-select">
                                <option value="All">Categoría: Todas</option>
                                <option value="Desayuno">Desayuno</option>
                                <option value="Almuerzo">Almuerzo</option>
                                <option value="Cena">Cena</option>
                                <option value="Postre Fitness">Postre</option>
                                <option value="Snack Proteico">Snack</option>
                            </select>
                        </div>
                        <div id="recipe-count" class="results-count">0 Opciones Maestro</div>
                    </div>

                    <div id="recipes-grid" class="wisbe-grid">
                        <!-- Grid content -->
                    </div>
                </div>
                <div id="modal-host"></div>
            `;

            this.shadowRoot.getElementById('diet-filter').addEventListener('change', () => this.filterRecipes());
            this.shadowRoot.getElementById('cat-filter').addEventListener('change', () => this.filterRecipes());
        }

        filterRecipes() {
            const diet = this.shadowRoot.getElementById('diet-filter').value;
            const cat = this.shadowRoot.getElementById('cat-filter').value;
            const filtered = this.allRecipes.filter(r => (diet === 'All' || r.diet_type === diet) && (cat === 'All' || r.category === cat));
            this.shadowRoot.getElementById('recipe-count').innerText = `${filtered.length} Opciones Maestro`;
            this.renderGrid(filtered);
        }

        renderGrid(recipes) {
            const grid = this.shadowRoot.getElementById('recipes-grid');
            if (recipes.length === 0) {
                grid.innerHTML = '<div class="wisbe-empty" style="grid-column: 1/-1">No se encontraron recetas con estos filtros.</div>';
                return;
            }

            grid.innerHTML = recipes.map((r, index) => `
                <div class="card animate-fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="card-image-wrapper">
                        <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}" class="card-image">
                        <span class="badge">${r.category}</span>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${r.title}</h3>
                        <div class="card-stats">
                            <div class="stat-item">
                                <span class="stat-value emerald">${r.calories || 0}</span>
                                <span>Kcal</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${r.protein || 0}g</span>
                                <span>Prote</span>
                            </div>
                        </div>
                        <button class="btn-primary recipe-btn" data-id="${r.id}">Receta Master</button>
                    </div>
                </div>
            `).join('');

            grid.querySelectorAll('.recipe-btn').forEach(btn => {
                btn.onclick = () => {
                    const recipe = recipes.find(rec => rec.id == btn.dataset.id);
                    this.openModal(recipe);
                };
            });
        }

        openModal(r) {
            const host = this.shadowRoot.getElementById('modal-host');
            host.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-container animate-fade-in">
                        <div class="modal-aside">
                            <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'}" class="modal-aside-img">
                            <div class="modal-aside-overlay">
                                <span class="modal-aside-badge">${r.category}</span>
                                <h2 class="modal-aside-title">${r.title}</h2>
                            </div>
                        </div>
                        <div class="modal-main">
                            <div class="modal-header">
                                <div class="modal-stats-grid">
                                    <div class="modal-stat-card"><span class="val">${r.calories || 0}</span><span class="label">Kcal</span></div>
                                    <div class="modal-stat-card"><span class="val" style="color:var(--wisbe-slate-900)">${r.protein || 0}</span><span class="label">Proteínas</span></div>
                                    <div class="modal-stat-card"><span class="val" style="color:var(--wisbe-slate-900)">${r.carbs || 0}</span><span class="label">Carbs</span></div>
                                    <div class="modal-stat-card"><span class="val" style="color:var(--wisbe-slate-900)">${r.fats || 0}</span><span class="label">Grasas</span></div>
                                </div>
                                <button class="close-btn"><i class="fas fa-times-circle"></i></button>
                            </div>
                            <div class="grid-layout">
                                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:3rem;">
                                    <div>
                                        <h4 class="modal-section-title"><span class="num-tag">01</span> Ingredientes</h4>
                                        <div class="modal-ingredients">${formatList(r.ingredients)}</div>
                                    </div>
                                    <div>
                                        <h4 class="modal-section-title"><span class="num-tag">02</span> Bio-Datos</h4>
                                        <div class="modal-bio-data">
                                            <div class="bio-item"><span>⏱ Tiempo</span> <span>${r.prep_time || '20 min'}</span></div>
                                            <div class="bio-item"><span>🔪 Dificultad</span> <span class="highlight">${r.difficulty || 'Media'}</span></div>
                                            <div class="bio-item"><span>🥗 Estilo</span> <span>${r.diet_type || 'Equilibrada'}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="modal-section-title"><span class="num-tag">03</span> Preparación Master</h4>
                                    <div class="modal-instructions">${formatList(r.instructions)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            host.querySelector('.close-btn').onclick = () => host.innerHTML = '';
        }
    }

    // --- WIDGET RUTINAS ---
    class WisbeGymRutinas extends WisbeBaseWidget {
        async fetchAndRender() {
            const { data, error } = await this.supabase.from('gym_routines').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Error de conexión.');

            const routines = data || [];
            if (routines.length === 0) return this.renderEmpty();
            this.renderContent(routines);
        }

        renderContent(routines) {
            this.shadowRoot.innerHTML = `
                <style>${SHARED_STYLES}</style>
                <div class="wisbe-container">
                    <div id="routines-grid" class="wisbe-grid">
                        ${routines.map((r, index) => `
                            <div class="card animate-fade-in" style="padding:2.5rem; cursor:pointer; border-radius:40px;" data-id="${r.id}">
                                <div class="routine-icon-box"><i class="fas fa-dumbbell"></i></div>
                                <h3 class="card-title">${r.title}</h3>
                                <div class="routine-badges">
                                    <span class="routine-badge difficulty">${r.difficulty_level}</span>
                                    <span class="routine-badge duration">${r.plan_duration_weeks} Semanas</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div id="modal-host"></div>
            `;

            this.shadowRoot.querySelectorAll('.card').forEach(card => {
                card.onclick = () => {
                    const routine = routines.find(rout => rout.id == card.dataset.id);
                    this.openModal(routine);
                };
            });
        }

        openModal(r) {
            const host = this.shadowRoot.getElementById('modal-host');
            const exercises = ensureParsed(r.exercises);
            host.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-container modal-container-full animate-fade-in" style="max-width:1024px; flex-direction:column;">
                        <div style="padding:2.5rem; background:var(--wisbe-slate-50); border-bottom:1px solid var(--wisbe-slate-100); display:flex; flex-wrap: wrap; justify-content:space-between; align-items:center; gap: 1.5rem;">
                            <div style="flex-grow: 1; min-width: 250px;">
                                <span style="color:var(--wisbe-blue); font-weight:900; font-size:10px; text-transform:uppercase; letter-spacing:0.2em; display:block; margin-bottom:0.5rem;">${r.difficulty_level}</span>
                                <h2 style="font-size:2.25rem; font-weight:900; color:var(--wisbe-slate-900); margin:0; text-transform:uppercase; letter-spacing:-0.05em;">${r.title}</h2>
                            </div>
                            <div style="display:flex; gap:1rem;">
                                <div style="background:white; padding:0.75rem 1.5rem; border-radius:1rem; border:1px solid var(--wisbe-slate-200); text-align:center;">
                                    <p style="margin:0; font-size:8px; color:var(--wisbe-slate-400); font-weight:900; text-transform:uppercase; letter-spacing:0.1em;">Duración</p>
                                    <p style="margin:0; font-size:12px; color:var(--wisbe-slate-700); font-weight:700;">${r.plan_duration_weeks} Sem</p>
                                </div>
                                <div style="background:white; padding:0.75rem 1.5rem; border-radius:1rem; border:1px solid var(--wisbe-slate-200); text-align:center;">
                                    <p style="margin:0; font-size:8px; color:var(--wisbe-slate-400); font-weight:900; text-transform:uppercase; letter-spacing:0.1em;">Público</p>
                                    <p style="margin:0; font-size:12px; color:var(--wisbe-slate-700); font-weight:700;">${r.target_gender}</p>
                                </div>
                            </div>
                            <button class="close-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div style="padding:2.5rem; overflow-y:auto; flex:1; background:white;">
                            <div class="grid-layout">
                                ${exercises.map(day => `
                                    <div>
                                        <div class="day-header">
                                            <span class="day-tag">${day.day}</span>
                                            <div class="day-line"></div>
                                        </div>
                                        <div class="wisbe-grid">
                                            ${ensureParsed(day.exercises).map(ex => `
                                                <div class="exercise-card">
                                                    <div>
                                                        <p class="exercise-name">${ex.name}</p>
                                                        <div class="exercise-meta">
                                                            <span class="highlight">${ex.sets}</span> SERIES &times; <span class="highlight">${ex.reps}</span> REPS
                                                        </div>
                                                    </div>
                                                    ${ex.video ? `
                                                        <a href="${ex.video}" target="_blank" class="exercise-video-btn">
                                                            <i class="fas fa-play" style="font-size: 10px; margin-left: 2px;"></i>
                                                        </a>
                                                    ` : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            host.querySelector('.close-btn').onclick = () => host.innerHTML = '';
        }
    }

    // --- WIDGET ENTRENADORES ---
    class WisbeGymEntrenadores extends WisbeBaseWidget {
        async fetchAndRender() {
            const { data, error } = await this.supabase.from('gym_trainers').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Error de conexión.');

            const trainers = data || [];
            if (trainers.length === 0) return this.renderEmpty();
            this.renderContent(trainers);
        }

        renderContent(trainers) {
            this.shadowRoot.innerHTML = `
                <style>${SHARED_STYLES}</style>
                <div class="wisbe-container">
                    <div class="wisbe-grid">
                        ${trainers.map(t => `
                            <div class="card animate-fade-in" style="padding:2.5rem; display:flex; flex-direction:column; align-items:center; text-align:center;">
                                <div class="trainer-avatar">
                                    <img src="${t.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80'}" style="width:100%; height:100%; object-fit:cover;">
                                </div>
                                <h3 class="card-title" style="margin-bottom:0.5rem;">${t.full_name}</h3>
                                <p class="trainer-specialty">${t.specialty}</p>
                                <p class="trainer-bio">${t.bio || 'Sin descripción'}</p>

                                <div class="trainer-footer">
                                    ${t.whatsapp_url ? `<a href="${t.whatsapp_url}" target="_blank" class="social-link wa-btn">Contactar <i class="fab fa-whatsapp"></i></a>` : ''}
                                    ${t.instagram_url ? `<a href="https://instagram.com/${t.instagram_url.replace('@','')}" target="_blank" class="social-link ig"><i class="fab fa-instagram"></i></a>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    // Register elements
    if (!customElements.get('wisbe-gymnutricion')) customElements.define('wisbe-gymnutricion', WisbeGymNutricion);
    if (!customElements.get('wisbe-gymrutinas')) customElements.define('wisbe-gymrutinas', WisbeGymRutinas);
    if (!customElements.get('wisbe-gymentrenadores')) customElements.define('wisbe-gymentrenadores', WisbeGymEntrenadores);

})();
