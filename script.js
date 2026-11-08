const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;

document.addEventListener('DOMContentLoaded', function () {
    const DEFAULT_LANGUAGE = 'en';
    const GOOGLE_LANGUAGE_CODES = {
        en: 'en',
        es: 'es',
        fr: 'fr',
        zh: 'zh-CN',
        ar: 'ar',
        ru: 'ru',
        pt: 'pt',
        de: 'de',
        ja: 'ja',
        hi: 'hi'
    };
    let languageSelectors = [];

    function addFooterPartners() {
        const footer = document.querySelector('.footer-section');
        const divider = footer && footer.querySelector('.footer-divider');
        const toursColumn = footer && footer.querySelector('.footer-tours');

        if (!footer || !divider || !toursColumn) {
            return;
        }

        const partners = document.createElement('section');
        partners.className = 'footer-partners';
        partners.setAttribute('aria-label', 'Our partners');
        partners.innerHTML = `
            <h5 class="footer-partners__title">Our Partners</h5>
            <div class="footer-partners__list">
                <a class="footer-partner" href="https://www.ethiopianairlines.com/" target="_blank" rel="noopener noreferrer" aria-label="Ethiopian Airlines">
                    <img class="footer-partner__logo" src="${new URL('images/partners/ethiopian-airlines.svg', scriptUrl).href}" alt="Ethiopian Airlines" loading="lazy" decoding="async">
                </a>
                <a class="footer-partner" href="https://www.ethiopianskylighthotel.com/" target="_blank" rel="noopener noreferrer" aria-label="Ethiopian Skylight Hotel">
                    <img class="footer-partner__logo" src="${new URL('images/partners/skylight-hotel.png', scriptUrl).href}" alt="Ethiopian Skylight Hotel" loading="lazy" decoding="async">
                </a>
                <a class="footer-partner" href="https://visitethiopia.et/" target="_blank" rel="noopener noreferrer" aria-label="Land of Origins Ethiopia">
                    <img class="footer-partner__logo" src="${new URL('images/partners/land-of-origins.png', scriptUrl).href}" alt="Ethiopia Land of Origins" loading="lazy" decoding="async">
                    <span class="footer-partner__caption">Land of Origins</span>
                </a>
                <a class="footer-partner" href="https://etoa.travel/" target="_blank" rel="noopener noreferrer" aria-label="Ethiopian Tour Operators Association (ETOA)">
                    <img class="footer-partner__logo" src="${new URL('images/partners/etoa.png', scriptUrl).href}" alt="ETOA - Ethiopian Tour Operators Association" loading="lazy" decoding="async">
                </a>
            </div>
        `;

        toursColumn.append(partners);
    }

    function addAvailableBadges() {
        document.querySelectorAll('.tour-card, .hike-card').forEach(function (card) {
            if (card.querySelector('.available-badge')) {
                return;
            }

            const image = card.querySelector('img');
            if (!image) {
                return;
            }

            const imageContainer = image.closest('.tour-card-image, .hike-image') || image.parentElement;
            if (!imageContainer) {
                return;
            }

            imageContainer.classList.add('available-card-image');

            const badge = document.createElement('span');
            badge.className = 'available-badge';
            badge.textContent = 'Available';
            badge.setAttribute('aria-label', 'Available');
            imageContainer.append(badge);
        });
    }

    function siteLanguageForGoogleLanguage(lang) {
        return Object.keys(GOOGLE_LANGUAGE_CODES).find(function (siteLanguage) {
            return GOOGLE_LANGUAGE_CODES[siteLanguage] === lang;
        }) || DEFAULT_LANGUAGE;
    }

    function selectedGoogleLanguage() {
        const translateCookie = document.cookie.split('; ').find(function (cookie) {
            return cookie.indexOf('googtrans=') === 0;
        });
        const cookieValue = translateCookie
            ? decodeURIComponent(translateCookie.slice('googtrans='.length))
            : '';
        const match = cookieValue.match(/^\/en\/([a-z]{2}(?:-[A-Z]{2})?)$/);

        return match ? match[1] : '';
    }

    function setTranslateCookie(lang) {
        if (lang === DEFAULT_LANGUAGE) {
            document.cookie = 'googtrans=;path=/;max-age=0;SameSite=Lax';
            return;
        }

        document.cookie = 'googtrans=/en/' + GOOGLE_LANGUAGE_CODES[lang] + ';path=/;max-age=31536000;SameSite=Lax';
    }

    function syncLanguageSelectors(lang) {
        languageSelectors.forEach(function (select) {
            select.value = lang;
        });
    }

    function ensureDesktopLanguageSelector() {
        if (document.getElementById('languageSelect')) {
            return;
        }

        const navList = document.querySelector('.main-navbar .navbar-nav');
        if (!navList) {
            console.error('Unable to add the language switcher: main navigation was not found.');
            return;
        }

        const languages = [
            ['en', '🇬🇧 English'],
            ['es', '🇪🇸 Español'],
            ['fr', '🇫🇷 Français'],
            ['zh', '🇨🇳 中文'],
            ['ar', '🇸🇦 العربية'],
            ['ru', '🇷🇺 Русский'],
            ['pt', '🇵🇹 Português'],
            ['de', '🇩🇪 Deutsch'],
            ['ja', '🇯🇵 日本語'],
            ['hi', '🇮🇳 हिन्दी']
        ];
        const item = document.createElement('li');
        const select = document.createElement('select');
        item.className = 'nav-item mx-2';
        select.id = 'languageSelect';
        select.className = 'form-select form-select-sm';
        select.setAttribute('aria-label', 'Choose language');

        languages.forEach(function (language) {
            const option = document.createElement('option');
            option.value = language[0];
            option.textContent = language[1];
            select.append(option);
        });

        item.append(select);
        navList.append(item);
    }

    function modernizeLanguageSelectors() {
        languageSelectors.forEach(function (select) {
            select.classList.add('language-switcher__select');
            select.setAttribute('aria-label', select.getAttribute('aria-label') || 'Choose language');

            if (select.id === 'languageSelect') {
                const wrapper = document.createElement('span');
                const icon = document.createElement('i');
                wrapper.className = 'language-switcher language-switcher--desktop';
                icon.className = 'fas fa-globe language-switcher__icon';
                icon.setAttribute('aria-hidden', 'true');
                select.parentNode.insertBefore(wrapper, select);
                wrapper.append(icon, select);
                return;
            }

            const wrapper = select.closest('.sidebar-lang-wrap');
            const icon = wrapper && wrapper.querySelector('.sidebar-lang-icon');
            if (wrapper && icon) {
                wrapper.classList.add('language-switcher', 'language-switcher--sidebar');
                icon.classList.add('language-switcher__icon');
                icon.innerHTML = '<i class="fas fa-globe" aria-hidden="true"></i>';
            }
        });
    }

    function loadGoogleTranslate() {
        const container = document.createElement('div');
        container.id = 'google_translate_element';
        container.hidden = true;
        document.body.append(container);

        window.googleTranslateElementInit = function () {
            new window.google.translate.TranslateElement({
                pageLanguage: DEFAULT_LANGUAGE,
                includedLanguages: 'es,fr,zh-CN,ar,ru,pt,de,ja,hi',
                autoDisplay: false
            }, container.id);
        };

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.onerror = function () {
            console.error('Unable to load Google Translate.');
        };
        document.head.append(script);
    }

    function initLanguageSelectors() {
        ensureDesktopLanguageSelector();
        languageSelectors = [
            document.getElementById('languageSelect'),
            document.getElementById('sidebarLanguageSelect')
        ].filter(Boolean);

        if (!languageSelectors.length) {
            return;
        }

        modernizeLanguageSelectors();

        languageSelectors.forEach(function (select) {
            select.addEventListener('change', function (event) {
                const lang = event.target.value;

                if (!Object.prototype.hasOwnProperty.call(GOOGLE_LANGUAGE_CODES, lang)) {
                    return;
                }

                localStorage.setItem('selectedLanguage', lang);
                setTranslateCookie(lang);
                window.location.reload();
            });
        });

        const translateLanguage = selectedGoogleLanguage();
        const storedLanguage = localStorage.getItem('selectedLanguage');
        const initialLanguage = translateLanguage
            ? siteLanguageForGoogleLanguage(translateLanguage)
            : (GOOGLE_LANGUAGE_CODES[storedLanguage] ? storedLanguage : DEFAULT_LANGUAGE);

        if (!translateLanguage && initialLanguage !== DEFAULT_LANGUAGE) {
            setTranslateCookie(initialLanguage);
        }

        syncLanguageSelectors(initialLanguage);
        loadGoogleTranslate();
    }

    initLanguageSelectors();
    addFooterPartners();
    addAvailableBadges();
});