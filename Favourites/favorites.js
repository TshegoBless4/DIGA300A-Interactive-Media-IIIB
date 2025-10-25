// Favorites page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeFavoritesPage();
});

function initializeFavoritesPage() {
    // Check if favorites list is empty and show empty state
    checkEmptyState();
    
    // Add specific event listeners for favorites page
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove the track item when unfavorited
            if (!this.classList.contains('active')) {
                const trackItem = this.closest('.track-item');
                gsap.to(trackItem, {
                    opacity: 0,
                    x: -100,
                    duration: 0.3,
                    onComplete: () => {
                        trackItem.remove();
                        checkEmptyState();
                    }
                });
            }
        });
    });

    // Initialize animations
    VibeCheckAnimations.initFavoritesAnimations();
}

function checkEmptyState() {
    const favoritesList = document.getElementById('favorites-list');
    const emptyState = document.getElementById('empty-state');
    const trackItems = favoritesList.querySelectorAll('.track-item');
    
    if (trackItems.length === 0) {
        emptyState.style.display = 'block';
        favoritesList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        favoritesList.style.display = 'block';
    }
}

// Function to load favorites from localStorage (to be implemented)
function loadFavoritesFromStorage() {
    // This will be implemented with localStorage integration
    console.log('Loading favorites from storage');
}