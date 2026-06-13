(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function updateHeader() {
    if (window.scrollY > 60) {
      document.body.classList.add('is-scrolled');
    } else {
      document.body.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-current', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterGrid = document.querySelector('[data-filter-grid]');
  var filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));

  function applyFilter() {
    if (!filterGrid) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var activeChip = document.querySelector('[data-filter-chip].is-active');
    var chip = activeChip ? activeChip.getAttribute('data-filter-chip').toLowerCase() : '';
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-filter-card]'));

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedChip = !chip || haystack.indexOf(chip) !== -1;
      card.style.display = matchedQuery && matchedChip ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (item) {
        item.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      applyFilter();
    });
  });

  function createSearchCard(item) {
    var card = document.createElement('a');
    card.className = 'movie-card';
    card.href = item.url;
    card.innerHTML = '' +
      '<span class="poster-frame">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-glow"></span>' +
      '</span>' +
      '<span class="card-copy">' +
        '<span class="card-badges"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(String(item.year)) + '</span></span>' +
        '<strong>' + escapeHtml(item.title) + '</strong>' +
        '<small>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</small>' +
        '<em>' + escapeHtml(item.summary) + '</em>' +
        '<span class="card-tags">' + escapeHtml((item.tags || []).slice(0, 4).join(' ')) + '</span>' +
      '</span>';
    return card;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  var resultWrap = document.querySelector('[data-search-results]');
  if (resultWrap && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');
    var pageInput = document.querySelector('[data-search-page-input]');

    if (pageInput) {
      pageInput.value = q;
    }

    var results = [];
    if (q) {
      var lower = q.toLowerCase();
      results = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.genre,
          item.year,
          item.category,
          (item.tags || []).join(' '),
          item.summary
        ].join(' ').toLowerCase();
        return haystack.indexOf(lower) !== -1;
      }).slice(0, 120);
    } else {
      results = window.SEARCH_INDEX.slice(0, 60);
    }

    if (title) {
      title.textContent = q ? '“' + q + '”的搜索结果' : '热门影片';
    }
    if (count) {
      count.textContent = q ? '找到 ' + results.length + ' 部相关影片' : '为你展示部分热门内容';
    }
    results.forEach(function (item) {
      resultWrap.appendChild(createSearchCard(item));
    });
  }
})();
