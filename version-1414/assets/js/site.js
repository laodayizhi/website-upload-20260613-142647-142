document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
      menuButton.textContent = expanded ? '☰' : '×';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5600);
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-control]'));
  var filterGrid = document.querySelector('[data-filter-grid]');
  var searchGrid = document.querySelector('[data-search-grid]');
  var searchInput = document.querySelector('[data-search-input]');
  var emptyState = document.querySelector('[data-empty-state]');
  var activeType = '全部';
  var currentQuery = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!filterGrid) {
      return;
    }
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.filter-card'));
    var visible = 0;
    cards.forEach(function (card) {
      var type = card.getAttribute('data-type') || '';
      var text = normalize(card.getAttribute('data-search'));
      var typeMatched = activeType === '全部' || type === activeType;
      var queryMatched = !currentQuery || text.indexOf(currentQuery) !== -1;
      var show = typeMatched && queryMatched;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeType = button.getAttribute('data-filter-control') || '全部';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  if (searchGrid) {
    var params = new URLSearchParams(window.location.search);
    currentQuery = normalize(params.get('q'));
    if (searchInput) {
      searchInput.value = params.get('q') || '';
      searchInput.addEventListener('input', function () {
        currentQuery = normalize(searchInput.value);
        applyFilters();
      });
    }
    applyFilters();
  } else if (filterGrid) {
    applyFilters();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('.play-trigger');
    var source = player.getAttribute('data-video-src');
    var prepared = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (prepared || !video || !source) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startVideo(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      prepareVideo();
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
        if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
          hlsInstance.stopLoad();
        }
      });
    }
  });
});
