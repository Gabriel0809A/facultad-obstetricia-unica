function cargarLayout(rutaBase) {
    if (!rutaBase) rutaBase = "./";

    // --- 1. AUTO-FAVICON  ---
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.type = 'image/png';
    favicon.sizes = 'any'; 
    favicon.href = rutaBase + 'img/icon.png'; 

    // Detectar página actual
    const path = window.location.pathname;
    const esInicio = path.includes("index.html") || path === "/" || path.endsWith("/");
    const esNosotros = path.includes("secciones/nosotros.html");
    const esAcademico = path.includes("secciones/academico.html");
    const esNoticias = path.includes("secciones/noticias.html");

    // Función de estilos 
    const getLinkClass = (activo, esMovil = false) => {
        let clases = "transition-colors font-medium ";
        
        if (esMovil) {
            clases += "block px-4 py-3 rounded-md text-base ";
            if (activo) return clases + "bg-pink-50 text-[#9d174d] font-bold";
            return clases + "text-gray-600 hover:bg-gray-50 hover:text-[#9d174d]";
        } else {
            if (activo) {
                return "text-[#9d174d] font-bold border-b-2 border-[#9d174d] pb-1 transition-colors";
            } else {
                return "text-gray-600 font-medium hover:text-[#9d174d] transition-colors pb-1 border-b-2 border-transparent hover:border-pink-200";
            }
        }
    };

    // --- 2. HEADER HTML ---
    const headerHTML = `
    <header class="bg-white shadow-sm sticky top-0 z-50 font-sans h-24">
        <div class="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            
            <a href="${rutaBase}welcome.html" class="flex items-center gap-4 group text-decoration-none mr-4">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI0dUBOiv4nqtaYTyn6F7DKF_aNKOkjyFqPw&s" alt="UNICA" class="h-14 w-auto object-contain">
                
                <div class="flex flex-col justify-center">
                    <span class="text-2xl font-extrabold text-[#9d174d] leading-none tracking-tight group-hover:opacity-80 transition">
                        UNICA
                    </span>
                    <span class="text-[0.7rem] font-bold text-gray-500 uppercase tracking-widest mt-1">
                        FACULTAD DE OBSTETRICIA
                    </span>
                </div>
            </a>

            <nav class="hidden md:flex items-center gap-8 ml-auto mr-8">
                <a href="${rutaBase}index.html" class="${getLinkClass(esInicio)}">Inicio</a>
                <a href="${rutaBase}secciones/nosotros.html" class="${getLinkClass(esNosotros)}">Nosotros</a>
                <a href="${rutaBase}secciones/academico.html" class="${getLinkClass(esAcademico)}">Académico</a>
                <a href="${rutaBase}secciones/noticias.html" class="${getLinkClass(esNoticias)}">Noticias</a>
            </nav>

            <div class="hidden md:block">
                <a href="https://aulavirtual.unica.edu.pe" target="_blank" class="bg-[#9d174d] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#831843] transition shadow-md flex items-center gap-2 transform hover:-translate-y-0.5 duration-200">
                    <i class="fas fa-chalkboard-user text-lg"></i> 
                    Aula Virtual
                </a>
            </div>

            <button id="mobile-menu-btn" class="md:hidden ml-auto text-gray-600 text-3xl focus:outline-none hover:text-[#9d174d] p-2">
                <i class="fas fa-bars"></i>
            </button>

        </div>

        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg">
            <div class="px-4 pt-2 pb-6 space-y-2">
                <a href="${rutaBase}index.html" class="${getLinkClass(esInicio, true)}">Inicio</a>
                <a href="${rutaBase}secciones/nosotros.html" class="${getLinkClass(esNosotros, true)}">Nosotros</a>
                <a href="${rutaBase}secciones/academico.html" class="${getLinkClass(esAcademico, true)}">Académico</a>
                <a href="${rutaBase}secciones/noticias.html" class="${getLinkClass(esNoticias, true)}">Noticias</a>
                
                <a href="https://aulavirtual.unica.edu.pe" target="_blank" class="block w-full text-center mt-4 bg-[#9d174d] text-white px-5 py-3 rounded-lg hover:bg-[#831843] font-bold">
                    <i class="fas fa-chalkboard-user mr-2"></i> Aula Virtual
                </a>
            </div>
        </div>
    </header>
    `;

    // --- 3. FOOTER  ---
    const footerHTML = `
    <footer class="bg-slate-900 text-white py-12 border-t-4 border-guinda-800 font-sans mt-auto">
        <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
            
            <div class="col-span-1 md:col-span-2">
                <div class="flex items-center gap-3 mb-4">
                    <img src="${rutaBase}img/obstetricia_logo_toonout.png" alt="UNICA" class="h-12 w-auto " />
                    <div>
                        <h5 class="font-bold text-lg leading-none">UNICA</h5>
                        <span class="text-xs text-gray-400">Facultad de Obstetricia</span>
                    </div>
                </div>
                <p class="text-gray-400 text-sm pr-8">
                    Formando profesionales competentes y humanos, comprometidos con la salud y el bienestar de la sociedad iqueña y peruana.
                </p>
            </div>

            <div>
                <h5 class="text-lg font-bold mb-4 text-white">Enlaces Rápidos</h5>
                <ul class="text-gray-400 text-sm space-y-2">
                    <li><a href="${rutaBase}index.html" class="hover:text-guinda-400 transition">Inicio</a></li>
                    <li><a href="${rutaBase}secciones/nosotros.html" class="hover:text-guinda-400 transition">Nosotros</a></li>
                    <li><a href="${rutaBase}secciones/academico.html" class="hover:text-guinda-400 transition">Académico</a></li>
                    <li><a href="${rutaBase}secciones/noticias.html" class="hover:text-guinda-400 transition">Noticias</a></li>
                    <li><a href="https://aulavirtual.unica.edu.pe" target="_blank" class="hover:text-guinda-400 transition">Aula Virtual</a></li>
                </ul>
            </div>

            <div>
                <h5 class="text-lg font-bold mb-4 text-white">Contacto</h5>
                <ul class="text-gray-400 text-sm space-y-2">
                    <li class="flex items-start gap-2">
                        <i class="fas fa-map-marker-alt mt-1 text-guinda-500"></i> 
                        Ciudad Universitaria, Ica - Perú
                    </li>
                    <li class="flex items-center gap-2">
                        <i class="fas fa-phone text-guinda-500"></i> 
                        (056) 123-456
                    </li>
                    <li class="flex items-center gap-2">
                        <i class="fas fa-envelope text-guinda-500"></i> 
                        info@obstetricia.unica.edu.pe
                    </li>
                </ul>
                <div class="flex space-x-4 mt-6">
                    <a href="#" class="bg-white/10 p-2 rounded hover:bg-guinda-600 transition" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="bg-white/10 p-2 rounded hover:bg-guinda-600 transition" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="bg-white/10 p-2 rounded hover:bg-guinda-600 transition" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                </div>
            </div>

        </div>

        <div class="text-center mt-12 pt-8 border-t border-slate-800 text-gray-600 text-xs">
            &copy; 2025 Facultad de Obstetricia - UNICA. Todos los derechos reservados.
        </div>
    </footer>
    `;

    // --- 4. INYECTAR Y ACTIVAR ---
    const headerEl = document.getElementById('layout-header');
    const footerEl = document.getElementById('layout-footer');

    if(headerEl) {
        headerEl.innerHTML = headerHTML;
        headerEl.className = "sticky top-0 z-50 w-full"; 

        // === ESTA ES LA PARTE DEL CELULAR ===
        const btnMenu = document.getElementById('mobile-menu-btn');
        const menuMovil = document.getElementById('mobile-menu');

        if (btnMenu && menuMovil) {
            btnMenu.addEventListener('click', () => {
                menuMovil.classList.toggle('hidden');
            });
        }
    }
    
    if(footerEl) footerEl.innerHTML = footerHTML;
}

