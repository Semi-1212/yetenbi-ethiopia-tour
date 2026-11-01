document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-arba-minch-gallery]').forEach(function (gallery) {
        const photos = Array.from(gallery.querySelectorAll('img'));
        const count = gallery.querySelector('[data-arba-minch-count]');
        let activeIndex = 0;

        function showPhoto(index) {
            activeIndex = (index + photos.length) % photos.length;
            photos.forEach(function (photo, photoIndex) {
                const isActive = photoIndex === activeIndex;
                if (isActive) {
                    photo.loading = 'eager';
                }
                photo.classList.toggle('is-active', isActive);
                photo.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            });
            count.textContent = (activeIndex + 1) + ' / ' + photos.length;

            const preload = new Image();
            preload.src = photos[(activeIndex + 1) % photos.length].src;
        }

        gallery.querySelector('[data-arba-minch-previous]').addEventListener('click', function () {
            showPhoto(activeIndex - 1);
        });
        gallery.querySelector('[data-arba-minch-next]').addEventListener('click', function () {
            showPhoto(activeIndex + 1);
        });

        if (photos.length) {
            showPhoto(0);
        }
    });
});
