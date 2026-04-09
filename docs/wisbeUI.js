/**
 * WisbeUI.js - Sistema de Widgets mediante Custom Elements
 * DISEÑO ORIGINAL PRESERVADO - PARIDAD 100% CON PUBLIC PAGES
 */

(function() {
    const CONFIG = {
        SUPABASE_URL: 'https://wwcmtqqbxdamxebkfsqk.supabase.co',
        SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Y210cXFieGRhbXhlYmtmc3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDUzNzksImV4cCI6MjA5MDA4MTM3OX0.4C5gGKxJrpF5BS8FfEAu8FLa9VudEHxCYxwwtb991Io'
    };

    // Lazy load Supabase con protección contra carga dual y mejor manejo de errores
    let isSupabaseLoading = false;
    async function getSupabase() {
        if (window.supabase) return window.supabase;

        if (isSupabaseLoading) {
            return new Promise((resolve) => {
                const check = setInterval(() => {
                    if (window.supabase) {
                        clearInterval(check);
                        resolve(window.supabase);
                    }
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
                if (window.supabase) {
                    console.log('[WisbeUI] Supabase SDK cargado.');
                    resolve(window.supabase);
                }
                else reject(new Error('Supabase no se inicializó correctamente.'));
            };
            script.onerror = () => {
                isSupabaseLoading = false;
                reject(new Error('Error al cargar el script de Supabase.'));
            };
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
            --wisbe-primary: #3b82f6;
            --wisbe-emerald: #10b981;
            --wisbe-slate-900: #0f172a;
        }

        * { box-sizing: border-box; }

        .wisbe-container {
            width: 100%;
            margin-left: auto;
            margin-right: auto;
            padding: 20px;
            max-width: 1400px;
        }

        /* GRID FLEXIBLE: Evita que las tarjetas se vean estrechas en contenedores pequeños */
        .wisbe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 3rem;
            width: 100%;
        }

        .wisbe-loader { padding: 80px; text-align: center; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; }
        .wisbe-error { padding: 40px; text-align: center; color: #ef4444; background: #fef2f2; border-radius: 20px; font-weight: 800; font-size: 11px; text-transform: uppercase; border: 1px solid #fee2e2; }

        /* --- NUTRICION (PARIDAD TOTAL CON NUTRICION.HTML) --- */
        .n-card {
            background: white; border-radius: 50px;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            border: 1px solid #f8fafc;
            overflow: hidden; transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column;
            width: 100%;
        }
        .n-card:hover { transform: translateY(-12px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); }

        /* Imagen Cuadrada (Square Design) para evitar estiramientos */
        .n-img-wrapper {
            width: 100%;
            aspect-ratio: 1 / 1;
            position: relative;
            overflow: hidden;
            background: #f1f5f9;
        }
        .n-img { width: 100%; height: 100%; object-fit: cover; transition: all 1s; filter: grayscale(0.2); }
        .n-card:hover .n-img { transform: scale(1.15); filter: grayscale(0); }

        .n-badge { position: absolute; top: 1.5rem; left: 1.5rem; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 0.6rem 1.2rem; border-radius: 1.25rem; font-size: 10px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 1px; z-index: 10; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

        .n-content { padding: 2.5rem; flex-grow: 1; display: flex; flex-direction: column; }
        .n-title { font-family: 'Montserrat', sans-serif; font-size: 1.5rem; font-weight: 900; color: #1e293b; margin: 0 0 1.5rem 0; line-height: 1.2; text-transform: uppercase; letter-spacing: -0.025em; }

        .n-stats { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 1.5rem 0; margin-bottom: 2rem; }
        .n-stat { text-align: center; }
        .n-stat-val { display: block; font-size: 1.75rem; font-weight: 900; color: #10b981; margin-bottom: 0.25rem; }
        .n-stat-label { font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

        .n-btn { width: 100%; padding: 1.25rem; background: #0f172a; color: white; border-radius: 1.875rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 11px; border: none; cursor: pointer; transition: all 0.3s; margin-top: auto; }
        .n-btn:hover { background: #10b981; box-shadow: 0 15px 30px rgba(16, 185, 129, 0.3); }

        /* --- RUTINAS (PARIDAD TOTAL CON RUTINAS.HTML) --- */
        .r-card {
            background: white; border-radius: 40px; border: 1px solid #f1f5f9; padding: 2.5rem;
            transition: all 0.5s; cursor: pointer; display: flex; flex-direction: column; height: 100%;
        }
        .r-card:hover { border-color: #3b82f6; transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .r-icon { width: 4.5rem; height: 4.5rem; background: #eff6ff; color: #3b82f6; border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin-bottom: 2rem; border: 1px solid #dbeafe; transition: all 0.3s; }
        .r-card:hover .r-icon { background: #3b82f6; color: white; transform: rotate(-5deg); }
        .r-title { font-family: 'Montserrat', sans-serif; font-size: 1.35rem; font-weight: 900; color: #0f172a; margin: 0 0 1.25rem 0; text-transform: uppercase; letter-spacing: -0.025em; }
        .r-meta { display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 2.5rem; }
        .r-badge { background: #f8fafc; padding: 0.4rem 1.1rem; border-radius: 0.6rem; border: 1px solid #f1f5f9; }
        .r-footer { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; color: #3b82f6; font-size: 11px; font-weight: 900; text-transform: uppercase; display: flex; align-items: center; letter-spacing: 1px; }

        /* --- ENTRENADORES (PARIDAD TOTAL CON ENTRENADORES.HTML) --- */
        .t-card {
            background: white; border-radius: 45px; border: 1px solid #f1f5f9; padding: 3rem;
            text-align: center; display: flex; flex-direction: column; align-items: center; transition: all 0.5s; height: 100%;
        }
        .t-card:hover { border-color: #3b82f6; transform: translateY(-10px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); }
        .t-avatar { width: 7.5rem; height: 7.5rem; border-radius: 9999px; border: 5px solid #f8fafc; overflow: hidden; margin-bottom: 2rem; transition: all 0.5s; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .t-card:hover .t-avatar { transform: scale(1.08); border-color: #eff6ff; }
        .t-img { width: 100%; height: 100%; object-fit: cover; }
        .t-specialty { color: #3b82f6; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; background: #eff6ff; padding: 0.5rem 1.25rem; border-radius: 9999px; margin-bottom: 1rem; border: 1px solid #dbeafe; }
        .t-name { font-family: 'Montserrat', sans-serif; font-size: 1.5rem; font-weight: 900; color: #0f172a; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: -0.025em; }
        .t-bio { color: #64748b; font-size: 14px; line-height: 1.7; margin-bottom: 2.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-style: italic; }
        .t-actions { width: 100%; display: flex; gap: 1rem; margin-top: auto; padding-top: 2rem; border-top: 1px solid #f1f5f9; }
        .t-wa-btn { flex-grow: 1; background: #3b82f6; color: white; padding: 1rem; border-radius: 1.25rem; font-weight: 900; text-transform: uppercase; font-size: 11px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: all 0.3s; }
        .t-wa-btn:hover { background: #10b981; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
        .t-ig-btn { width: 3.5rem; height: 3.5rem; background: #f1f5f9; color: #475569; border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s; font-size: 1.25rem; }
        .t-ig-btn:hover { background: #3b82f6; color: white; transform: translateY(-3px); }

        /* --- FILTERS --- */
        .filters { background: white; border-radius: 45px; border: 1px solid #f1f5f9; padding: 1.5rem 3rem; margin-bottom: 5rem; display: flex; flex-wrap: wrap; gap: 2rem; align-items: center; justify-content: space-between; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .filter-select { background: #f8fafc; padding: 1rem 1.75rem; border-radius: 1.25rem; font-size: 10px; font-weight: 900; text-transform: uppercase; border: 1px solid transparent; outline: none; cursor: pointer; color: #64748b; transition: all 0.3s; }
        .filter-select:focus { border-color: #10b981; background: white; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.05); }
        .results-count { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; }

        /* --- MODAL (ULTRA LUXURY) --- */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(15px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-container { background: white; width: 100%; max-width: 1100px; max-height: 92vh; border-radius: 65px; overflow-y: auto; position: relative; padding: 5rem; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.6); }

        .m-close { position: absolute; top: 2.5rem; right: 2.5rem; background: #f8fafc; border: none; width: 4.5rem; height: 4.5rem; border-radius: 9999px; font-size: 1.75rem; color: #cbd5e1; cursor: pointer; transition: all 0.4s; display: flex; align-items: center; justify-content: center; z-index: 100; }
        .m-close:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

        .m-grid { display: grid; grid-template-columns: 1fr; gap: 5rem; }
        @media (min-width: 850px) { .m-grid { grid-template-columns: 1fr 1.4fr; } }

        .m-img { width: 100%; border-radius: 45px; aspect-ratio: 1; object-fit: cover; border: 2px solid #f8fafc; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .m-title { font-family: 'Montserrat', sans-serif; font-size: 3rem; font-weight: 900; margin-bottom: 2.5rem; color: #0f172a; text-transform: uppercase; letter-spacing: -0.06em; line-height: 0.9; }

        .m-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 3.5rem; }
        @media (min-width: 500px) { .m-stats { grid-template-columns: repeat(4, 1fr); } }
        .m-stat { background: #f8fafc; padding: 2rem 1.5rem; border-radius: 40px; text-align: center; border: 1px solid #f1f5f9; transition: all 0.3s; }
        .m-stat:hover { background: #ecfdf5; border-color: #d1fae5; transform: translateY(-5px); }
        .m-stat-val { display: block; font-size: 2.25rem; font-weight: 900; color: #10b981; line-height: 1; margin-bottom: 0.5rem; }
        .m-stat-label { font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }

        .m-section-title { font-family: 'Montserrat', sans-serif; font-size: 1.35rem; font-weight: 900; color: #1e293b; margin-bottom: 2.5rem; text-transform: uppercase; display: flex; align-items: center; letter-spacing: -0.03em; }
        .m-num { width: 2.75rem; height: 2.75rem; background: #ecfdf5; color: #10b981; border-radius: 0.85rem; display: flex; align-items: center; justify-content: center; font-size: 1rem; margin-right: 1.25rem; font-weight: 900; }
        .m-text { color: #64748b; font-size: 15px; line-height: 2.2; white-space: pre-wrap; }
        .m-box { background: #f8fafc; padding: 3.5rem; border-radius: 50px; border: 3px dashed #e2e8f0; }

        .animate-fade-in { animation: fadeIn 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    `;

    function ensureArray(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try { return JSON.parse(data); } catch(e) { return []; }
    }

    class WisbeBase extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.supabase = null;
            this.ownerId = null;
        }

        async connectedCallback() {
            this.renderLoading();
            try {
                const supabaseLib = await getSupabase();
                this.supabase = supabaseLib.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

                const domain = this.getAttribute('domain');
                if (!domain) return this.renderError('Configuración requerida: atributo [domain] no encontrado.');

                this.ownerId = await this.resolveOwner(domain);
                if (!this.ownerId) return this.renderError('Dominio "' + domain + '" no reconocido por Wisbe.');

                this.loadData();
            } catch (err) {
                this.renderError('Error de sincronización con la red Wisbe.');
            }
        }

        async resolveOwner(domain) {
            const clean = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
            let { data: user } = await this.supabase.from('wisbe_users').select('id').ilike('domain', domain.trim()).eq('role', 'gym-owner').maybeSingle();
            if (user) return user.id;
            let { data: users } = await this.supabase.from('wisbe_users').select('id').ilike('domain', `%${clean}%`).eq('role', 'gym-owner').limit(1);
            return users && users[0] ? users[0].id : null;
        }

        renderLoading() {
            this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="wisbe-loader"><i class="fas fa-circle-notch fa-spin"></i> Sincronizando Biblioteca Maestro...</div>`;
        }

        renderError(msg) {
            this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="wisbe-container"><div class="wisbe-error"><i class="fas fa-shield-alt" style="display:block; font-size:2.5rem; margin-bottom:1.5rem; opacity:0.2"></i> ${msg}</div></div>`;
        }
    }

    class WisbeNutricion extends WisbeBase {
        async loadData() {
            const { data, error } = await this.supabase.from('gym_recipes').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('No se pudo establecer conexión con la base de datos de nutrición.');
            this.recipes = data || [];
            this.render();
        }

        render() {
            if (this.recipes.length === 0) {
                this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="wisbe-container"><div class="wisbe-loader">Tu biblioteca de nutrición está vacía actualmente.</div></div>`;
                return;
            }

            this.shadowRoot.innerHTML = `
                <style>${BASE_STYLES}</style>
                <div class="wisbe-container">
                    <div class="filters">
                        <div style="display:flex; gap:1.5rem; flex-wrap:wrap;">
                            <select id="f-diet" class="filter-select">
                                <option value="All">Dieta: Todas</option>
                                <option value="Keto">Keto</option>
                                <option value="Vegana">Vegana</option>
                                <option value="Alta Proteína">Alta Proteína</option>
                                <option value="Sin Gluten">Sin Gluten</option>
                                <option value="Equilibrada">Equilibrada</option>
                            </select>
                            <select id="f-cat" class="filter-select">
                                <option value="All">Categoría: Todas</option>
                                <option value="Desayuno">Desayuno</option>
                                <option value="Almuerzo">Almuerzo</option>
                                <option value="Cena">Cena</option>
                                <option value="Postre Fitness">Postre</option>
                                <option value="Snack Proteico">Snack</option>
                            </select>
                        </div>
                        <div id="count" class="results-count">0 Opciones Maestro</div>
                    </div>
                    <div id="grid" class="wisbe-grid"></div>
                </div>
                <div id="modal-host"></div>
            `;

            const update = () => {
                const diet = this.shadowRoot.getElementById('f-diet').value;
                const cat = this.shadowRoot.getElementById('f-cat').value;
                const filtered = this.recipes.filter(r => (diet === 'All' || r.diet_type === diet) && (cat === 'All' || r.category === cat));
                this.shadowRoot.getElementById('count').innerText = `${filtered.length} Opciones Maestro`;
                this.renderGrid(filtered);
            };

            this.shadowRoot.getElementById('f-diet').onchange = update;
            this.shadowRoot.getElementById('f-cat').onchange = update;
            update();
        }

        renderGrid(recipes) {
            const grid = this.shadowRoot.getElementById('grid');
            grid.innerHTML = recipes.map((r, i) => `
                <div class="n-card animate-fade-in" style="animation-delay: ${i*0.1}s">
                    <div class="n-img-wrapper">
                        <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}" class="n-img">
                        <span class="n-badge">${r.category}</span>
                    </div>
                    <div class="n-content">
                        <h3 class="n-title">${r.title}</h3>
                        <div class="n-stats">
                            <div class="n-stat"><span class="n-stat-val">${r.calories || 0}</span><span class="n-stat-label">Kcal</span></div>
                            <div class="n-stat"><span class="n-stat-val" style="color:#1e293b">${r.protein || 0}g</span><span class="n-stat-label">Proteínas</span></div>
                        </div>
                        <button class="n-btn open-btn" data-id="${r.id}">Receta Master</button>
                    </div>
                </div>
            `).join('');

            grid.querySelectorAll('.open-btn').forEach(btn => {
                btn.onclick = () => this.openModal(this.recipes.find(x => x.id == btn.dataset.id));
            });
        }

        openModal(r) {
            const host = this.shadowRoot.getElementById('modal-host');
            host.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-container animate-fade-in">
                        <button class="m-close"><i class="fas fa-times"></i></button>
                        <div class="m-grid">
                            <div>
                                <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'}" class="m-img">
                                <div style="margin-top:3rem;" class="m-stats">
                                    <div class="m-stat"><span class="m-stat-val">${r.calories || 0}</span><span class="m-stat-label">Kcal</span></div>
                                    <div class="m-stat"><span class="m-stat-val" style="color:#0f172a">${r.protein || 0}</span><span class="m-stat-label">Proteínas</span></div>
                                    <div class="m-stat"><span class="m-stat-val" style="color:#0f172a">${r.carbs || 0}</span><span class="m-stat-label">Carbs</span></div>
                                    <div class="m-stat"><span class="m-stat-val" style="color:#0f172a">${r.fats || 0}</span><span class="m-stat-label">Grasas</span></div>
                                </div>
                            </div>
                            <div>
                                <h2 class="m-title">${r.title}</h2>
                                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:3.5rem; margin-bottom:4rem;">
                                    <div>
                                        <h4 class="m-section-title"><span class="m-num">01</span> Ingredientes</h4>
                                        <div class="m-text" style="border-left:4px solid #ecfdf5; padding-left:2rem; font-style:italic;">${Array.isArray(r.ingredients) ? r.ingredients.join('\n') : r.ingredients}</div>
                                    </div>
                                    <div class="space-y-8">
                                        <h4 class="m-section-title"><span class="m-num">02</span> Bio-Datos</h4>
                                        <div style="background:#f8fafc; padding:1.5rem; border-radius:1.5rem; border:1px solid #f1f5f9; display:flex; justify-content:space-between; font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:1.5rem;">
                                            <span style="color:#94a3b8;">⏱ Tiempo Prep</span> <span style="color:#0f172a;">${r.prep_time || '20 min'}</span>
                                        </div>
                                        <div style="background:#f8fafc; padding:1.5rem; border-radius:1.5rem; border:1px solid #f1f5f9; display:flex; justify-content:space-between; font-size:10px; font-weight:900; text-transform:uppercase;">
                                            <span style="color:#94a3b8;">🔪 Dificultad</span> <span style="color:#10b981;">${r.difficulty || 'Media'}</span>
                                        </div>
                                    </div>
                                </div>
                                <h4 class="m-section-title"><span class="m-num">03</span> Preparación Master</h4>
                                <div class="m-box m-text" style="line-height:2.4">${Array.isArray(r.instructions) ? r.instructions.join('\n') : r.instructions}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            host.querySelector('.m-close').onclick = () => host.innerHTML = '';
        }
    }

    class WisbeRutinas extends WisbeBase {
        async loadData() {
            const { data, error } = await this.supabase.from('gym_routines').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Fallo en la sincronización de rutinas.');
            this.routines = data || [];
            this.render();
        }

        render() {
            if (this.routines.length === 0) {
                this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="wisbe-container"><div class="wisbe-loader">Plan Maestro de entrenamiento no disponible.</div></div>`;
                return;
            }

            this.shadowRoot.innerHTML = `
                <style>${BASE_STYLES}</style>
                <div class="wisbe-container">
                    <div id="grid" class="wisbe-grid">
                        ${this.routines.map((r, i) => `
                            <div class="r-card animate-fade-in open-btn" style="animation-delay: ${i*0.1}s" data-id="${r.id}">
                                <div class="r-icon"><i class="fas fa-dumbbell"></i></div>
                                <h3 class="r-title">${r.title}</h3>
                                <div class="r-meta">
                                    <span class="r-badge">${r.difficulty_level}</span>
                                    <span class="r-badge"><i class="far fa-calendar-alt" style="margin-right:0.6rem"></i> ${r.plan_duration_weeks} SEMANAS</span>
                                </div>
                                <div class="r-footer">Explorar Plan <i class="fas fa-chevron-right" style="margin-left:auto;"></i></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div id="modal-host"></div>
            `;
            this.shadowRoot.querySelectorAll('.open-btn').forEach(btn => {
                btn.onclick = () => this.openModal(this.routines.find(x => x.id == btn.dataset.id));
            });
        }

        openModal(r) {
            const host = this.shadowRoot.getElementById('modal-host');
            const exercises = ensureArray(r.exercises);
            host.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-container animate-fade-in" style="max-width:1150px;">
                        <button class="m-close"><i class="fas fa-times"></i></button>
                        <div style="margin-bottom:5rem;">
                            <span style="color:#3b82f6; font-weight:900; font-size:11px; text-transform:uppercase; letter-spacing:4px; display:block; margin-bottom:1rem;">${r.difficulty_level}</span>
                            <h2 style="font-family:'Montserrat',sans-serif; font-size:3.5rem; font-weight:900; color:#0f172a; margin:0; text-transform:uppercase; letter-spacing:-0.06em; line-height:1;">${r.title}</h2>
                        </div>
                        <div style="display:flex; gap:2rem; margin-bottom:5rem; flex-wrap:wrap;">
                            <div style="background:#f8fafc; padding:1.75rem 3rem; border-radius:2.5rem; border:1px solid #f1f5f9; text-align:center; min-width:180px;">
                                <p style="margin:0 0 0.6rem 0; font-size:9px; color:#94a3b8; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Duración Total</p>
                                <p style="margin:0; font-size:18px; color:#1e293b; font-weight:700;">${r.plan_duration_weeks} Semanas</p>
                            </div>
                            <div style="background:#f8fafc; padding:1.75rem 3rem; border-radius:2.5rem; border:1px solid #f1f5f9; text-align:center; min-width:180px;">
                                <p style="margin:0 0 0.6rem 0; font-size:9px; color:#94a3b8; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Objetivo</p>
                                <p style="margin:0; font-size:18px; color:#1e293b; font-weight:700;">${r.target_gender}</p>
                            </div>
                        </div>
                        <div class="space-y-20">
                            ${exercises.map(day => `
                                <div style="margin-bottom:5rem;">
                                    <div style="display:flex; align-items:center; gap:2.5rem; margin-bottom:3.5rem;">
                                        <span style="padding:1.1rem 3rem; background:#f1f5f9; color:#0f172a; border-radius:9999px; font-weight:900; font-size:13px; text-transform:uppercase; border:1px solid #e2e8f0; letter-spacing:1px;">${day.day}</span>
                                        <div style="flex-grow:1; height:2px; background:#f8fafc;"></div>
                                    </div>
                                    <div class="wisbe-grid" style="grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));">
                                        ${ensureArray(day.exercises).map(ex => `
                                            <div style="background:#f8fafc; padding:2.5rem; border-radius:35px; border:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; transition:all 0.4s;" class="ex-item">
                                                <style>.ex-item:hover{border-color:#3b82f6; background:white; box-shadow:0 15px 40px rgba(0,0,0,0.06); transform:translateY(-5px);}</style>
                                                <div>
                                                    <p style="font-weight:900; color:#0f172a; margin:0 0 0.85rem 0; font-size:16px; text-transform:uppercase; letter-spacing:-0.02em;">${ex.name}</p>
                                                    <p style="font-size:10px; font-weight:900; color:#94a3b8; text-transform:uppercase; margin:0; letter-spacing:1.5px;">
                                                        <span style="color:#3b82f6;">${ex.sets}</span> SERIES &times; <span style="color:#3b82f6;">${ex.reps}</span> REPS
                                                    </p>
                                                </div>
                                                ${ex.video ? `<a href="${ex.video}" target="_blank" style="width:3.5rem; height:3.5rem; background:white; color:#3b82f6; border-radius:9999px; display:flex; align-items:center; justify-content:center; border:1px solid #e2e8f0; text-decoration:none; transition:all 0.4s; box-shadow:0 10px 15px rgba(0,0,0,0.05);"><i class="fas fa-play" style="font-size:12px; margin-left:3px;"></i></a>` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            host.querySelector('.m-close').onclick = () => host.innerHTML = '';
        }
    }

    class WisbeEntrenadores extends WisbeBase {
        async loadData() {
            const { data, error } = await this.supabase.from('gym_trainers').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('No se pudo cargar la base de entrenadores.');
            this.trainers = data || [];
            this.render();
        }

        render() {
            if (this.trainers.length === 0) {
                this.shadowRoot.innerHTML = `<style>${BASE_STYLES}</style><div class="wisbe-container"><div class="wisbe-loader">El equipo de especialistas está siendo actualizado.</div></div>`;
                return;
            }

            this.shadowRoot.innerHTML = `
                <style>${BASE_STYLES}</style>
                <div class="wisbe-container">
                    <div class="wisbe-grid">
                        ${this.trainers.map((t, i) => `
                            <div class="t-card animate-fade-in" style="animation-delay: ${i*0.1}s">
                                <div class="t-avatar">
                                    <img src="${t.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80'}" class="t-img">
                                </div>
                                <span class="t-specialty">${t.specialty}</span>
                                <h3 class="t-name">${t.full_name}</h3>
                                <p class="t-bio">${t.bio || 'Especialista certificado Wisbe comprometido con tus resultados extraordinarios.'}</p>
                                <div class="t-actions">
                                    ${t.whatsapp_url ? `<a href="${t.whatsapp_url}" target="_blank" class="t-wa-btn">Contactar <i class="fab fa-whatsapp"></i></a>` : ''}
                                    ${t.instagram_url ? `<a href="https://instagram.com/${t.instagram_url.replace('@','')}" target="_blank" class="t-ig-btn"><i class="fab fa-instagram"></i></a>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    if (!customElements.get('wisbe-gymnutricion')) customElements.define('wisbe-gymnutricion', WisbeNutricion);
    if (!customElements.get('wisbe-gymrutinas')) customElements.define('wisbe-gymrutinas', WisbeRutinas);
    if (!customElements.get('wisbe-gymentrenadores')) customElements.define('wisbe-gymentrenadores', WisbeEntrenadores);

})();
