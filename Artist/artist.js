// Artist page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Artist page loaded');
    initializeArtistPage();
});

async function initializeArtistPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('artistId');
    const artistName = urlParams.get('artistName');
    
    console.log('URL Parameters:', { artistId, artistName });
    
    if (typeof VibeCheckAnimations !== 'undefined') {
        VibeCheckAnimations.initArtistAnimations();
    }

    if (artistId && artistId !== 'demo') {
        console.log('Loading artist by ID:', artistId);
        await loadArtistData(artistId);
    } else if (artistName) {
        console.log('Searching artist by name:', artistName);
        await searchArtistByName(artistName);
    } else {
        console.log('No artist specified, showing default state');
        showDefaultState();
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

        console.log('Artist data loaded:', artistData.name);
        console.log('Top tracks loaded:', topTracks.tracks.length, 'tracks');

        updateArtistUI(artistData);
        displayTopTracks(topTracks.tracks);
        
    } catch (error) {
        console.error('Error loading artist data:', error);
        showError('Error loading artist information. Please try again.');
        
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
        handleDemoArtist(artistName);
    }
}

function handleDemoArtist(artistName) {
    document.getElementById('artist-name').textContent = artistName;
    document.getElementById('monthly-listeners').textContent = 'Demo Artist';
    document.getElementById('artist-genre').textContent = 'Music';
    
    const tracksContainer = document.getElementById('artist-tracks');
    tracksContainer.innerHTML = `
        <div class="track-item">
            <div class="track-number">1</div>
            <div class="track-info">
                <div class="track-title">Popular Track 1</div>
                <div class="no-preview">No preview available</div>
            </div>
            <div class="track-actions">
                <button class="icon-btn play-btn" disabled>▶</button>
                <button class="icon-btn favorite-btn">♥</button>
            </div>
        </div>
    `;
    
    hideLoading();
}

function showDefaultState() {
    document.getElementById('artist-content').style.display = 'block';
    hideLoading();
}

function updateArtistUI(artistData) {
    document.getElementById('artist-name').textContent = artistData.name;
    
    const artistImg = document.getElementById('artist-img');
    if (artistData.images && artistData.images.length > 0) {
        artistImg.src = artistData.images[0].url;
        artistImg.alt = artistData.name;
    } else {
        artistImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUQxRDFEIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0Y1RjVGNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        artistImg.alt = 'No artist image available';
    }
    
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
        const hasPreview = !!track.preview_url;
        const spotifyUrl = track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`;
        
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        trackItem.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
                <div class="track-title">${track.name}</div>
                <div class="track-album">${track.album?.name || ''}</div>
                ${hasPreview ? 
                    '<div class="has-preview">30-second preview available</div>' : 
                    '<div class="no-preview">No preview available</div>'
                }
            </div>
            <div class="track-actions">
                ${hasPreview ? 
                    `<button class="icon-btn play-btn" data-preview="${track.preview_url}" title="Play 30-second preview">▶</button>` :
                    `<button class="icon-btn play-btn" disabled title="No preview available">▶</button>`
                }
                <button class="icon-btn spotify-btn" data-spotify="${spotifyUrl}" title="Listen on Spotify">🎵</button>
                <button class="icon-btn favorite-btn" title="Add to favorites">♥</button>
            </div>
        `;
        
        tracksContainer.appendChild(trackItem);
    });

    initializePlayButtons();
    initializeSpotifyButtons();
    initializeFavoriteButtons();
}

// Audio player for previews
let currentAudio = null;
let currentButton = null;

function initializePlayButtons() {
    const playButtons = document.querySelectorAll('.play-btn:not(:disabled)');
    
    console.log(`Initializing ${playButtons.length} play buttons`);
    
    playButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const previewUrl = this.getAttribute('data-preview');
            console.log('Play button clicked, preview URL:', previewUrl);
            
            if (!previewUrl) return;

            // If clicking the same button that's currently playing, pause it
            if (currentAudio && currentButton === this) {
                pauseCurrentAudio();
                return;
            }

            // Stop any currently playing audio
            if (currentAudio) {
                pauseCurrentAudio();
            }

            // Play the Spotify preview
            playSpotifyPreview(previewUrl, this);
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

function playSpotifyPreview(previewUrl, button) {
    try {
        currentAudio = new Audio(previewUrl);
        currentButton = button;
        
        // Show loading state
        button.textContent = '⏳';
        
        currentAudio.addEventListener('canplay', () => {
            console.log('Preview audio can play');
        });
        
        currentAudio.addEventListener('error', (e) => {
            console.error('Preview audio error:', e);
            resetAudioState();
            showError('Preview playback failed. Try the Spotify button instead.');
        });
        
        currentAudio.addEventListener('ended', () => {
            console.log('Preview ended');
            resetAudioState();
        });

        currentAudio.play().then(() => {
            console.log('✅ Spotify preview playing!');
            button.textContent = '⏸';
            button.closest('.track-item').classList.add('playing');
            showNowPlaying(button.closest('.track-item').querySelector('.track-title').textContent);
        }).catch(error => {
            console.error('❌ Preview play failed:', error);
            resetAudioState();
            showError('Could not play preview. Click the Spotify button to listen on Spotify.');
        });
        
    } catch (error) {
        console.error('Unexpected error:', error);
        resetAudioState();
    }
}

function pauseCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        console.log('Audio paused');
    }
    resetAudioState();
}

function resetAudioState() {
    if (currentButton) {
        currentButton.textContent = '▶';
        currentButton.closest('.track-item').classList.remove('playing');
    }
    currentAudio = null;
    currentButton = null;
    hideNowPlaying();
}

function showNowPlaying(trackName) {
    let nowPlaying = document.getElementById('now-playing');
    if (!nowPlaying) {
        nowPlaying = document.createElement('div');
        nowPlaying.id = 'now-playing';
        nowPlaying.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--primary, #6C0BA9);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
        `;
        document.body.appendChild(nowPlaying);
    }
    
    nowPlaying.textContent = `🎵 Now Playing: ${trackName}`;
    nowPlaying.style.display = 'block';
}

function hideNowPlaying() {
    const nowPlaying = document.getElementById('now-playing');
    if (nowPlaying) {
        nowPlaying.style.display = 'none';
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--error, #FF6B6B);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 3000);
}

function initializeFavoriteButtons() {
    const favButtons = document.querySelectorAll('.favorite-btn');
    
    favButtons.forEach(btn => {
        const trackElement = btn.closest('.track-item');
        const trackTitle = trackElement.querySelector('.track-title').textContent;
        const artistName = document.getElementById('artist-name').textContent;
        const trackKey = `fav_${artistName}_${trackTitle}`;
        
        if (localStorage.getItem(trackKey)) {
            btn.style.color = 'var(--primary)';
            btn.setAttribute('data-favorited', 'true');
        } else {
            btn.style.color = '';
            btn.setAttribute('data-favorited', 'false');
        }
        
        btn.addEventListener('click', function() {
            const isFavorited = this.getAttribute('data-favorited') === 'true';
            
            if (isFavorited) {
                localStorage.removeItem(trackKey);
                this.style.color = '';
                this.setAttribute('data-favorited', 'false');
            } else {
                const trackData = {
                    title: trackTitle,
                    artist: artistName,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(trackKey, JSON.stringify(trackData));
                this.style.color = 'var(--primary)';
                this.setAttribute('data-favorited', 'true');
            }
        });
    });
}

// Utility functions
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

function hideError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}