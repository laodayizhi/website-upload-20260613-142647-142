(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        play();
      });
    });

    showSlide(0);
    play();
  }

  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var filters = Array.prototype.slice.call(filterBar.querySelectorAll('[data-filter]'));

    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter');
        filters.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          var visible = value === 'all' || card.getAttribute('data-type') === value || card.getAttribute('data-region') === value || card.getAttribute('data-year') === value;
          card.style.display = visible ? '' : 'none';
        });
      });
    });
  }

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && Array.isArray(window.movieSearchList)) {
    var params = new URLSearchParams(window.location.search);
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var query = (params.get('q') || '').trim();

    if (input) {
      input.value = query;
    }

    function cardTemplate(movie) {
      return [
        '<article class="movie-card">',
        '  <a href="' + movie.url + '">',
        '    <div class="card-cover">',
        '      <img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="card-year">' + escapeHtml(movie.year) + '</span>',
        '      <div class="card-badges"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '    </div>',
        '    <div class="card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[match];
      });
    }

    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.movieSearchList.filter(function (movie) {
      if (!terms.length) {
        return false;
      }
      var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.tags].join(' ').toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 120);

    if (title) {
      title.textContent = query ? '搜索：' + query : '搜索影片';
    }

    if (!query) {
      searchResults.innerHTML = '<div class="empty-state">输入片名、类型、地区或年份，快速找到想看的内容。</div>';
    } else if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">没有找到相关内容，可以尝试更短的关键词。</div>';
    } else {
      searchResults.innerHTML = results.map(cardTemplate).join('');
    }
  }

  var video = document.querySelector('[data-video-player]');
  if (video) {
    var overlay = document.querySelector('[data-play-overlay]');
    var stream = video.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    function attachVideo() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startVideo() {
      attachVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
