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

})();
