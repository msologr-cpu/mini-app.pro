(() => {
  const TRANSLATION_PATH = '/locales/en/translation.json';

  const getNestedValue = (obj, key) =>
    key.split('.').reduce((acc, part) => (acc && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : undefined), obj);

  const applyContent = (el, value) => {
    if (value === undefined) {
      return;
    }

    const mode = el.dataset.i18nMode || 'html';
    if (mode === 'text') {
      el.textContent = value;
    } else if (mode === 'attribute') {
      // noop: attribute handled separately
    } else {
      el.innerHTML = value;
    }
  };

  const applyAttribute = (el, attrName, value) => {
    if (value === undefined) {
      return;
    }
    el.setAttribute(attrName, value);
  };

  const applyElementTranslations = (el, translations) => {
    const key = el.dataset.i18n;
    if (key) {
      const value = getNestedValue(translations, key);
      applyContent(el, value);
    }

    const singleAttr = el.dataset.i18nAttr;
    if (singleAttr && key) {
      const value = getNestedValue(translations, key);
      applyAttribute(el, singleAttr, value);
    }

    const multi = el.dataset.i18nAttrs;
    if (multi) {
      multi.split(';').forEach((pair) => {
        const [attr, attrKey] = pair.split(':').map((item) => item.trim());
        if (!attr || !attrKey) {
          return;
        }
        const value = getNestedValue(translations, attrKey);
        applyAttribute(el, attr, value);
      });
    }
  };

  const init = (translations) => {
    document.querySelectorAll('[data-i18n], [data-i18n-attrs]').forEach((el) => {
      applyElementTranslations(el, translations);
    });
  };

  const loadTranslations = async () => {
    try {
      const response = await fetch(TRANSLATION_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`);
      }
      const data = await response.json();
      init(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTranslations);
  } else {
    loadTranslations();
  }
})();
