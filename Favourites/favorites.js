// Favorites page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Favorites page loaded');
    initializeFavoritesPage();
});

function initializeFavoritesPage() {
    loadFavoritesFromStorage();
    
    // Initialize animations
    if (typeof VibeCheckAnimations !== 'undefined') {
        VibeCheckAnimations.initFavoritesAnimations();
    }
}

function loadFavoritesFromStorage() {
    console.log('Loading favorites from localStorage');
    showLoading();
    
    // Get all keys from localStorage that start with 'fav_'
    const favorites = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fav_')) {
            try {
                const trackData = JSON.parse(localStorage.getItem(key));
                if (trackData) {
                    favorites.push({
                        key: key,
                        title: trackData.title,
                        artist: trackData.artist,
                        timestamp: trackData.timestamp
                    });
                }
            } catch (error) {
                console.error('Error parsing favorite:', key, error);
            }
        }
    }
    
    console.log('Found favorites:', favorites);
    
    // Sort by timestamp (newest first)
    favorites.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    displayFavorites(favorites);
    hideLoading();
}

function displayFavorites(favorites) {
    const favoritesList = document.getElementById('favorites-list');
    
    if (!favorites || favorites.length === 0) {
        favoritesList.innerHTML = '';
        checkEmptyState();
        return;
    }

    favoritesList.innerHTML = '';

    favorites.forEach((fav, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        trackItem.setAttribute('data-key', fav.key);
        
        trackItem.innerHTML = `
            <div class="track-info">
                <div class="track-title">${fav.title}</div>
                <div class="track-artist">${fav.artist}</div>
                <div class="track-date">${formatDate(fav.timestamp)}</div>
            </div>
            <div class="track-actions">
                <button class="icon-btn play-btn" data-preview="">▶</button>
                <button class="icon-btn favorite-btn active" data-key="${fav.key}">♥</button>
            </div>
        `;
        
        favoritesList.appendChild(trackItem);
    });

    // Initialize event listeners for the new elements
    initializeFavoriteButtons();
    initializePlayButtons();
    
    checkEmptyState();
    
    // Animate items in sequence
    animateFavoritesIn();
}

function initializeFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const trackKey = this.getAttribute('data-key');
            const trackItem = this.closest('.track-item');
            
            console.log('Removing favorite:', trackKey);
            
            // Animate removal
            gsap.to(trackItem, {
                opacity: 0,
                x: -100,
                duration: 0.3,
                onComplete: () => {
                    // Remove from localStorage
                    localStorage.removeItem(trackKey);
                    // Remove from DOM
                    trackItem.remove();
                    // Check if list is now empty
                    checkEmptyState();
                }
            });
        });
    });
}

function initializePlayButtons() {
    const playButtons = document.querySelectorAll('.play-btn');
    let currentAudio = null;
    
    playButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const previewUrl = this.getAttribute('data-preview');
            
            // Stop any currently playing audio
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
                // Reset all play buttons
                playButtons.forEach(b => b.textContent = '▶');
            }
            
            if (previewUrl) {
                // Play the preview
                currentAudio = new Audio(previewUrl);
                currentAudio.play();
                this.textContent = '⏸';
                
                currentAudio.onended = function() {
                    btn.textContent = '▶';
                    currentAudio = null;
                };
                
                currentAudio.onerror = function() {
                    console.log('Error playing audio preview');
                    btn.textContent = '▶';
                    currentAudio = null;
                };
            } else {
                console.log('No preview available for this track');
                // You could add a search functionality here to find the track preview
            }
        });
    });
}

function animateFavoritesIn() {
    const trackItems = document.querySelectorAll('.track-item');
    
    gsap.fromTo(trackItems, {
        opacity: 0,
        x: 50
    }, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
    });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else {
        return date.toLocaleDateString();
    }
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

function showLoading() {
    const loading = document.getElementById('loading');
    const favoritesList = document.getElementById('favorites-list');
    if (loading) loading.style.display = 'block';
    if (favoritesList) favoritesList.style.display = 'none';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

// Refresh favorites when page becomes visible (if user adds favorites in another tab)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Page visible, refreshing favorites');
        loadFavoritesFromStorage();
    }
});

// Also refresh if storage changes (from other tabs/windows)
window.addEventListener('storage', function(e) {
    if (e.key && e.key.startsWith('fav_')) {
        console.log('Storage changed, refreshing favorites');
        loadFavoritesFromStorage();
    }
});