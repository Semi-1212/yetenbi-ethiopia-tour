document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('[data-tour-gallery]');

    if (!sections.length) {
        return;
    }

    const viewer = document.createElement('dialog');
    viewer.className = 'tour-gallery-viewer';
    viewer.setAttribute('aria-label', 'Photo viewer');

    const viewerImage = document.createElement('img');
    const viewerCaption = document.createElement('p');
    const viewerClose = document.createElement('button');
    viewerClose.type = 'button';
    viewerClose.textContent = 'Close';
    viewerClose.setAttribute('aria-label', 'Close photo viewer');
    const viewerNav = document.createElement('div');
    viewerNav.className = 'tour-gallery-viewer-nav';
    const viewerPrev = document.createElement('button');
    viewerPrev.type = 'button';
    viewerPrev.textContent = '‹';
    viewerPrev.setAttribute('aria-label', 'Previous photo');
    const viewerNext = document.createElement('button');
    viewerNext.type = 'button';
    viewerNext.textContent = '›';
    viewerNext.setAttribute('aria-label', 'Next photo');
    viewerNav.append(viewerPrev, viewerNext);
    viewer.append(viewerClose, viewerImage, viewerCaption, viewerNav);

    function stepViewer(delta) {
        currentIndex = (currentIndex + delta + currentSlides.length) % currentSlides.length;
        showViewerPhoto();
    }
    viewerPrev.addEventListener('click', function () { stepViewer(-1); });
    viewerNext.addEventListener('click', function () { stepViewer(1); });
    document.body.append(viewer);

    let currentSlides = [];
    let currentIndex = 0;
    let lastTrigger = null;

    sections.forEach(function (section) {
        const slides = Array.from(section.querySelectorAll('.tour-gallery-item'));
        const stage = section.querySelector('.tour-gallery-grid');
        if (!stage || !slides.length) {
            return;
        }

        if (section.dataset.galleryLayout === 'mosaic') {
            slides.forEach(function (slide) {
                slide.addEventListener('click', function () {
                    currentSlides = slides;
                    currentIndex = slides.indexOf(slide);
                    lastTrigger = slide;
                    showViewerPhoto();
                    viewer.showModal();
                    viewerClose.focus();
                });
            });
            if ('IntersectionObserver' in window) {
                const reveal = new IntersectionObserver(function (entries, obs) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            obs.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                slides.forEach(function (slide) {
                    reveal.observe(slide);
                });
            } else {
                slides.forEach(function (slide) {
                    slide.classList.add('is-visible');
                });
            }
            return;
        }

        let index = 0;
        let timer = null;
        let isVisible = false;
        let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const controls = document.createElement('div');
        controls.className = 'tour-gallery-controls';

        const previous = document.createElement('button');
        previous.className = 'tour-gallery-control';
        previous.type = 'button';
        previous.textContent = '‹ Previous';
        previous.setAttribute('aria-label', 'Previous photo');

        const toggle = document.createElement('button');
        toggle.className = 'tour-gallery-control';
        toggle.type = 'button';

        const count = document.createElement('span');
        count.className = 'tour-gallery-counter';
        count.setAttribute('aria-live', 'polite');

        const next = document.createElement('button');
        next.className = 'tour-gallery-control';
        next.type = 'button';
        next.textContent = 'Next ›';
        next.setAttribute('aria-label', 'Next photo');

        controls.append(previous, toggle, count, next);
        stage.after(controls);

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                const active = slideIndex === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
                slide.tabIndex = active ? 0 : -1;
            });
            count.textContent = (index + 1) + ' / ' + slides.length;
        }

        function stop() {
            window.clearInterval(timer);
            timer = null;
        }

        function updatePlayback() {
            toggle.textContent = playing ? 'Pause' : 'Play';
            toggle.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
            toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
            stop();
            if (playing && isVisible && !document.hidden && !section.matches(':hover') && !section.contains(document.activeElement)) {
                timer = window.setInterval(function () {
                    showSlide(index + 1);
                }, 5000);
            }
        }

        previous.addEventListener('click', function () {
            showSlide(index - 1);
            updatePlayback();
        });
        next.addEventListener('click', function () {
            showSlide(index + 1);
            updatePlayback();
        });
        toggle.addEventListener('click', function () {
            playing = !playing;
            updatePlayback();
        });
        section.addEventListener('mouseenter', stop);
        section.addEventListener('mouseleave', updatePlayback);
        section.addEventListener('focusin', stop);
        section.addEventListener('focusout', function (event) {
            if (!section.contains(event.relatedTarget)) {
                updatePlayback();
            }
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stop();
            } else {
                updatePlayback();
            }
        });
        const observer = new IntersectionObserver(function (entries) {
            isVisible = entries.some(function (entry) {
                return entry.isIntersecting;
            });
            updatePlayback();
        });
        observer.observe(section);

        slides.forEach(function (slide) {
            slide.addEventListener('click', function () {
                currentSlides = slides;
                currentIndex = slides.indexOf(slide);
                lastTrigger = slide;
                showViewerPhoto();
                viewer.showModal();
                viewerClose.focus();
            });
        });

        showSlide(0);
        updatePlayback();
    });

    function showViewerPhoto() {
        const slide = currentSlides[currentIndex];
        viewerImage.src = slide.dataset.fullSrc;
        viewerImage.alt = slide.dataset.alt;
        viewerCaption.textContent = slide.dataset.caption + ' (' + (currentIndex + 1) + ' / ' + currentSlides.length + ')';
    }

    function closeViewer() {
        if (viewer.open) {
            viewer.close();
        }
        if (lastTrigger) {
            lastTrigger.focus();
            lastTrigger = null;
        }
    }

    viewerClose.addEventListener('click', closeViewer);
    viewer.addEventListener('click', function (event) {
        if (event.target === viewer) {
            closeViewer();
        }
    });
    viewer.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeViewer();
        } else if (event.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + currentSlides.length) % currentSlides.length;
            showViewerPhoto();
        } else if (event.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % currentSlides.length;
            showViewerPhoto();
        }
    });
    viewer.addEventListener('close', function () {
        if (lastTrigger) {
            lastTrigger.focus();
            lastTrigger = null;
        }
    });
});
