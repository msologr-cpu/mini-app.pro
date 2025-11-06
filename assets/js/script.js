const docReady = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

docReady(() => {
  const currentYearEls = document.querySelectorAll('#current-year');
  currentYearEls.forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const overlay = document.querySelector('[data-mobile-overlay]');
  const closeControl = document.querySelector('[data-mobile-close]');

  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-menu-open');
      if (overlay) {
        overlay.setAttribute('hidden', '');
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        menu.setAttribute('hidden', '');
      }
    };

    const openMenu = () => {
      menu.removeAttribute('hidden');
      if (overlay) {
        overlay.removeAttribute('hidden');
      }
      window.requestAnimationFrame(() => {
        menu.classList.add('is-open');
      });
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mobile-menu-open');
    };

    const toggleMenu = () => {
      const isHidden = menu.hasAttribute('hidden');
      if (isHidden) {
        openMenu();
      } else {
        closeMenu();
      }
    };

    toggle.addEventListener('click', toggleMenu);

    menu.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform' && !menu.classList.contains('is-open')) {
        menu.setAttribute('hidden', '');
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    if (closeControl) {
      closeControl.addEventListener('click', closeMenu);
    }

    menu.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hasAttribute('hidden')) {
        closeMenu();
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href')?.substring(1);
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const animatedSections = document.querySelectorAll('[data-animate]');
  if (animatedSections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
      }
    );

    animatedSections.forEach((section) => observer.observe(section));
  }

  const parallaxNodes = document.querySelectorAll('[data-parallax]');
  if (parallaxNodes.length > 0) {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      parallaxNodes.forEach((node) => {
        const speed = parseFloat(node.dataset.parallaxSpeed || '0.25');
        const translate = Math.round(scrollY * speed * -1);
        node.style.transform = `translate3d(0, ${translate}px, 0)`;
      });
    };

    handleScroll();
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(handleScroll);
    });
  }
});
