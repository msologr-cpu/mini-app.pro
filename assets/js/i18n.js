(() => {
  if (typeof i18next === 'undefined' || typeof i18nextHttpBackend === 'undefined') {
    console.error('i18next dependencies are missing.');
    return;
  }

  const LANGUAGE_STORAGE_KEY = 'miniAppLanguage';
  const RTL_LANGUAGES = new Set(['ar', 'fa']);
  const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिन्दी · Hindi', flag: '🇮🇳' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦' },
    { code: 'kk', label: 'Қазақ тілі', flag: '🇰🇿' },
    { code: 'hy', label: 'Հայերեն', flag: '🇦🇲' },
    { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
    { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' },
    { code: 'tg', label: 'Тоҷикӣ', flag: '🇹🇯' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' }
  ];

  const getLanguageConfig = (code) => {
    if (!code) {
      return null;
    }
    const normalized = code.toLowerCase();
    return (
      LANGUAGE_OPTIONS.find((option) => option.code.toLowerCase() === normalized) ||
      LANGUAGE_OPTIONS.find((option) => option.code.toLowerCase().split('-')[0] === normalized.split('-')[0]) ||
      null
    );
  };

  const supportedLanguages = LANGUAGE_OPTIONS.map((option) => option.code);
  const DEFAULT_LANGUAGE = getLanguageConfig(document.documentElement.lang)?.code || 'en';

  const storage = {
    get(key) {
      try {
        return window.localStorage?.getItem(key) || null;
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage?.setItem(key, value);
      } catch (error) {
        // ignore storage errors (Safari private mode, Telegram WebView, etc.)
      }
    }
  };

  const matchLanguage = (code) => getLanguageConfig(code)?.code || null;

  const detectInitialLanguage = () => {
    const stored = storage.get(LANGUAGE_STORAGE_KEY);
    if (matchLanguage(stored)) {
      return matchLanguage(stored);
    }

    const telegramLanguage = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (matchLanguage(telegramLanguage)) {
      return matchLanguage(telegramLanguage);
    }

    const documentLanguage = document.documentElement.lang;
    if (matchLanguage(documentLanguage)) {
      return matchLanguage(documentLanguage);
    }

    const navigatorLanguage = navigator.language || navigator.userLanguage;
    if (matchLanguage(navigatorLanguage)) {
      return matchLanguage(navigatorLanguage);
    }

    return DEFAULT_LANGUAGE;
  };

  const getValue = (key) => (key && i18next.exists(key) ? i18next.t(key) : undefined);

  const applyContent = (element, value) => {
    if (typeof value === 'undefined') {
      return;
    }
    const mode = element.dataset.i18nMode || 'html';
    if (mode === 'text') {
      element.textContent = value;
    } else if (mode === 'attribute') {
      // attribute values handled separately
    } else {
      element.innerHTML = value;
    }
  };

  const applyAttributes = (element, attrName, value) => {
    if (typeof value === 'undefined') {
      return;
    }
    element.setAttribute(attrName, value);
  };

  const translateElement = (element) => {
    const key = element.dataset.i18n;
    if (key) {
      applyContent(element, getValue(key));
    }

    const singleAttr = element.dataset.i18nAttr;
    if (singleAttr && key) {
      applyAttributes(element, singleAttr, getValue(key));
    }

    const multiple = element.dataset.i18nAttrs;
    if (multiple) {
      multiple.split(';').forEach((pair) => {
        const [attr, attrKey] = pair.split(':').map((item) => item.trim());
        if (!attr || !attrKey) {
          return;
        }
        applyAttributes(element, attr, getValue(attrKey));
      });
    }
  };

  const translateDocument = () => {
    document.querySelectorAll('[data-i18n], [data-i18n-attr], [data-i18n-attrs]').forEach(translateElement);
  };

  const updateDocumentLanguage = (language) => {
    const target = matchLanguage(language) || DEFAULT_LANGUAGE;
    document.documentElement.lang = target;
    document.documentElement.dir = RTL_LANGUAGES.has(target) ? 'rtl' : 'ltr';
    storage.set(LANGUAGE_STORAGE_KEY, target);
  };

  const closeSwitcher = (switcher) => {
    const toggle = switcher.querySelector('[data-language-toggle]');
    const options = switcher.querySelector('[data-language-options]');
    switcher.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    options?.setAttribute('hidden', '');
  };

  const openSwitcher = (switcher) => {
    const toggle = switcher.querySelector('[data-language-toggle]');
    const options = switcher.querySelector('[data-language-options]');
    switcher.classList.add('is-open');
    toggle?.setAttribute('aria-expanded', 'true');
    options?.removeAttribute('hidden');
  };

  const updateSwitcherSelection = (switcher, language) => {
    const toggle = switcher.querySelector('[data-language-toggle]');
    const flagTarget = switcher.querySelector('[data-language-flag]');
    const codeTarget = switcher.querySelector('[data-language-code]');
    const config = getLanguageConfig(language) || getLanguageConfig(DEFAULT_LANGUAGE);
    if (toggle) {
      toggle.setAttribute('aria-label', config?.label || 'Language');
      toggle.setAttribute('title', config?.label || '');
    }
    if (flagTarget) {
      flagTarget.textContent = config?.flag || '🌐';
    }
    if (codeTarget) {
      codeTarget.textContent = (config?.code || DEFAULT_LANGUAGE).toUpperCase();
    }
    switcher.querySelectorAll('[data-language-option]').forEach((option) => {
      option.setAttribute('aria-selected', option.dataset.languageOption === config?.code ? 'true' : 'false');
    });
  };

  const initSwitcher = (switcher) => {
    const toggle = switcher.querySelector('[data-language-toggle]');
    const optionsContainer = switcher.querySelector('[data-language-options]');
    if (!toggle || !optionsContainer) {
      return;
    }

    optionsContainer.innerHTML = '';
    LANGUAGE_OPTIONS.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'language-switcher__option';
      button.dataset.languageOption = option.code;
      button.setAttribute('role', 'option');
      button.innerHTML = `
        <span class="language-switcher__flag" aria-hidden="true">${option.flag}</span>
        <span class="language-switcher__label">${option.label}</span>
        <span class="language-switcher__code">${option.code.toUpperCase()}</span>
      `;
      button.addEventListener('click', () => {
        const targetLanguage = matchLanguage(option.code) || DEFAULT_LANGUAGE;
        if (targetLanguage !== i18next.language) {
          i18next.changeLanguage(targetLanguage);
        }
        closeSwitcher(switcher);
      });
      optionsContainer.appendChild(button);
    });

    toggle.addEventListener('click', () => {
      if (switcher.classList.contains('is-open')) {
        closeSwitcher(switcher);
      } else {
        document.querySelectorAll('[data-language-switcher].is-open').forEach((open) => {
          if (open !== switcher) {
            closeSwitcher(open);
          }
        });
        openSwitcher(switcher);
      }
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!switcher.classList.contains('is-open')) {
          openSwitcher(switcher);
        }
        const firstOption = optionsContainer.querySelector('[data-language-option]');
        firstOption?.focus();
      }
    });

    optionsContainer.addEventListener('keydown', (event) => {
      const options = Array.from(optionsContainer.querySelectorAll('[data-language-option]'));
      if (!options.length) {
        return;
      }
      const currentIndex = options.indexOf(document.activeElement);

      if (event.key === 'Escape') {
        event.preventDefault();
        closeSwitcher(switcher);
        toggle.focus();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
        options[nextIndex]?.focus();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex]?.focus();
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        options[0]?.focus();
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        options[options.length - 1]?.focus();
      }
    });
  };

  const initLanguageSwitchers = () => {
    document.querySelectorAll('[data-language-switcher]').forEach((switcher) => {
      initSwitcher(switcher);
      updateSwitcherSelection(switcher, i18next.language);
    });

    document.addEventListener('click', (event) => {
      document.querySelectorAll('[data-language-switcher].is-open').forEach((switcher) => {
        if (!switcher.contains(event.target)) {
          closeSwitcher(switcher);
        }
      });
    });
  };

  const bootstrap = async () => {
    const initialLanguage = detectInitialLanguage();

    try {
      await i18next.use(i18nextHttpBackend).init({
        lng: 'en',
        fallbackLng: ['en', 'ru'],
        supportedLngs: supportedLanguages,
        backend: {
          loadPath: '/locales/{{lng}}/translation.json'
        },
        load: 'currentOnly',
        returnEmptyString: false,
        interpolation: {
          escapeValue: false
        }
      });

      const targetLanguage = matchLanguage(initialLanguage) || 'en';
      if (targetLanguage !== i18next.language) {
        await i18next.changeLanguage(targetLanguage);
      }
    } catch (error) {
      console.error('Failed to initialise i18next', error);
      return;
    }

    updateDocumentLanguage(i18next.language);
    translateDocument();
    initLanguageSwitchers();

    i18next.on('languageChanged', (language) => {
      updateDocumentLanguage(language);
      translateDocument();
      document.querySelectorAll('[data-language-switcher]').forEach((switcher) => {
        updateSwitcherSelection(switcher, language);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
