/**
 * WisbeUI.js - Sistema de Widgets mediante Custom Elements
 * Inspirado en la arquitectura TragaleroUI
 */

(function() {
    const CONFIG = {
        SUPABASE_URL: 'https://wwcmtqqbxdamxebkfsqk.supabase.co',
        SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Y210cXFieGRhbXhlYmtmc3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDUzNzksImV4cCI6MjA5MDA4MTM3OX0.4C5gGKxJrpF5BS8FfEAu8FLa9VudEHxCYxwwtb991Io'
    };

    // Lazy load Supabase if not present
    async function getSupabase() {
        if (window.supabase) return window.supabase;
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => resolve(window.supabase);
            document.head.appendChild(script);
        });
    }

    const SHARED_STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700;900&family=Playfair+Display:wght@700;900&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :host {
            display: block;
            font-family: 'Raleway', sans-serif;
        }

        .wisbe-loader { padding: 100px 20px; text-align: center; color: #64748b; font-weight: bold; font-family: 'Raleway', sans-serif; }
        .wisbe-error { padding: 40px; text-align: center; color: #ef4444; background: #fef2f2; border-radius: 20px; font-family: 'Raleway', sans-serif; }

        /* Animation Utility */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.8s ease forwards; }
    `;

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

            // Exact match
            let { data: user } = await this.supabase.from('wisbe_users').select('id').ilike('domain', domain.trim()).eq('role', 'gym-owner').maybeSingle();

            if (!user) {
                // Flex match
                let { data: users } = await this.supabase.from('wisbe_users').select('id').ilike('domain', `%${cleanDomain}%`).eq('role', 'gym-owner').limit(1);
                user = users ? users[0] : null;
            }
            return user ? user.id : null;
        }

        renderLoading() {
            this.shadowRoot.innerHTML = `
                <script src="https://cdn.tailwindcss.com"></script>
                <style>${SHARED_STYLES}</style>
                <div class="wisbe-loader"><i class="fas fa-sync fa-spin"></i> Sincronizando con Wisbe.xyz...</div>
            `;
        }

        renderError(msg) {
            this.shadowRoot.innerHTML = `
                <script src="https://cdn.tailwindcss.com"></script>
                <style>${SHARED_STYLES}</style>
                <div class="wisbe-error">${msg}</div>
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
            this.renderLayout();
            this.filterRecipes();
        }

        renderLayout() {
            this.shadowRoot.innerHTML = `
                <script src="https://cdn.tailwindcss.com"></script>
                <style>${SHARED_STYLES}</style>
                <div class="max-w-[1400px] mx-auto p-5 font-['Raleway']">
                    <!-- Advanced Filters -->
                    <div class="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 mb-20 flex flex-wrap gap-6 items-center justify-between">
                        <div class="flex flex-wrap gap-4">
                            <select id="diet-filter" class="bg-slate-50 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 border-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none">
                                <option value="All">Dieta: Todas</option>
                                <option value="Keto">Keto</option>
                                <option value="Vegana">Vegana</option>
                                <option value="Alta Proteína">Alta Proteína</option>
                                <option value="Sin Gluten">Sin Gluten</option>
                                <option value="Equilibrada">Equilibrada</option>
                            </select>
                            <select id="cat-filter" class="bg-slate-50 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 border-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none">
                                <option value="All">Categoría: Todas</option>
                                <option value="Desayuno">Desayuno</option>
                                <option value="Almuerzo">Almuerzo</option>
                                <option value="Cena">Cena</option>
                                <option value="Postre Fitness">Postre</option>
                                <option value="Snack Proteico">Snack</option>
                            </select>
                        </div>
                        <div id="recipe-count" class="text-[10px] font-black uppercase tracking-widest text-slate-400">0 Opciones Maestro</div>
                    </div>

                    <div id="recipes-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        <!-- Grid content -->
                    </div>
                </div>
            `;

            this.shadowRoot.getElementById('diet-filter').addEventListener('change', () => this.filterRecipes());
            this.shadowRoot.getElementById('cat-filter').addEventListener('change', () => this.filterRecipes());
        }

        filterRecipes() {
            const diet = this.shadowRoot.getElementById('diet-filter').value;
            const cat = this.shadowRoot.getElementById('cat-filter').value;

            const filtered = this.allRecipes.filter(r => {
                return (diet === 'All' || r.diet_type === diet) &&
                       (cat === 'All' || r.category === cat);
            });

            this.shadowRoot.getElementById('recipe-count').innerText = `${filtered.length} Opciones Maestro`;
            this.renderGrid(filtered);
        }

        renderGrid(recipes) {
            const grid = this.shadowRoot.getElementById('recipes-grid');
            grid.innerHTML = recipes.map((r, index) => `
                <div class="bg-white rounded-[50px] shadow-sm border border-slate-50 overflow-hidden group hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 animate-fade-in">
                    <div class="h-64 relative overflow-hidden bg-slate-200">
                        <img src="${r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}"
                             class="w-full h-full object-cover group-hover:scale-125 transition duration-1000 grayscale-[0.2] group-hover:grayscale-0">
                        <div class="absolute top-6 left-6">
                            <span class="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-2xl">${r.category}</span>
                        </div>
                    </div>
                    <div class="p-10">
                        <h3 class="text-2xl font-black text-slate-800 mb-6 tracking-tight truncate">${r.title}</h3>
                        <div class="flex justify-between items-center mb-10 border-t border-b border-slate-50 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div class="text-center">
                                <span class="block text-2xl font-black text-emerald-600 mb-1">${r.calories || 0}</span>
                                <span>Kcal</span>
                            </div>
                            <div class="text-center">
                                <span class="block text-2xl font-black text-slate-800 mb-1">${r.protein || 0}g</span>
                                <span>Prote</span>
                            </div>
                        </div>
                        <button class="recipe-btn w-full py-5 bg-slate-900 hover:bg-emerald-600 text-white font-black rounded-3xl transition-all shadow-xl hover:shadow-emerald-200 uppercase tracking-widest text-xs" data-index="${index}">
                            Receta Master
                        </button>
                    </div>
                </div>
            `).join('');

            grid.querySelectorAll('.recipe-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = btn.getAttribute('data-index');
                    this.openModal(recipes[idx]);
                };
            });
        }

        openModal(r) {
            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed; inset:0; background:rgba(15, 23, 42, 0.95); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(24px);';
            modal.innerHTML = `
                <script src="https://cdn.tailwindcss.com"></script>
                <div class="bg-white w-full max-w-6xl max-h-[95vh] rounded-[60px] overflow-hidden shadow-2xl flex flex-col xl:flex-row border border-white/10 animate-fade-in font-['Raleway']">
                    <div class="xl:w-5/12 h-80 xl:h-auto relative">
                        <img src="${r.image_url}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-12">
                            <span class="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-2xl w-fit shadow-xl shadow-emerald-900/40 mb-4">${r.category}</span>
                            <h2 class="text-5xl font-black text-white leading-[0.9] tracking-tighter">${r.title}</h2>
                        </div>
                    </div>
                    <div class="xl:w-7/12 p-8 xl:p-16 overflow-y-auto bg-white flex flex-col">
                        <div class="flex justify-between items-start mb-12">
                            <div class="grid grid-cols-4 gap-4 w-full mr-12">
                                <div class="bg-slate-50 p-6 rounded-[35px] text-center border border-slate-100 transition-all hover:bg-emerald-50 group">
                                    <span class="block text-3xl font-black text-emerald-600 group-hover:scale-110 transition-transform">${r.calories || 0}</span>
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kcal</span>
                                </div>
                                <div class="bg-slate-50 p-6 rounded-[35px] text-center border border-slate-100 transition-all hover:bg-emerald-50 group">
                                    <span class="block text-3xl font-black text-slate-800 group-hover:scale-110 transition-transform">${r.protein || 0}</span>
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Proteínas</span>
                                </div>
                                <div class="bg-slate-50 p-6 rounded-[35px] text-center border border-slate-100 transition-all hover:bg-emerald-50 group">
                                    <span class="block text-3xl font-black text-slate-800 group-hover:scale-110 transition-transform">${r.carbs || 0}</span>
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Carbs</span>
                                </div>
                                <div class="bg-slate-50 p-6 rounded-[35px] text-center border border-slate-100 transition-all hover:bg-emerald-50 group">
                                    <span class="block text-3xl font-black text-slate-800 group-hover:scale-110 transition-transform">${r.fats || 0}</span>
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Grasas</span>
                                </div>
                            </div>
                            <button class="close-btn text-slate-200 hover:text-emerald-500 transition-all text-3xl"><i class="fas fa-times-circle"></i></button>
                        </div>

                        <div class="space-y-16">
                            <div class="grid md:grid-cols-2 gap-12">
                                <div>
                                    <h4 class="text-xl font-black text-slate-800 mb-6 flex items-center uppercase tracking-tighter">
                                        <span class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xs mr-3 font-black">01</span> Ingredientes
                                    </h4>
                                    <div class="text-slate-600 leading-loose whitespace-pre-wrap pl-6 border-l-2 border-emerald-50 text-sm italic">${Array.isArray(r.ingredients) ? r.ingredients.join('\n') : (r.ingredients || '')}</div>
                                </div>
                                <div>
                                    <h4 class="text-xl font-black text-slate-800 mb-6 flex items-center uppercase tracking-tighter">
                                        <span class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xs mr-3 font-black">02</span> Bio-Datos
                                    </h4>
                                    <div class="space-y-4">
                                        <div class="bg-slate-50 p-4 rounded-2xl flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-100">
                                            <span>⏱ Tiempo</span> <span class="text-slate-900 font-black">${r.prep_time || '20 min'}</span>
                                        </div>
                                        <div class="bg-slate-50 p-4 rounded-2xl flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-100">
                                            <span>🔪 Dificultad</span> <span class="text-emerald-600 font-black">${r.difficulty || 'Media'}</span>
                                        </div>
                                        <div class="bg-slate-50 p-4 rounded-2xl flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-100">
                                            <span>🥗 Estilo</span> <span class="text-slate-900 font-black">${r.diet_type || 'Equilibrada'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 class="text-xl font-black text-slate-800 mb-8 flex items-center uppercase tracking-tighter">
                                    <span class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xs mr-3 font-black">03</span> Preparación Master
                                </h4>
                                <div class="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm bg-slate-50 p-10 rounded-[40px] border border-dashed border-slate-200 border-2">${Array.isArray(r.instructions) ? r.instructions.join('\n') : (r.instructions || '')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            modal.querySelector('.close-btn').onclick = () => modal.remove();
            this.shadowRoot.appendChild(modal);
        }
    }

    // --- WIDGET RUTINAS ---
    class WisbeGymRutinas extends WisbeBaseWidget {
        async fetchAndRender() {
            const { data, error } = await this.supabase.from('gym_routines').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Error de conexión.');
            this.renderContent(data || []);
        }

        renderContent(routines) {
            this.shadowRoot.innerHTML = `
                <script src="https://cdn.tailwindcss.com"></script>
                <style>${SHARED_STYLES}</style>
                <div class="max-w-[1400px] mx-auto p-5 font-['Raleway']">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        ${routines.map((r, index) => `
                            <div class="bg-white rounded-[40px] border border-slate-100 p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer routine-card group" data-index="${index}">
                                <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                    <i class="fas fa-dumbbell"></i>
                                </div>
                                <h3 class="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">${r.title}</h3>
                                <div class="flex flex-wrap gap-3">
                                    <span class="px-4 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100">${r.difficulty_level}</span>
                                    <span class="px-4 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100">${r.plan_duration_weeks} Semanas</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            this.shadowRoot.querySelectorAll('.routine-card').forEach(card => {
                card.onclick = () => {
                    const idx = card.getAttribute('data-index');
                    this.openModal(routines[idx]);
                };
            });
        }

        openModal(r) {
            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed; inset:0; background:rgba(15, 23, 42, 0.95); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(24px);';
            modal.innerHTML = `
                <script src="https://cdn.tailwindcss.com"></script>
                <div class="bg-white w-full max-w-5xl rounded-[50px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/10 animate-fade-in font-['Raleway']">
                    <div class="p-10 md:p-14 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <span class="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2 block">${r.difficulty_level}</span>
                            <h2 class="text-4xl font-black text-slate-900 leading-none tracking-tighter uppercase">${r.title}</h2>
                        </div>
                        <button class="close-btn w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-100">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="p-10 md:p-14 overflow-y-auto flex-1 bg-white">
                        <div class="space-y-16">
                            ${(r.exercises || []).map(day => `
                                <div>
                                    <h4 class="inline-block px-6 py-2 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest mb-10 shadow-lg shadow-blue-600/20">${day.day}</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        ${day.exercises.map(ex => `
                                            <div class="p-8 bg-slate-50 rounded-[35px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                                                <p class="font-black text-slate-900 text-lg mb-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">${ex.name}</p>
                                                <div class="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span class="px-3 py-1 bg-white rounded-lg border border-slate-100">${ex.sets} Series</span>
                                                    <span class="px-3 py-1 bg-white rounded-lg border border-slate-100">${ex.reps} Reps</span>
                                                </div>
                                                ${ex.video ? `<a href="${ex.video}" target="_blank" class="mt-6 flex items-center text-[9px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform"><i class="fas fa-play-circle mr-2"></i> Ver ejecución</a>` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            modal.querySelector('.close-btn').onclick = () => modal.remove();
            this.shadowRoot.appendChild(modal);
        }
    }

    // --- WIDGET ENTRENADORES ---
    class WisbeGymEntrenadores extends WisbeBaseWidget {
        async fetchAndRender() {
            const { data, error } = await this.supabase.from('gym_trainers').select('*').eq('owner_id', this.ownerId).order('created_at', { ascending: false });
            if (error) return this.renderError('Error de conexión.');
            this.renderContent(data || []);
        }

        renderContent(trainers) {
            this.shadowRoot.innerHTML = `
                <script src="https://cdn.tailwindcss.com"></script>
                <style>${SHARED_STYLES}</style>
                <div class="max-w-[1400px] mx-auto p-5 font-['Raleway']">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        ${trainers.map(t => `
                            <div class="bg-white rounded-[50px] shadow-sm border border-slate-50 p-10 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 animate-fade-in group">
                                <div class="w-32 h-32 rounded-full border-4 border-slate-50 overflow-hidden mb-8 bg-slate-100 shadow-sm relative">
                                    <img src="${t.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80'}"
                                         class="w-full h-full object-cover">
                                </div>
                                <h3 class="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">${t.full_name}</h3>
                                <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">${t.specialty}</p>
                                <p class="text-sm text-slate-500 mb-10 line-clamp-3 leading-relaxed">${t.bio || 'Sin descripción'}</p>

                                <div class="mt-auto flex gap-4 pt-8 border-t border-slate-50 w-full justify-center">
                                    ${t.whatsapp_url ? `
                                        <a href="${t.whatsapp_url}" target="_blank" class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-500">
                                            <i class="fab fa-whatsapp text-lg"></i>
                                        </a>
                                    ` : ''}
                                    ${t.instagram_url ? `
                                        <a href="https://instagram.com/${t.instagram_url.replace('@','')}" target="_blank" class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all duration-500">
                                            <i class="fab fa-instagram text-lg"></i>
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    // Register elements
    customElements.define('wisbe-gymnutricion', WisbeGymNutricion);
    customElements.define('wisbe-gymrutinas', WisbeGymRutinas);
    customElements.define('wisbe-gymentrenadores', WisbeGymEntrenadores);

})();
