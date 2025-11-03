document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav')) {
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
  const scope = document.querySelector('.post-view .content, .page .content');
  if (!scope) return;

  // Find a representative paragraph (falls back to container)
  const p = scope.querySelector('p') || scope;
  const pSize = getComputedStyle(p).fontSize; // e.g., "15px"
  scope.style.setProperty('--body-fs', pSize);
});
