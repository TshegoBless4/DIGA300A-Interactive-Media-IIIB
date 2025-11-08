// Common functionality shared across all pages. 

// Enhanced navigation initialization
function initializeNavigation() {
    // Set active navigation link based on current page
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = getPageFromHref(link.getAttribute('href'));
        
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    const fullPath = window.location.href;
    
    // Handle different page scenarios
    if (filename === 'favorites.html' || path.includes('favorites.html') || fullPath.includes('favorites.html')) {
        return 'favorites';
    } else if (filename === 'about.html' || path.includes('about.html') || fullPath.includes('about.html')) {
        return 'about';
    } else if (filename === 'artist.html' || path.includes('artist.html') || fullPath.includes('artist.html')) {
        return 'artist';
    } else if (filename === 'index.html' || filename === '' || path.endsWith('/') || fullPath.endsWith('index.html')) {
        return 'home';
    }
    
    // Additional fallback: check if i am in the root 
    if (path === '/' || path.endsWith('/VibeCheck/') || !filename) {
        return 'home';
    }
    
    return 'home'; // Default fallback
}

function getPageFromHref(href) {
    if (!href) return '';
    
    // Handle different href formats
    if (href.includes('favorites.html') || href.includes('/Favourites/')) {
        return 'favorites';
    } else if (href.includes('about.html') || href.includes('/About/')) {
        return 'about';
    } else if (href.includes('artist.html') || href.includes('/Artist/')) {
        return 'artist';
    } else if (href.includes('index.html') || href === '../' || href === './' || href === '/' || href === '' || href.includes('../index.html')) {
        return 'home';
    }
    
    return ''; // Unknown page
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