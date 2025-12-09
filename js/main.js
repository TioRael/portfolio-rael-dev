document.addEventListener('DOMContentLoaded', () => {
   
    const navControls = document.getElementById('nav-controls');
    let currentLang = localStorage.getItem('lang') || 'pt';
    let currentTheme = localStorage.getItem('theme') || 'dark';
    // --- 1. EFEITO DIGITAÇÃO ---
    const setupTypewriter = (lang) => {
        const el = document.getElementById('typing-text');
        if (!el) return;
        const texts = lang === 'pt'
            ? ["Desenvolvedor Web", "Front-End", "Back-End", "Freelancer"]
            : ["Web Developer", "Front-End", "Back-End", "Freelancer"];
        let textIndex = 0, charIndex = 0, isDeleting = false;
       
        if (window.typewriterTimeout) clearTimeout(window.typewriterTimeout);
        const type = () => {
            const current = texts[textIndex];
            let speed = 100;
            if (isDeleting) {
                el.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                speed = 50;
            } else {
                el.textContent = current.substring(0, charIndex + 1);
                charIndex++;
            }
            if (!isDeleting && charIndex === current.length) {
                isDeleting = true;
                speed = 2000;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                speed = 500;
            }
            window.typewriterTimeout = setTimeout(type, speed);
        };
        type();
    };
    // --- 2. FETCH JSON ---
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
    // --- 3. CONTROLE DE IDIOMA E TEMA ---
    const initControls = (projectsData, localizationData) => {
       
        // 3.1 Idioma com Label
        const langWrapper = document.createElement('div');
        langWrapper.className = 'lang-wrapper';
       
        // Rótulo "Idioma:"
        const langLabel = document.createElement('span');
        langLabel.setAttribute('data-translate', 'ui_language_label');
        langLabel.textContent = localizationData[currentLang].ui_language_label || "Idioma:";
       
        // Botão PT/EN
        const langBtn = document.createElement('button');
        langBtn.className = 'control-btn';
        langBtn.textContent = currentLang.toUpperCase();
        langBtn.onclick = () => {
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            localStorage.setItem('lang', currentLang);
            langBtn.textContent = currentLang.toUpperCase();
           
            translatePage(localizationData, currentLang);
            loadProjects(projectsData, currentLang);
        };
        langWrapper.appendChild(langLabel);
        langWrapper.appendChild(langBtn);
        navControls.appendChild(langWrapper);
        // 3.2 Tema (Dark/Light)
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
    // --- 4. TRADUÇÃO ---
    const translatePage = (data, lang) => {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (data[lang]?.[key]) el.innerHTML = data[lang][key];
        });
        setupTypewriter(lang);
    };
    // --- 5. CARREGAR PROJETOS ---
    const loadProjects = (data, lang) => {
        const container = document.getElementById('projects-container');
        if (!container) return;
        container.innerHTML = '';
        const buttonText = lang === 'pt' ? 'Ver Detalhes' : 'View Details';
        data.forEach(p => {
            const title = p[`title_${lang}`];
            const desc = p[`description_${lang}`];
            const imgPath = p.image || 'https://placehold.co/600x400/1e293b/FFF?text=Code';
            const card = document.createElement('article');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-img-wrapper">
                    <img src="${imgPath}" alt="${title}" loading="lazy">
                </div>
                <div class="project-content">
                    <h3 class="project-title">${title}</h3>
                    <p class="project-desc">${desc}</p>
                    <div class="project-links">
                        <a href="${p.link_live}" target="_blank" class="pixel-btn primary" style="font-size:0.8rem">Demo</a>
                        ${p.link_repo ? `<a href="${p.link_repo}" target="_blank" class="pixel-btn secondary" style="font-size:0.8rem">Code</a>` : ''}
                        <a href="projetos.html?id=${p.id}" class="pixel-btn secondary" style="font-size:0.8rem">${buttonText}</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    };
    // --- 6. CARREGAR SKILLS ---
    const loadSkills = async () => {
        const data = await fetchJSON('assets/json/skills.json');
        const container = document.getElementById('skills-container');
        if (!container || !data) return;
        container.innerHTML = '';
        data.forEach(s => {
            const div = document.createElement('div');
            div.className = 'skill-card';
            div.innerHTML = `<i class="${s.icon_class} colored"></i><h4>${s.name}</h4>`;
            container.appendChild(div);
        });
    };
    // --- INIT ---
    const initApp = async () => {
        const [projects, localization] = await Promise.all([
            fetchJSON('assets/json/projects.json'),
            fetchJSON('assets/json/localization.json')
        ]);
        if (projects && localization) {
            initControls(projects, localization);
            loadProjects(projects, currentLang);
            translatePage(localization, currentLang);
        }
        await loadSkills();
    };
    initApp();
});