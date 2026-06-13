(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-site-nav]');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      navigation.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = () => {
      timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = null;
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stop();
        showSlide(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  const panel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-search-grid]');
  if (panel && grid) {
    const input = panel.querySelector('[data-search-input]');
    const category = panel.querySelector('[data-category-filter]');
    const type = panel.querySelector('[data-type-filter]');
    const year = panel.querySelector('[data-year-filter]');
    const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
    const count = document.querySelector('[data-result-count]');
    const empty = document.querySelector('[data-empty-state]');

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const applyFilters = () => {
      const query = normalize(input && input.value);
      const categoryValue = normalize(category && category.value);
      const typeValue = normalize(type && type.value);
      const yearValue = normalize(year && year.value);
      let shown = 0;

      cards.forEach((card) => {
        const text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.keywords
        ].join(' '));
        const isMatch = (!query || text.includes(query)) &&
          (!categoryValue || normalize(card.dataset.category) === categoryValue) &&
          (!typeValue || normalize(card.dataset.type) === typeValue) &&
          (!yearValue || normalize(card.dataset.year) === yearValue);

        card.hidden = !isMatch;
        if (isMatch) {
          shown += 1;
        }
      });

      if (count) {
        count.textContent = String(shown);
      }
      if (empty) {
        empty.hidden = shown !== 0;
      }
    };

    [input, category, type, year].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
