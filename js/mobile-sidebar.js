/**
 * Keeps .main-navbar flush under .top-navbar (no overlap when top bar wraps on mobile).
 * Opens/closes #sidebar + #overlay when present.
 */
(function () {
    var OPEN_CLASS = 'sidebar--open';
    var VISIBLE_CLASS = 'is-visible';
    var DESKTOP_QUERY = '(min-width: 992px)';
    var WHATSAPP_BOOKING_URL = 'https://wa.me/251913271706?text=Hello%2C%20I%20would%20like%20to%20book%20a%20tour%20with%20Yetenbi%20Ethiopia%20Tours.';

    function setAttributeIfPresent(element, name, value) {
        if (element) {
            element.setAttribute(name, value);
        }
    }

    function setMobileMenuState(button, isOpen) {
        if (!button) {
            return;
        }

        button.classList.toggle('is-open', isOpen);
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        button.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    }

    function setSidebarState(sidebar, overlay, button, isOpen) {
        if (sidebar) {
            sidebar.classList.toggle(OPEN_CLASS, isOpen);
            sidebar.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        }

        if (overlay) {
            overlay.classList.toggle(VISIBLE_CLASS, isOpen);
            overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        }

        setMobileMenuState(button, isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function setBookLinksToWhatsapp(bookLinks) {
        for (var i = 0; i < bookLinks.length; i++) {
            bookLinks[i].href = WHATSAPP_BOOKING_URL;
            bookLinks[i].target = '_blank';
            bookLinks[i].rel = 'noopener noreferrer';
            bookLinks[i].dataset.whatsappLink = 'true';
        }
    }

    function syncStackHeights() {
        var topBar = document.querySelector('.top-navbar');
        var mainNav = document.querySelector('.main-navbar');
        var root = document.documentElement;

        if (!topBar || !mainNav) {
            return;
        }

        var topBarHeight = Math.ceil(topBar.getBoundingClientRect().height);
        var mainNavHeight = Math.ceil(mainNav.getBoundingClientRect().height);

        root.style.setProperty('--top-navbar-height', topBarHeight + 'px');
        root.style.setProperty('--header-stack-height', topBarHeight + mainNavHeight + 'px');
    }

    function initSidebar() {
        var mobileMenuBtn = document.getElementById('mobileMenuBtn');
        var closeSidebar = document.getElementById('closeSidebar');
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('overlay');
        if (!sidebar || !overlay) {
            return;
        }

        function closeSidebarFn() {
            setSidebarState(sidebar, overlay, mobileMenuBtn, false);
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', function () {
                var isOpen = sidebar.classList.contains(OPEN_CLASS);
                setSidebarState(sidebar, overlay, mobileMenuBtn, !isOpen);
            });
        }

        if (closeSidebar) {
            closeSidebar.addEventListener('click', closeSidebarFn);
        }

        overlay.addEventListener('click', closeSidebarFn);

        var dropdownBtns = document.getElementsByClassName('dropdown-btn');
        for (var i = 0; i < dropdownBtns.length; i++) {
            dropdownBtns[i].addEventListener('click', function () {
                var isOpen = this.classList.toggle('active');
                this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        var sidebarLinks = document.querySelectorAll('.sidebar a:not(.dropdown-btn)');
        for (var j = 0; j < sidebarLinks.length; j++) {
            sidebarLinks[j].addEventListener('click', closeSidebarFn);
        }
    }

    function initDesktopDropdowns() {
        var desktopQuery = window.matchMedia(DESKTOP_QUERY);
        var dropdowns = document.querySelectorAll('.main-navbar .navbar-nav > .nav-item.dropdown');

        function closeDropdown(dropdown) {
            var toggle = dropdown.querySelector('.dropdown-toggle');
            var menu = dropdown.querySelector('.dropdown-menu');

            if (window.bootstrap && bootstrap.Dropdown && toggle) {
                var instance = bootstrap.Dropdown.getInstance(toggle);
                if (instance) {
                    instance.hide();
                }
            }

            dropdown.classList.remove('show');

            if (toggle) {
                toggle.classList.remove('show');
            }

            setAttributeIfPresent(toggle, 'aria-expanded', 'false');

            if (menu) {
                menu.classList.remove('show');
                menu.removeAttribute('data-bs-popper');
            }
        }

        function closeOtherDropdowns(activeDropdown) {
            if (!desktopQuery.matches) {
                return;
            }

            for (var i = 0; i < dropdowns.length; i++) {
                if (dropdowns[i] !== activeDropdown) {
                    closeDropdown(dropdowns[i]);
                }
            }
        }

        for (var i = 0; i < dropdowns.length; i++) {
            dropdowns[i].addEventListener('mouseenter', function () {
                closeOtherDropdowns(this);
            });

            dropdowns[i].addEventListener('focusin', function () {
                closeOtherDropdowns(this);
            });

            var toggle = dropdowns[i].querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', function () {
                    var activeDropdown = this.closest('.nav-item.dropdown');
                    if (activeDropdown) {
                        closeOtherDropdowns(activeDropdown);
                    }
                });
            }
        }

        document.addEventListener('show.bs.dropdown', function (event) {
            var activeDropdown = event.target.closest('.main-navbar .nav-item.dropdown');
            if (activeDropdown) {
                closeOtherDropdowns(activeDropdown);
            }
        });

        desktopQuery.addEventListener('change', function (event) {
            if (!event.matches) {
                for (var i = 0; i < dropdowns.length; i++) {
                    closeDropdown(dropdowns[i]);
                }
            }
        });
    }

    function initBookingModalLinks() {
        var navBookLinks = document.querySelectorAll('.btn-book');
        var bookingModal = document.getElementById('bookingModal');
        var bookingForm = document.getElementById('bookingForm');
        var confirmationMessage = document.getElementById('confirmationMessage');
        var tourDate = document.getElementById('tourDate');
        var firstNameInput = document.getElementById('fullName');
        var defaultCategory = document.getElementById('category');
        var tourType = document.getElementById('tourType');
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('overlay');
        var mobileMenuBtn = document.getElementById('mobileMenuBtn');

        setBookLinksToWhatsapp(navBookLinks);

        if (!bookingModal || !bookingForm) {
            return;
        }

        function closeSidebarIfOpen() {
            setSidebarState(sidebar, overlay, mobileMenuBtn, false);
        }

        function openBookingModal() {
            closeSidebarIfOpen();

            bookingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            bookingForm.style.display = 'flex';

            if (confirmationMessage) {
                confirmationMessage.style.display = 'none';
            }

            bookingForm.reset();

            if (tourDate) {
                tourDate.min = new Date().toISOString().split('T')[0];
            }

            if (defaultCategory) {
                tourType = tourType || document.getElementById('tourType');
                if (tourType && !tourType.value) {
                    tourType.value = defaultCategory.value || '';
                }
            }

            if (firstNameInput) {
                firstNameInput.focus();
            }
        }

        for (var i = 0; i < navBookLinks.length; i++) {
            navBookLinks[i].addEventListener('click', function (event) {
                if (this.dataset.whatsappLink === 'true') {
                    return;
                }

                event.preventDefault();
                openBookingModal();
            });
        }

        window.openBookingModal = openBookingModal;
    }

    function init() {
        syncStackHeights();
        initSidebar();
        initDesktopDropdowns();
        initBookingModalLinks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', function () {
        syncStackHeights();
    });

    window.addEventListener('resize', function () {
        requestAnimationFrame(syncStackHeights);
    });

    window.addEventListener('orientationchange', function () {
        setTimeout(syncStackHeights, 200);
    });

    if (typeof ResizeObserver !== 'undefined') {
        var topBar = document.querySelector('.top-navbar');
        if (topBar) {
            new ResizeObserver(syncStackHeights).observe(topBar);
        }
        var mainNav = document.querySelector('.main-navbar');
        if (mainNav) {
            new ResizeObserver(syncStackHeights).observe(mainNav);
        }
    }
})();
