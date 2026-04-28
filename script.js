document.addEventListener('DOMContentLoaded', function () {
    const DEFAULT_LANGUAGE = 'en';
    const languageSelectors = [
        document.getElementById('languageSelect'),
        document.getElementById('sidebarLanguageSelect')
    ].filter(Boolean);

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

        fetch(`lang/${lang}.json`)
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
});