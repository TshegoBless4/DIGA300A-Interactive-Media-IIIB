// Common functionality shared across all pages
function initializeNavigation() {
    // Set active navigation link based on current page
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initializeFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // This will be implemented with localStorage integration
            const isNowFavorite = this.classList.contains('active');
            const trackTitle = this.closest('.track-item')?.querySelector('.track-title')?.textContent || 'Track';
            console.log(`"${trackTitle}" ${isNowFavorite ? 'added to' : 'removed from'} favorites`);
        });
    });
}

function initializePlayButtons() {
    const playButtons = document.querySelectorAll('.play-btn');
    let currentAudio = null;

    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const previewUrl = this.getAttribute('data-preview');
            const trackName = this.closest('.track-item')?.querySelector('.track-title')?.textContent || 'Unknown Track';
            
            if (!previewUrl) {
                alert(`No preview available for "${trackName}"`);
                return;
            }

            // Stop current audio if playing
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
                // Reset all play buttons
                document.querySelectorAll('.play-btn').forEach(btn => {
                    btn.textContent = '▶';
                });
            }

            // Play new audio
            currentAudio = new Audio(previewUrl);
            currentAudio.play();
            this.textContent = '⏸';

            currentAudio.addEventListener('ended', () => {
                this.textContent = '▶';
                currentAudio = null;
            });

            currentAudio.addEventListener('pause', () => {
                this.textContent = '▶';
            });
        });
    });
}

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFavoriteButtons();
    initializePlayButtons();
    
    // Initialize common animations
    if (typeof VibeCheckAnimations !== 'undefined') {
        VibeCheckAnimations.initPageLoadAnimation();
        VibeCheckAnimations.initInteractiveAnimations();
    }
});