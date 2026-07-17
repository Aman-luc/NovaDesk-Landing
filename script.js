/* ==========================================================================
   NOVADESK — SCRIPT
   Vanilla JS only. Organized into small, single-purpose modules that each
   initialize themselves once the DOM is ready.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initMobileMenu();
  initAnimatedStats();
  initPricingToggle();
  initAccordion();
  initHeroForm();
  setFooterYear();
});

/* ---------------------------------------------------------
   Sticky nav: swap glass tint from dark-on-hero to light-on-scroll
--------------------------------------------------------- */
function initStickyNav() {
  const nav = document.getElementById('siteNav');
  if (!nav) return;

  const toggleState = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  toggleState();
  window.addEventListener('scroll', toggleState, { passive: true });
}

/* ---------------------------------------------------------
   Mobile menu: accessible open/close with aria-expanded sync
--------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    toggle.classList.add('is-active');
    menu.hidden = false;
  };

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.classList.remove('is-active');
    menu.hidden = true;
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close the menu whenever a link inside it is chosen
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on any click/tap outside the menu and its toggle button
  document.addEventListener('click', (event) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  // Close as soon as the page is scrolled
  window.addEventListener('scroll', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
  }, { passive: true });

  // Close on Escape for keyboard users, returning focus to the toggle
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
}

/* ---------------------------------------------------------
   Animated stats: count up from 0 once the section enters view
--------------------------------------------------------- */
function initAnimatedStats() {
  const numbers = document.querySelectorAll('.stat__number');
  if (!numbers.length) return;

  const formatValue = (value, el) => {
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const suffix = el.dataset.suffix || '';

    if (el.dataset.format === 'compact') {
      // Present large counts like "2.4M" for readability
      return (value / 1_000_000).toFixed(1) + 'M' + suffix;
    }

    return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
  };

  const animate = (el) => {
    const target = parseFloat(el.dataset.target);
    const duration = 1600; // ms
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatValue(target * eased, el);

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  numbers.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Pricing toggle: switch between monthly / yearly amounts
--------------------------------------------------------- */
function initPricingToggle() {
  const switchEl = document.getElementById('billingSwitch');
  const values = document.querySelectorAll('.price-card__value');
  if (!switchEl || !values.length) return;

  switchEl.addEventListener('click', () => {
    const isYearly = switchEl.getAttribute('aria-checked') === 'true';
    const nextIsYearly = !isYearly;
    switchEl.setAttribute('aria-checked', String(nextIsYearly));

    values.forEach((el) => {
      const price = nextIsYearly ? el.dataset.yearly : el.dataset.monthly;
      el.textContent = price;
    });
  });
}

/* ---------------------------------------------------------
   FAQ accordion: single-open behaviour, fully keyboard accessible
--------------------------------------------------------- */
function initAccordion() {
  const accordion = document.getElementById('accordion');
  if (!accordion) return;

  const triggers = Array.from(accordion.querySelectorAll('.accordion__trigger'));

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close every other panel so only one question is open at a time
      triggers.forEach((other) => {
        if (other !== trigger) {
          other.setAttribute('aria-expanded', 'false');
          const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });
}

/* ---------------------------------------------------------
   Hero form: prevent a real network submit in this demo build
--------------------------------------------------------- */
function initHeroForm() {
  const form = document.getElementById('heroForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    const originalLabel = button.textContent;

    button.textContent = 'You\u2019re on the list \u2713';
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalLabel;
      button.disabled = false;
      form.reset();
    }, 2600);
  });
}

/* ---------------------------------------------------------
   Footer: keep the copyright year current automatically
--------------------------------------------------------- */
function setFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
