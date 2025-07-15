
document.addEventListener('DOMContentLoaded', function() {
    // Handle Read More/Less buttons
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.blog-card');
            const isExpanded = card.classList.contains('expanded');
            // Toggle only the current card
            if (isExpanded) {
                card.classList.remove('expanded');
                this.setAttribute('aria-expanded', 'false');
                this.querySelector('.btn-text').textContent = '';
            } else {
                card.classList.add('expanded');
                this.setAttribute('aria-expanded', 'true');
                this.querySelector('.btn-text').textContent = 'Read Less';
                // Smooth scroll to card
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    });
    
    // Handle View All button
    const viewAllBtn = document.getElementById('viewAllBtn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            const hiddenPosts = document.querySelectorAll('.hidden-post');
            const isShowingAll = hiddenPosts[0].classList.contains('show-post');
            
            if (isShowingAll) {
                hiddenPosts.forEach(post => {
                    post.classList.remove('show-post');
                    // Also close any expanded hidden posts
                    post.classList.remove('expanded');
                    const btn = post.querySelector('.read-more-btn');
                    btn.setAttribute('aria-expanded', 'false');
                    btn.querySelector('.btn-text').textContent = '';
                });
                this.textContent = 'View All Blog Posts';
            } else {
                hiddenPosts.forEach(post => {
                    post.classList.add('show-post');
                });
                this.textContent = 'Show Less';
            }
        });
    }
});