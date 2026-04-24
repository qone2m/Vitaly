/* ===== Виталий — Металлоконструкции | main.js ===== */
(function () {
    'use strict';

    // ===== DOM Elements =====
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card[data-filter]');

    // ===== State =====
    let currentFilter = 'all';
    let visibleItems = [];
    let currentIndex = 0;
    let touchStartX = 0;

    // ===== Mobile nav overlay =====
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    // ===== Header scroll effect =====
    function handleScroll() {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ===== Burger menu =====
    function toggleMenu(open) {
        const isOpen = typeof open === 'boolean' ? open : !nav.classList.contains('open');
        nav.classList.toggle('open', isOpen);
        burger.classList.toggle('active', isOpen);
        overlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    burger.addEventListener('click', function () { toggleMenu(); });
    overlay.addEventListener('click', function () { toggleMenu(false); });

    // Close menu on nav link click
    nav.querySelectorAll('.nav__link').forEach(function (link) {
        link.addEventListener('click', function () { toggleMenu(false); });
    });

    // ===== Gallery filtering =====
    function getVisibleItems() {
        return Array.from(gallery.querySelectorAll('.gallery-item:not(.hidden)'));
    }

    function filterGallery(category) {
        currentFilter = category;
        var items = gallery.querySelectorAll('.gallery-item');
        items.forEach(function (item) {
            if (category === 'all' || item.dataset.category === category) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
        visibleItems = getVisibleItems();

        // Update active button
        filterBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterGallery(this.dataset.filter);
        });
    });

    // Service cards -> filter & scroll to portfolio
    serviceCards.forEach(function (card) {
        card.addEventListener('click', function (e) {
            e.preventDefault();
            var filter = this.dataset.filter;
            filterGallery(filter);
            document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Init visible items
    visibleItems = getVisibleItems();

    // ===== Lightbox =====
    function openLightbox(index) {
        if (index < 0 || index >= visibleItems.length) return;
        currentIndex = index;
        var img = visibleItems[index].querySelector('img');
        lightboxImg.src = img.dataset.full;
        lightboxImg.alt = img.alt;
        lightboxCounter.textContent = (index + 1) + ' / ' + visibleItems.length;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImg.src = '';
    }

    function nextImage() {
        openLightbox((currentIndex + 1) % visibleItems.length);
    }

    function prevImage() {
        openLightbox((currentIndex - 1 + visibleItems.length) % visibleItems.length);
    }

    // Gallery click -> open lightbox
    gallery.addEventListener('click', function (e) {
        var item = e.target.closest('.gallery-item');
        if (!item || item.classList.contains('hidden')) return;
        var idx = visibleItems.indexOf(item);
        if (idx !== -1) openLightbox(idx);
    });

    // Lightbox controls
    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__next').addEventListener('click', nextImage);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', prevImage);

    // Click on backdrop closes lightbox
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

    // Touch swipe for lightbox
    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        var diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff < 0) nextImage();
            else prevImage();
        }
    }, { passive: true });

    // ===== Scroll reveal (IntersectionObserver) =====
    var revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealItems.length) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, i) {
                if (entry.isIntersecting) {
                    // small stagger for grouped items
                    var delay = entry.target.closest('.about__grid, .process__grid, .services__grid')
                        ? Array.prototype.indexOf.call(entry.target.parentNode.children, entry.target) * 80
                        : 0;
                    setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealItems.forEach(function (el) { revealObs.observe(el); });
    } else {
        revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // ===== Counter animation for hero stats =====
    var counters = document.querySelectorAll('.hero-stat__num[data-count]');
    function animateCounter(el) {
        var target = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || '';
        var duration = 1400;
        var start = performance.now();
        function tick(now) {
            var p = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window && counters.length) {
        var cObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    cObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(function (c) { cObs.observe(c); });
    } else {
        counters.forEach(animateCounter);
    }

})();
