document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURAÇÃO DE VARIÁVEIS E FUNÇÕES GLOBAIS ---
    let currentLang = localStorage.getItem('lang') || 'pt';
    const mainNav = document.getElementById('main-nav');

    // Função Genérica para Fetch de JSON
    const fetchJSON = async (path) => {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Erro ao carregar ${path}`);
            return response.json();
        } catch (error) {
            console.error("Erro no fetch de JSON:", error);
            return null;
        }
    };


    // --- 2. TEMA CLARO/ESCURO (Persistência) ---
    const setupThemeToggle = () => {
        // Carrega tema salvo ou usa preferência do sistema
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
            document.body.classList.add('dark-mode');
        }

        // Cria o botão de alternância
        const toggleButton = document.createElement('button');
        toggleButton.textContent = document.body.classList.contains('dark-mode') ? '💡 Claro' : '🌙 Escuro';
        toggleButton.classList.add('button', 'secondary', 'theme-toggle');
        
        // Adiciona ao menu de navegação
        mainNav.appendChild(toggleButton);

        toggleButton.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            
            // Salva a nova preferência e atualiza o texto do botão
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            toggleButton.textContent = isDark ? '💡 Claro' : '🌙 Escuro';
        });
    };


    // --- 3. BILINGUISMO (Tradução da Página) ---
    const translatePage = (localizationData, lang) => {
        document.documentElement.lang = lang; 
        const elements = document.querySelectorAll('[data-translate]');

        elements.forEach(el => {
            const key = el.getAttribute('data-translate');
            if (localizationData[lang] && localizationData[lang][key]) {
                el.textContent = localizationData[lang][key];
            }
        });
    };

    const setupLanguageToggle = (projectsData, localizationData) => {
        const langButton = document.createElement('button');
        langButton.textContent = currentLang === 'pt' ? 'EN' : 'PT';
        langButton.classList.add('button', 'secondary', 'lang-toggle');
        
        // Adiciona ao menu de navegação, ao lado do toggle de tema
        mainNav.appendChild(langButton); 

        langButton.addEventListener('click', () => {
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            localStorage.setItem('lang', currentLang);
            langButton.textContent = currentLang === 'pt' ? 'EN' : 'PT';
            
            // Recarrega o conteúdo
            loadProjects(projectsData, currentLang);
            translatePage(localizationData, currentLang);
        });
    };


    // --- 4. CARREGAMENTO DOS PROJETOS DINÂMICOS ---
    const loadProjects = (projectsData, lang) => {
        const container = document.getElementById('projects-container');
        if (!container) return; 
        container.innerHTML = ''; 

        projectsData.forEach(project => {
            const titleKey = `title_${lang}`;
            const descKey = `description_${lang}`;
            
            // Cria o Card do Projeto (com Glassmorphism)
            const card = document.createElement('article');
            card.classList.add('project-card', 'glass-card'); 
            
            // Template String para injetar o HTML
            card.innerHTML = `
                <img 
                    src="${project.image}" 
                    alt="Imagem do projeto ${project.title_pt}" 
                    loading="lazy"
                    width="400" 
                    height="300"
                >
                <h3 class="project-title">${project[titleKey]}</h3>
                <p class="project-desc">${project[descKey]}</p>
                <div class="project-stack">
                    ${project.stack.map(tech => `<span class="badge">${tech}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${project.link_live}" target="_blank" class="button primary">Demo Live</a>
                    ${project.link_repo ? `<a href="${project.link_repo}" target="_blank" class="button secondary">Repositório</a>` : ''}
                </div>
            `;
            container.appendChild(card);
        });
    };


    // --- 5. VALIDAÇÃO DE FORMULÁRIO (Simples) ---
    const setupFormValidation = () => {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            const emailInput = document.getElementById('email');

            // Validação simples de email
            if (!emailInput.value.includes('@') || !emailInput.value.includes('.')) {
                e.preventDefault(); 
                alert("Por favor, digite um email válido.");
                emailInput.focus();
            }
            // A validação 'required' do HTML5 cuida do resto dos campos obrigatórios.
        });
    };


    // --- 6. FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
    const initApp = async () => {
        // Carrega dados e localização
        const projectsData = await fetchJSON('assets/json/projects.json');
        const localizationData = await fetchJSON('assets/json/localization.json');

        if (projectsData && localizationData) {
            // Inicializa as funcionalidades
            setupThemeToggle();
            setupLanguageToggle(projectsData, localizationData);
            setupFormValidation();
            
            // Primeira renderização do conteúdo
            loadProjects(projectsData, currentLang);
            translatePage(localizationData, currentLang);
        } else {
            document.getElementById('projects-container').innerHTML = 
                '<p>Erro ao carregar os dados dos projetos. Verifique os arquivos JSON.</p>';
        }
    };

    initApp();
});