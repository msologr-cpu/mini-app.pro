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
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isHidden = menu.hasAttribute('hidden');
      if (isHidden) {
        menu.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        menu.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    menu.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        menu.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      });
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
