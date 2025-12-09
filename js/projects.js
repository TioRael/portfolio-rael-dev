document.addEventListener('DOMContentLoaded', () => {
    const navControls = document.getElementById('nav-controls');
    let currentLang = localStorage.getItem('lang') || 'pt';
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // --- 1. FETCH JSON ---
    const fetchJSON = async (path) => {
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`Erro: ${path}`);
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    // --- 2. CONTROLE DE IDIOMA E TEMA ---
    const initControls = (localizationData) => {
        // 2.1 Idioma com Label
        const langWrapper = document.createElement('div');
        langWrapper.className = 'lang-wrapper';
        const langLabel = document.createElement('span');
        langLabel.setAttribute('data-translate', 'ui_language_label');
        langLabel.textContent = localizationData[currentLang].ui_language_label || "Idioma:";
        const langBtn = document.createElement('button');
        langBtn.className = 'control-btn';
        langBtn.textContent = currentLang.toUpperCase();
        langBtn.onclick = () => {
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            localStorage.setItem('lang', currentLang);
            langBtn.textContent = currentLang.toUpperCase();
            translatePage(localizationData, currentLang);
            loadProjectDetails(currentLang);
        };
        langWrapper.appendChild(langLabel);
        langWrapper.appendChild(langBtn);
        navControls.appendChild(langWrapper);

        // 2.2 Tema (Dark/Light)
        const themeBtn = document.createElement('button');
        themeBtn.className = 'control-btn';
        themeBtn.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        if (currentTheme === 'dark') document.body.classList.add('dark-mode');
        themeBtn.onclick = () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        };
        navControls.appendChild(themeBtn);
    };

    // --- 3. TRADUÇÃO ---
    const translatePage = (data, lang) => {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (data[lang]?.[key]) el.textContent = data[lang][key];
        });
    };

    // --- 4. CARREGAR DETALHES DO PROJETO ---
    const loadProjectDetails = async (lang) => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const [projectsData, localizationData] = await Promise.all([
            fetchJSON('assets/json/projects.json'),
            fetchJSON('assets/json/localization.json')
        ]);

        if (!projectsData || !projectId) {
            document.getElementById('project-container').innerHTML = '<p>Projeto não encontrado.</p>';
            return;
        }

        const project = projectsData.find(p => p.id === projectId);
        if (!project) {
            document.getElementById('project-container').innerHTML = '<p>Projeto não encontrado.</p>';
            return;
        }

        // Preencher elementos básicos
        document.getElementById('project-title').textContent = project[`title_${lang}`];
        document.getElementById('project-img').src = project.image || 'https://placehold.co/600x400/1e293b/FFF?text=Code';
        document.getElementById('project-img').alt = project[`title_${lang}`];

        // Links
        const linkLive = document.getElementById('link-live');
        linkLive.href = project.link_live;
        const linkRepo = document.getElementById('link-repo');
        if (project.link_repo) {
            linkRepo.href = project.link_repo;
            linkRepo.style.display = 'inline-block';
        } else {
            linkRepo.style.display = 'none';
        }

        // Definir seções
        const sections = [
            {id: 'overview', emoji: '', key: 'overview', type: 'paragraph'},
            {id: 'role', emoji: '👨‍💻', key: 'role', type: 'paragraph'},
            {id: 'problem', emoji: '❓', key: 'problem', type: 'list'},
            {id: 'goal', emoji: '🎯', key: 'goal', type: 'list'},
            {id: 'solution', emoji: '✨', key: 'solution', type: 'subsections', subkeys: [
                {subkey: 'project_architecture', type: 'paragraph'},
                {subkey: 'developer_experience', type: 'paragraph'}
            ]},
            {id: 'technical_implementation', emoji: '⚙️', key: 'technical_implementation', type: 'subsections', subkeys: [
                {subkey: 'core_technologies', type: 'list'},
                {subkey: 'key_features', type: 'list'},
                {subkey: 'architecture_patterns', type: 'list'}
            ]},
            {id: 'challenges_and_learnings', emoji: '🧪', key: 'challenges_and_learnings', type: 'list'},
            {id: 'final_thoughts', emoji: '✨', key: 'final_thoughts', type: 'list'}
        ];

        // Gerar Índice (TOC)
        const tocList = document.getElementById('toc-list');
        tocList.innerHTML = '';
        sections.forEach((section, index) => {
            const number = index + 1;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${section.id}`;
            a.textContent = `${number}. ${localizationData[lang][section.key]}`;
            li.appendChild(a);
            tocList.appendChild(li);
        });

        // Gerar conteúdo das seções
        const contentDiv = document.querySelector('.project-detail-content');
        contentDiv.innerHTML = '';
        sections.forEach(section => {
            const field = `${section.id}_${lang}`;
            if (!project[field]) return; // Pular se não houver conteúdo

            const sectionDiv = document.createElement('div');
            sectionDiv.id = section.id;
            const h2 = document.createElement('h2');
            h2.textContent = `${section.emoji} ${localizationData[lang][section.key]}`.trim();
            sectionDiv.appendChild(h2);

            if (section.type === 'paragraph') {
                const paras = project[field].split('\n');
                paras.forEach(p => {
                    if (p.trim()) {
                        const para = document.createElement('p');
                        para.textContent = p;
                        sectionDiv.appendChild(para);
                    }
                });
            } else if (section.type === 'list') {
                const ul = document.createElement('ul');
                ul.className = 'highlights-list';
                project[field].forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                sectionDiv.appendChild(ul);
            } else if (section.type === 'subsections') {
                section.subkeys.forEach(sub => {
                    const subData = project[field][sub.subkey];
                    if (!subData) return;

                    const subh4 = document.createElement('h4');
                    subh4.textContent = localizationData[lang][sub.subkey];
                    sectionDiv.appendChild(subh4);

                    if (sub.type === 'paragraph') {
                        const paras = subData.split('\n');
                        paras.forEach(p => {
                            if (p.trim()) {
                                const para = document.createElement('p');
                                para.textContent = p;
                                sectionDiv.appendChild(para);
                            }
                        });
                    } else if (sub.type === 'list') {
                        const ul = document.createElement('ul');
                        ul.className = 'stack-list';
                        subData.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = item;
                            ul.appendChild(li);
                        });
                        sectionDiv.appendChild(ul);
                    }
                });
            }

            contentDiv.appendChild(sectionDiv);
        });

        // Traduzir elementos estáticos (incluindo botões)
        translatePage(localizationData, lang);
    };

    // --- INIT ---
    const initApp = async () => {
        const localizationData = await fetchJSON('assets/json/localization.json');
        if (localizationData) {
            initControls(localizationData);
            translatePage(localizationData, currentLang);
        }
        await loadProjectDetails(currentLang);
    };

    initApp();
});