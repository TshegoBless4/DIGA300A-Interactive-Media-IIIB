// Artist page specific JavaScript with Spotify API
document.addEventListener('DOMContentLoaded', function() {
    console.log('Artist page loaded'); // Debug log
    initializeArtistPage();
});

async function initializeArtistPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('artistId');
    const artistName = urlParams.get('artistName');
    
    console.log('URL Parameters:', { artistId, artistName }); // Debug log

    if (artistId && artistId !== 'demo') {
        console.log('Loading artist by ID:', artistId);
        await loadArtistData(artistId);
    } else if (artistName) {
        console.log('Searching artist by name:', artistName);
        // Fallback: search by name if no ID provided or if it's demo
        await searchArtistByName(artistName);
    } else {
        console.log('No artist specified, showing default state');
        // No artist specified, show default state
        showDefaultState();
    }

    // Initialize animations
    if (typeof VibeCheckAnimations !== 'undefined') {
        VibeCheckAnimations.initArtistAnimations();
    }
}

async function loadArtistData(artistId) {
    console.log('Loading artist data for ID:', artistId);
    showLoading();
    hideError();

    try {
        const [artistData, topTracks] = await Promise.all([
            spotifyAPI.getArtist(artistId),
            spotifyAPI.getArtistTopTracks(artistId)
        ]);

        console.log('Artist data loaded:', artistData);
        console.log('Top tracks loaded:', topTracks);

        updateArtistUI(artistData);
        displayTopTracks(topTracks.tracks);
        
    } catch (error) {
        console.error('Error loading artist data:', error);
        showError('Error loading artist information. Please try again.');
        // Try to get artist name from URL as fallback
        const urlParams = new URLSearchParams(window.location.search);
        const artistName = urlParams.get('artistName');
        if (artistName) {
            handleDemoArtist(artistName);
        }
    } finally {
        hideLoading();
    }
}

async function searchArtistByName(artistName) {
    showLoading();
    hideError();

    try {
        const searchData = await spotifyAPI.searchArtists(artistName);
        console.log('Search results:', searchData); // Debug log
        
        if (searchData.artists && searchData.artists.items.length > 0) {
            const artist = searchData.artists.items[0];
            console.log('Found artist:', artist.name, 'ID:', artist.id);
            await loadArtistData(artist.id);
        } else {
            console.log('No artist found, showing demo data');
            handleDemoArtist(artistName);
        }
    } catch (error) {
        console.error('Error searching artist:', error);
        console.log('Search failed, showing demo data');
        handleDemoArtist(artistName);
    }
}

function handleDemoArtist(artistName) {
    console.log('Handling demo artist:', artistName);
    // For demo artists, just show the name and some placeholder tracks
    document.getElementById('artist-name').textContent = artistName;
    document.getElementById('monthly-listeners').textContent = 'Demo Artist';
    document.getElementById('artist-genre').textContent = 'Music';
    
    // Show some placeholder tracks
    const tracksContainer = document.getElementById('artist-tracks');
    tracksContainer.innerHTML = `
        <div class="track-item">
            <div class="track-number">1</div>
            <div class="track-info">
                <div class="track-title">Popular Track 1</div>
            </div>
            <div class="track-actions">
                <button class="icon-btn play-btn">▶</button>
                <button class="icon-btn favorite-btn">♥</button>
            </div>
        </div>
        <div class="track-item">
            <div class="track-number">2</div>
            <div class="track-info">
                <div class="track-title">Popular Track 2</div>
            </div>
            <div class="track-actions">
                <button class="icon-btn play-btn">▶</button>
                <button class="icon-btn favorite-btn">♥</button>
            </div>
        </div>
        <div class="track-item">
            <div class="track-number">3</div>
            <div class="track-info">
                <div class="track-title">Popular Track 3</div>
            </div>
            <div class="track-actions">
                <button class="icon-btn play-btn">▶</button>
                <button class="icon-btn favorite-btn">♥</button>
            </div>
        </div>
    `;
    
    hideLoading();
}

function showDefaultState() {
    // Show the default content without API data
    document.getElementById('artist-content').style.display = 'block';
    hideLoading();
}

function updateArtistUI(artistData) {
    document.getElementById('artist-name').textContent = artistData.name;
    
    const artistImg = document.getElementById('artist-img');
    if (artistData.images && artistData.images.length > 0) {
        artistImg.src = artistData.images[0].url;
    } else {
        artistImg.src = 'https://via.placeholder.com/300';
    }
    artistImg.alt = artistData.name;
    
    document.getElementById('monthly-listeners').textContent = 
        `${formatNumber(artistData.followers.total)} Followers`;
    
    if (artistData.genres && artistData.genres.length > 0) {
        const primaryGenre = artistData.genres[0];
        document.getElementById('artist-genre').textContent = 
            primaryGenre.charAt(0).toUpperCase() + primaryGenre.slice(1);
    } else {
        document.getElementById('artist-genre').textContent = 'Various Genres';
    }
}

function displayTopTracks(tracks) {
    const tracksContainer = document.getElementById('artist-tracks');
    
    if (!tracks || tracks.length === 0) {
        tracksContainer.innerHTML = '<p class="no-tracks">No tracks available for this artist.</p>';
        return;
    }

    tracksContainer.innerHTML = '';

    tracks.forEach((track, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        trackItem.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
                <div class="track-title">${track.name}</div>
                <div class="track-album">${track.album?.name || ''}</div>
            </div>
            <div class="track-actions">
                <button class="icon-btn play-btn" data-preview="${track.preview_url || ''}">▶</button>
                <button class="icon-btn favorite-btn">♥</button>
            </div>
        `;
        
        tracksContainer.appendChild(trackItem);
    });

    // Re-initialize play buttons for new tracks
    initializePlayButtons();
    initializeFavoriteButtons();
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
            }
        });
    });
}

function initializeFavoriteButtons() {
    const favButtons = document.querySelectorAll('.favorite-btn');
    
    favButtons.forEach(btn => {
        // Load saved state from localStorage
        const trackElement = btn.closest('.track-item');
        const trackTitle = trackElement.querySelector('.track-title').textContent;
        const artistName = document.getElementById('artist-name').textContent;
        const trackKey = `fav_${artistName}_${trackTitle}`;
        
        // Check if already favorited
        if (localStorage.getItem(trackKey)) {
            btn.style.color = 'var(--primary)'; // Filled heart
            btn.setAttribute('data-favorited', 'true');
        } else {
            btn.style.color = ''; // Empty heart
            btn.setAttribute('data-favorited', 'false');
        }
        
        btn.addEventListener('click', function() {
            const isFavorited = this.getAttribute('data-favorited') === 'true';
            
            if (isFavorited) {
                // Remove from favorites
                localStorage.removeItem(trackKey);
                this.style.color = '';
                this.setAttribute('data-favorited', 'false');
                console.log('Removed from favorites:', trackTitle);
            } else {
                // Add to favorites
                const trackData = {
                    title: trackTitle,
                    artist: artistName,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(trackKey, JSON.stringify(trackData));
                this.style.color = 'var(--primary)';
                this.setAttribute('data-favorited', 'true');
                console.log('Added to favorites:', trackTitle);
            }
        });
    });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showLoading() {
    const loading = document.getElementById('loading');
    const content = document.getElementById('artist-content');
    if (loading) loading.style.display = 'block';
    if (content) content.style.display = 'none';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    const content = document.getElementById('artist-content');
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    document.getElementById('artist-content').style.display = 'none';
}

function hideError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Add global error handler for uncaught errors
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});