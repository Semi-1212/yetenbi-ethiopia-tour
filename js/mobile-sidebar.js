/**
 * Keeps .main-navbar flush under .top-navbar (no overlap when top bar wraps on mobile).
 * Opens/closes #sidebar + #overlay when present.
 */
(function () {
    function syncStackHeights() {
        var topBar = document.querySelector('.top-navbar');
        var mainNav = document.querySelector('.main-navbar');
        var root = document.documentElement;
        if (!topBar || !mainNav) {
            return;
        }
        var th = Math.ceil(topBar.getBoundingClientRect().height);
        var mh = Math.ceil(mainNav.getBoundingClientRect().height);
        root.style.setProperty('--top-navbar-height', th + 'px');
        root.style.setProperty('--header-stack-height', th + mh + 'px');
    }

    function initSidebar() {
        var mobileMenuBtn = document.getElementById('mobileMenuBtn');
        var closeSidebar = document.getElementById('closeSidebar');
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('overlay');
        if (!sidebar || !overlay) {
            return;
        }

        function openSidebar() {
            sidebar.classList.add('sidebar--open');
            sidebar.setAttribute('aria-hidden', 'false');
            overlay.classList.add('is-visible');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (mobileMenuBtn) {
                mobileMenuBtn.classList.add('is-open');
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenuBtn.setAttribute('aria-label', 'Close menu');
            }
        }

        function closeSidebarFn() {
            sidebar.classList.remove('sidebar--open');
            sidebar.setAttribute('aria-hidden', 'true');
            overlay.classList.remove('is-visible');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (mobileMenuBtn) {
                mobileMenuBtn.classList.remove('is-open');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Open menu');
            }
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', function () {
                if (sidebar.classList.contains('sidebar--open')) {
                    closeSidebarFn();
                } else {
                    openSidebar();
                }
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
        var desktopQuery = window.matchMedia('(min-width: 992px)');
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
                toggle.setAttribute('aria-expanded', 'false');
            }
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

    function init() {
        syncStackHeights();
        initSidebar();
        initDesktopDropdowns();
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
