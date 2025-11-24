(() => {
  const LANGUAGE_STORAGE_KEY = 'miniAppLanguage';
  const RTL_LANGUAGES = new Set(['ar', 'fa']);
  const isRtlLanguage = (language) => {
    if (!language) {
      return false;
    }
    const normalized = language.toLowerCase();
    return Array.from(RTL_LANGUAGES).some((rtl) => normalized === rtl || normalized.startsWith(`${rtl}-`));
  };
  const LANGUAGE_OPTIONS = [
    { code: 'ar-XXX', label: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'kk', label: 'Қазақша', flag: '🇰🇿' }
  ];
  const DEFAULT_LANGUAGE = 'en';

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
        // ignore storage errors
      }
    }
  };

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

  const matchLanguage = (code) => getLanguageConfig(code)?.code || null;

  const getLanguageFromPath = () => {
    const pathSegment = window.location.pathname.split('/').filter(Boolean)[0];
    return matchLanguage(pathSegment);
  };

  const detectInitialLanguage = () => {
    const pathLanguage = getLanguageFromPath();
    if (pathLanguage) {
      return pathLanguage;
    }

    const stored = storage.get(LANGUAGE_STORAGE_KEY);
    if (matchLanguage(stored)) {
      return matchLanguage(stored);
    }

    const telegramLanguage = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (matchLanguage(telegramLanguage)) {
      return matchLanguage(telegramLanguage);
    }

    const browserLanguages = Array.isArray(navigator.languages) ? navigator.languages : [];
    for (const browserLanguage of browserLanguages) {
      const matchedBrowserLanguage = matchLanguage(browserLanguage);
      if (matchedBrowserLanguage) {
        return matchedBrowserLanguage;
      }
    }

    const navigatorLanguage = navigator.language || navigator.userLanguage;
    if (matchLanguage(navigatorLanguage)) {
      return matchLanguage(navigatorLanguage);
    }

    const documentLanguage = matchLanguage(document.documentElement.lang);
    if (documentLanguage) {
      return documentLanguage;
    }

    return DEFAULT_LANGUAGE;
  };

  const translationsCache = new Map();

  const loadTranslations = async (language) => {
    const target = matchLanguage(language) || DEFAULT_LANGUAGE;
    if (translationsCache.has(target)) {
      return translationsCache.get(target);
    }

    const loadPromise = fetch(`/locales/${target}/translation.json`, {
      headers: { Accept: 'application/json' },
      cache: 'no-cache'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load translations for ${target}`);
        }
        return response.json();
      })
      .then((data) => {
        translationsCache.set(target, data);
        return data;
      })
      .catch((error) => {
        translationsCache.delete(target);
        throw error;
      });

    translationsCache.set(target, loadPromise);
    return loadPromise;
  };

  const resolveValue = (translations, key) => {
    if (!translations || !key) {
      return undefined;
    }
    return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), translations);
  };

  const applyContent = (element, value) => {
    if (typeof value === 'undefined') {
      return;
    }
    const mode = element.dataset.i18nMode || 'html';
    if (mode === 'text') {
      element.textContent = value;
    } else if (mode === 'attribute') {
      // handled separately
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

  const translateElement = (element, translations) => {
    const key = element.dataset.i18n;
    if (key) {
      applyContent(element, resolveValue(translations, key));
    }

    const singleAttr = element.dataset.i18nAttr;
    if (singleAttr && key) {
      applyAttributes(element, singleAttr, resolveValue(translations, key));
    }

    const multiple = element.dataset.i18nAttrs;
    if (multiple) {
      multiple.split(';').forEach((pair) => {
        const [attr, attrKey] = pair.split(':').map((item) => item.trim());
        if (!attr || !attrKey) {
          return;
        }
        applyAttributes(element, attr, resolveValue(translations, attrKey));
      });
    }
  };

  const translateDocument = (translations) => {
    if (!translations) {
      return;
    }
    document.querySelectorAll('[data-i18n], [data-i18n-attr], [data-i18n-attrs]').forEach((element) => {
      translateElement(element, translations);
    });
  };

  const updateDocumentLanguage = (language) => {
    const target = matchLanguage(language) || DEFAULT_LANGUAGE;
    document.documentElement.lang = target;
    document.documentElement.dir = isRtlLanguage(target) ? 'rtl' : 'ltr';
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

  const initSwitcher = (switcher, onSelect) => {
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
      button.addEventListener('click', async () => {
        closeSwitcher(switcher);
        await onSelect(option.code);
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

  const state = {
    language: DEFAULT_LANGUAGE,
    translations: null
  };

  const buildLanguageUrl = (language) => {
    const target = matchLanguage(language) || DEFAULT_LANGUAGE;
    return `/${target}/`;
  };

  const updateSwitchers = () => {
    document.querySelectorAll('[data-language-switcher]').forEach((switcher) => {
      updateSwitcherSelection(switcher, state.language);
    });
  };

  const render = () => {
    translateDocument(state.translations);
    updateSwitchers();
  };

  const changeLanguage = async (language, { redirect = false } = {}) => {
    const target = matchLanguage(language) || DEFAULT_LANGUAGE;
    if (redirect) {
      storage.set(LANGUAGE_STORAGE_KEY, target);
      const currentPathLanguage = getLanguageFromPath();
      const targetUrl = buildLanguageUrl(target);
      if (currentPathLanguage !== target || !window.location.pathname.startsWith(targetUrl)) {
        window.location.href = targetUrl;
      }
      return;
    }

    if (target === state.language && state.translations) {
      updateDocumentLanguage(target);
      render();
      return;
    }

    try {
      const translations = await loadTranslations(target);
      state.language = target;
      state.translations = translations;
      updateDocumentLanguage(target);
      render();
    } catch (error) {
      console.error(error);
      if (target !== DEFAULT_LANGUAGE) {
        await changeLanguage(DEFAULT_LANGUAGE);
      }
    }
  };

  const initLanguageSwitchers = () => {
    document.querySelectorAll('[data-language-switcher]').forEach((switcher) => {
      initSwitcher(switcher, (language) => changeLanguage(language, { redirect: true }));
      updateSwitcherSelection(switcher, state.language);
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
    await changeLanguage(initialLanguage);
    initLanguageSwitchers();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
