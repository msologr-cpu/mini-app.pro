const initMenu = () => {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const overlay = document.querySelector('[data-mobile-overlay]');
  const closeButton = document.querySelector('[data-mobile-close]');

  if (!toggle || !menu) {
    return;
  }

  const openMenu = () => {
    menu.removeAttribute('hidden');
    overlay?.removeAttribute('hidden');
    window.requestAnimationFrame(() => {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mobile-menu-open');
    });
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-open');
    overlay?.setAttribute('hidden', '');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      menu.setAttribute('hidden', '');
    }
  };

  const toggleMenu = () => {
    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  toggle.addEventListener('click', toggleMenu);
  overlay?.addEventListener('click', closeMenu);
  closeButton?.addEventListener('click', closeMenu);

  menu.addEventListener('transitionend', (event) => {
    if (event.propertyName === 'transform' && !menu.classList.contains('is-open')) {
      menu.setAttribute('hidden', '');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  });
};

if (document.readyState !== 'loading') {
  initMenu();
} else {
  document.addEventListener('DOMContentLoaded', initMenu);
}
