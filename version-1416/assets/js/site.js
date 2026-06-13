(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

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

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            var frame = image.closest('.poster-frame, .hero-backdrop, .hero-poster, .mini-movie, .ranking-card');

            if (frame) {
                frame.classList.add('poster-fallback');
            }
        }, { once: true });
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var root = panel.closest('.section') || document;
        var grid = root.querySelector('[data-card-grid]') || document.querySelector('[data-card-grid]');

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
        var searchInput = panel.querySelector('[data-search-input]');
        var categoryFilter = panel.querySelector('[data-category-filter]');
        var yearFilter = panel.querySelector('[data-year-filter]');
        var sortSelect = panel.querySelector('[data-sort-select]');
        var resultCount = panel.querySelector('[data-result-count]');

        function textOf(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-category') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-tags') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
        }

        function sortCards() {
            if (!sortSelect) {
                return;
            }

            var mode = sortSelect.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === 'title') {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
                }

                if (mode === 'heat') {
                    var heatA = parseFloat((a.textContent.match(/热度\s*([\d.]+)/) || [0, 0])[1]);
                    var heatB = parseFloat((b.textContent.match(/热度\s*([\d.]+)/) || [0, 0])[1]);
                    return heatB - heatA;
                }

                return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
            });

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function applyFilter() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var category = categoryFilter ? categoryFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
                var matchesCategory = !category || card.getAttribute('data-category') === category;
                var matchesYear = !year || card.getAttribute('data-year') === year;
                var shouldShow = matchesQuery && matchesCategory && matchesYear;

                card.classList.toggle('is-hidden', !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = visible + ' 部';
            }
        }

        [searchInput, categoryFilter, yearFilter, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', function () {
                    sortCards();
                    applyFilter();
                });

                control.addEventListener('change', function () {
                    sortCards();
                    applyFilter();
                });
            }
        });

        sortCards();
        applyFilter();
    });
}());
