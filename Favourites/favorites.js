// Favorites page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Favorites page loaded');
    initializeFavoritesPage();
});

let currentAudio = null;
let currentlyPlaying = null;

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
                        timestamp: trackData.timestamp,
                        hasPreview: trackData.hasPreview || false // Get the stored preview status
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
        // Generate Spotify search URL for the track
        const spotifyUrl = generateSpotifyUrl(fav.title, fav.artist);
        
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        trackItem.setAttribute('data-key', fav.key);
        
        trackItem.innerHTML = `
            <div class="track-info">
                <div class="track-title">${fav.title}</div>
                <div class="track-artist">${fav.artist}</div>
                <div class="track-date">${formatDate(fav.timestamp)}</div>
                <div class="${fav.hasPreview ? 'has-preview' : 'no-preview'}">
                    ${fav.hasPreview ? '30-second preview available' : 'No preview available'}
                </div>
            </div>
            <div class="track-actions">
                <button class="icon-btn play-btn" 
                        data-track-index="${index}" 
                        ${!fav.hasPreview ? 'disabled' : ''}>
                    ▶
                </button>
                <button class="icon-btn spotify-btn" data-spotify="${spotifyUrl}" title="Listen on Spotify">🎵</button>
                <button class="icon-btn favorite-btn active" data-key="${fav.key}">♥</button>
            </div>
        `;
        
        favoritesList.appendChild(trackItem);
    });

    // Initialize event listeners for the new elements
    initializeFavoriteButtons();
    initializePlayButtons();
    initializeSpotifyButtons();
    
    checkEmptyState();
    
    // Animate items in sequence
    animateFavoritesIn();
}

function generateSpotifyUrl(trackTitle, artistName) {
    // Create a Spotify search URL that will open the app or web player
    const query = encodeURIComponent(`${trackTitle} ${artistName}`);
    return `https://open.spotify.com/search/${query}`;
}

function initializeFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const trackKey = this.getAttribute('data-key');
            const trackItem = this.closest('.track-item');
            
            console.log('Removing favorite:', trackKey);
            
            // Animate removal
            if (typeof gsap !== 'undefined') {
                gsap.to(trackItem, {
                    opacity: 0,
                    x: -100,
                    duration: 0.3,
                    onComplete: () => {
                        removeFavorite(trackKey, trackItem);
                    }
                });
            } else {
                // Fallback if GSAP not available
                removeFavorite(trackKey, trackItem);
            }
        });
    });
}

function removeFavorite(trackKey, trackItem) {
    // Remove from localStorage
    localStorage.removeItem(trackKey);
    // Remove from DOM
    trackItem.remove();
    // Check if list is now empty
    checkEmptyState();
}

function initializePlayButtons() {
    // Only initialize play buttons that are NOT disabled
    const playButtons = document.querySelectorAll('.play-btn:not(:disabled)');
    
    playButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const trackIndex = this.getAttribute('data-track-index');
            console.log('Play button clicked for track:', trackIndex);
            
            playDemoAudio(this, trackIndex);
        });
    });
}

function initializeSpotifyButtons() {
    const spotifyButtons = document.querySelectorAll('.spotify-btn');
    
    spotifyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const spotifyUrl = this.getAttribute('data-spotify');
            console.log('Opening Spotify:', spotifyUrl);
            
            if (spotifyUrl) {
                window.open(spotifyUrl, '_blank');
            }
        });
    });
}

function playDemoAudio(button, trackIndex) {
    // If this button is already playing, stop it
    if (currentlyPlaying === button && currentAudio) {
        currentAudio.pause();
        button.textContent = '▶';
        button.classList.remove('playing');
        currentlyPlaying = null;
        currentAudio = null;
        return;
    }

    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        if (currentlyPlaying) {
            currentlyPlaying.textContent = '▶';
            currentlyPlaying.classList.remove('playing');
        }
    }

    // Generate different beep sounds based on track index
    const frequencies = [440, 523.25, 659.25, 783.99]; // A, C, E, G notes
    const frequency = frequencies[trackIndex % frequencies.length];
    
    try {
        // Use Web Audio API for guaranteed audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1; // Low volume
        
        // Start playing
        oscillator.start();
        currentAudio = { oscillator, gainNode, audioContext };
        currentlyPlaying = button;
        
        button.textContent = '⏸';
        button.classList.add('playing');
        
        // Stop after 1.5 seconds (demo preview)
        setTimeout(() => {
            if (currentAudio && currentAudio.oscillator) {
                currentAudio.oscillator.stop();
            }
            button.textContent = '▶';
            button.classList.remove('playing');
            currentlyPlaying = null;
            currentAudio = null;
        }, 1500);
        
    } catch (error) {
        console.error('Audio error:', error);
        // Fallback: just show visual feedback
        button.textContent = '🔊';
        button.classList.add('playing');
        setTimeout(() => {
            button.textContent = '▶';
            button.classList.remove('playing');
        }, 500);
    }
}

function animateFavoritesIn() {
    const trackItems = document.querySelectorAll('.track-item');
    
    if (typeof gsap !== 'undefined') {
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
    } else {
        // Fallback if GSAP not available
        trackItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(50px)';
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
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
    const trackItems = favoritesList ? favoritesList.querySelectorAll('.track-item') : [];
    
    if (!favoritesList || !emptyState) return;
    
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
    const emptyState = document.getElementById('empty-state');
    
    if (loading) loading.style.display = 'block';
    if (favoritesList) favoritesList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
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