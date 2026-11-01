const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
const languageFilesUrl = new URL('lang/', scriptUrl);

document.addEventListener('DOMContentLoaded', function () {
    const DEFAULT_LANGUAGE = 'en';
    const languageSelectors = [
        document.getElementById('languageSelect'),
        document.getElementById('sidebarLanguageSelect')
    ].filter(Boolean);

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

    function syncLanguageSelectors(lang) {
        languageSelectors.forEach(function (select) {
            select.value = lang;
        });
    }

    function applyTranslations(translations) {
        document.querySelectorAll('[data-i18n]').forEach(function (element) {
            const key = element.getAttribute('data-i18n');
            const translation = translations[key];

            if (typeof translation === 'undefined') {
                return;
            }

            if (['INPUT', 'TEXTAREA'].includes(element.tagName)) {
                element.placeholder = translation;
                return;
            }

            if (element.tagName === 'OPTION') {
                element.textContent = translation;
                return;
            }

            element.innerHTML = translation;
        });
    }

    function setLanguage(lang) {
        syncLanguageSelectors(lang);
        localStorage.setItem('selectedLanguage', lang);

        fetch(new URL(`${lang}.json`, languageFilesUrl))
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Language file could not be loaded.');
                }

                return response.json();
            })
            .then(applyTranslations)
            .catch(function (error) {
                console.warn('Unable to apply selected language:', error);
            });
    }

    function initLanguageSelectors() {
        languageSelectors.forEach(function (select) {
            select.addEventListener('change', handleLangChange);
        });

        setLanguage(localStorage.getItem('selectedLanguage') || DEFAULT_LANGUAGE);

        function handleLangChange(event) {
            setLanguage(event.target.value);
        }
    }

    initLanguageSelectors();
    addFooterPartners();
    addAvailableBadges();
});