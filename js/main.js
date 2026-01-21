(() => {
  const page = document.body?.dataset?.page || '';

  // -----------------------
  // Active Menu State
  // -----------------------
  function setActiveNav(current) {
    document.querySelectorAll('[data-nav]').forEach((el) => {
      if (el.dataset.nav === current) el.classList.add('active');
    });
  }

  // -----------------------
  // Mobile Menu Overlay
  // -----------------------
  function initMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const toggleBtn = document.querySelector('[data-js="menuToggle"]');
    const closeBtn = menu?.querySelector('[data-js="menuClose"]') || null;

    if (!menu || !toggleBtn) return;

    const open = () => {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
    };

    const close = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
    };

    toggleBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);

    // Klick auf Link schliesst Menue
    menu.addEventListener('click', (e) => {
      if (e.target?.closest?.('a')) close();
    });

    // ESC schliesst Menue
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // -----------------------
  // Splide Carousel (Home)
  // -----------------------
  function initHeroCarousel() {
    const splideEl = document.getElementById('heroSplide');
    if (!splideEl || !window.Splide) return;

    const slides = Array.from(splideEl.querySelectorAll('.splide__slide'));

    const setSlideWidths = () => {
      const first = slides[0];
      if (!first) return;

      const h = Math.round(first.getBoundingClientRect().height);
      if (!h) return;

      slides.forEach((slide) => {
        const img = slide.querySelector('img');
        if (!img?.naturalWidth || !img.naturalHeight) return;
        const ratio = img.naturalWidth / img.naturalHeight;
        slide.style.width = `${Math.round(h * ratio)}px`;
      });
    };

    const splide = new Splide(splideEl, {
      type: 'loop',
      drag: true,
      arrows: false,
      pagination: false,
      gap: 0,
      autoWidth: true,
      perMove: 1,
      rewind: false,
      speed: 600,
      focus: 'center',
      breakpoints: {
        768: { autoWidth: false, perPage: 1 },
      },
    });

    // Erst nach dem Laden der Bilder Breiten setzen und dann mounten
    const imgs = Array.from(splideEl.querySelectorAll('img'));
    const waitForImages = Promise.all(
      imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((res) => img.addEventListener('load', res, { once: true }))))
    );

    waitForImages.then(() => {
      setSlideWidths();
      splide.mount();

      let t;
      window.addEventListener('resize', () => {
        window.clearTimeout(t);
        t = window.setTimeout(() => {
          if (window.matchMedia('(max-width: 768px)').matches) {
            slides.forEach((s) => (s.style.width = ''));
            splide.refresh();
            return;
          }
          setSlideWidths();
          splide.refresh();
        }, 120);
      });

      const controls = document.querySelector('.hero__controls');
      controls?.addEventListener('click', (e) => {
        const btn = e.target?.closest?.('button[data-dir]');
        if (!btn) return;
        splide.go(btn.dataset.dir === 'prev' ? '<' : '>');
      });
    });
  }

  // -----------------------
  // fjGallery (Gallery Page)
  // -----------------------
  function initPhotoGallery() {
    const galleryEl = document.getElementById('photoGallery');
    if (!galleryEl || !window.fjGallery) return;

    const targets = document.querySelectorAll('#photoGallery');

    const getGalleryOptions = () => {
      const w = window.innerWidth;

      if (w <= 768) {
        return {
          itemSelector: '.fj-gallery-item',
          gutter: { horizontal: 18, vertical: 26 },
          rowHeight: 520,
          rowHeightTolerance: 0.25,
          lastRow: 'left',
          calculateItemsHeight: true,
        };
      }

      if (w <= 900) {
        return {
          itemSelector: '.fj-gallery-item',
          gutter: { horizontal: 20, vertical: 32 },
          rowHeight: 260,
          rowHeightTolerance: 0.25,
          lastRow: 'left',
          calculateItemsHeight: true,
        };
      }

      return {
        itemSelector: '.fj-gallery-item',
        gutter: { horizontal: 24, vertical: 38 },
        rowHeight: 320,
        rowHeightTolerance: 0.25,
        lastRow: 'left',
        calculateItemsHeight: true,
      };
    };

    const bucket = () => {
      const w = window.innerWidth;
      if (w <= 768) return 'm';
      if (w <= 900) return 't';
      return 'd';
    };

    let currentBucket = '';
    const init = () => {
      currentBucket = bucket();
      window.fjGallery(targets, getGalleryOptions());

      // Sobald Bilder nachladen (lazy), Layout neu berechnen
      galleryEl.querySelectorAll('img').forEach((img) => {
        img.addEventListener('load', () => window.fjGallery(targets, 'resize'), { once: true });
      });
    };

    init();

    let rt;
    window.addEventListener('resize', () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        const next = bucket();
        if (next !== currentBucket) {
          window.fjGallery(targets, 'destroy');
          init();
        } else {
          window.fjGallery(targets, 'resize');
        }
      }, 140);
    });
  }

  setActiveNav(page);
  initMobileMenu();
  initHeroCarousel();
  initPhotoGallery();
})();
