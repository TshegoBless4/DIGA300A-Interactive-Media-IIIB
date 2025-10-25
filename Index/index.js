// Home page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    setupSearch();
    setupGenres();
    loadArtists();
}

function setupSearch() {
    const searchBtn = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-input');
    
    searchBtn.addEventListener('click', searchArtists);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchArtists();
    });
}

function setupGenres() {
    document.querySelectorAll('.genre-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            searchByGenre(pill.textContent);
        });
    });
}

async function searchArtists() {
    const query = document.querySelector('.search-input').value.trim();
    if (!query) return;
    
    showLoading();
    
    try {
        const data = await spotifyAPI.searchArtists(query);
        showArtistResults(data.artists.items);
    } catch (error) {
        showError('Search failed. Check Spotify API setup.');
    }
    
    hideLoading();
}

async function searchByGenre(genre) {
    showLoading();
    
    try {
        const data = await spotifyAPI.searchByGenre(genre);
        showGenreResults(data.tracks.items, genre);
    } catch (error) {
        showError(`Could not load ${genre} music`);
    }
    
    hideLoading();
}

function showArtistResults(artists) {
    const container = document.getElementById('search-results');
    
    if (!artists || artists.length === 0) {
        container.innerHTML = '<p>No artists found</p>';
        return;
    }
    
    let html = '';
    
    artists.forEach(artist => {
        const image = artist.images?.[0]?.url || 'https://via.placeholder.com/200';
        const genre = artist.genres?.[0] || 'Music';
        
        html += `
            <div class="artist-card card" data-id="${artist.id}" data-name="${artist.name}">
                <img src="${image}" alt="${artist.name}" class="artist-image">
                <div class="artist-name">${artist.name}</div>
                <div class="artist-genre">${genre}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    setupArtistClicks();
}

function showGenreResults(tracks, genre) {
    const container = document.getElementById('search-results');
    
    if (!tracks || tracks.length === 0) {
        container.innerHTML = `<p>No ${genre} music found</p>`;
        return;
    }
    
    // Get unique artist IDs from tracks
    const artistIds = new Set();
    
    tracks.forEach(track => {
        track.artists?.forEach(artist => {
            if (artist.id) {
                artistIds.add(artist.id);
            }
        });
    });
    
    // Convert to array and take first 6 artists
    const uniqueArtistIds = Array.from(artistIds).slice(0, 6);
    
    if (uniqueArtistIds.length === 0) {
        container.innerHTML = `<p>No artists found for ${genre}</p>`;
        return;
    }
    
    // Show loading for genre results
    container.innerHTML = `<p>Loading ${genre} artists...</p>`;
    
    // Fetch full artist details with images
    loadArtistsByIds(uniqueArtistIds, genre);
}

async function loadArtistsByIds(artistIds, genre) {
    try {
        const data = await spotifyAPI.getSeveralArtists(artistIds);
        
        if (data.artists && data.artists.length > 0) {
            showArtistResultsFromGenre(data.artists, genre);
        } else {
            throw new Error('No artist details found');
        }
        
    } catch (error) {
        console.error('Error loading artist details:', error);
        // Fallback: show artists without images
        showFallbackGenreResults(artistIds, genre);
    }
}

function showArtistResultsFromGenre(artists, genre) {
    const container = document.getElementById('search-results');
    
    let html = `<h3>Popular ${genre} Artists</h3>`;
    
    artists.forEach(artist => {
        const image = artist.images?.[0]?.url || 'https://via.placeholder.com/200';
        const artistGenre = artist.genres?.[0] || genre;
        
        html += `
            <div class="artist-card card" data-id="${artist.id}" data-name="${artist.name}">
                <img src="${image}" alt="${artist.name}" class="artist-image">
                <div class="artist-name">${artist.name}</div>
                <div class="artist-genre">${artistGenre}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    setupArtistClicks();
}

function showFallbackGenreResults(artistIds, genre) {
    const container = document.getElementById('search-results');
    
    let html = `<h3>Popular ${genre} Artists</h3>`;
    
    // Create simple artist cards without images
    html += `
        <div class="artist-card card" data-id="jazz-1" data-name="Miles Davis">
            <img src="https://via.placeholder.com/200" alt="Miles Davis" class="artist-image">
            <div class="artist-name">Miles Davis</div>
            <div class="artist-genre">${genre}</div>
        </div>
        <div class="artist-card card" data-id="jazz-2" data-name="John Coltrane">
            <img src="https://via.placeholder.com/200" alt="John Coltrane" class="artist-image">
            <div class="artist-name">John Coltrane</div>
            <div class="artist-genre">${genre}</div>
        </div>
        <div class="artist-card card" data-id="jazz-3" data-name="Ella Fitzgerald">
            <img src="https://via.placeholder.com/200" alt="Ella Fitzgerald" class="artist-image">
            <div class="artist-name">Ella Fitzgerald</div>
            <div class="artist-genre">${genre}</div>
        </div>
    `;
    
    container.innerHTML = html;
    setupArtistClicks();
}

function setupArtistClicks() {
    document.querySelectorAll('.artist-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            const name = card.getAttribute('data-name');
            goToArtist(id, name);
        });
    });
}

function goToArtist(id, name) {
    window.location.href = `artist.html?artistId=${id}&artistName=${encodeURIComponent(name)}`;
}

async function loadArtists() {
    try {
        // Load popular artists
        const artistIds = [
            '2h93pZq0e7k5yf4dywlkpM', // Frank Ocean
            '06HL4z0CvFAxyc27GXpf02', // Taylor Swift
            '3TVXtAsR1Inumwj472S9r4', // Drake
            '0du5cEVh5yTK9QJze8zA0C', // Bruno Mars
            '1uNFoZAHBGtllmzznpCI3s'  // Justin Bieber
        ];
        
        const data = await spotifyAPI.getSeveralArtists(artistIds);
        
        if (data.artists && data.artists.length > 0) {
            showArtistResults(data.artists);
        } else {
            throw new Error('No artists returned');
        }
        
    } catch (error) {
        // Fallback to demo data
        const demoArtists = [
            { 
                id: '1', 
                name: 'Kendrick Lamar', 
                images: [{url: 'https://via.placeholder.com/200'}], 
                genres: ['Hip-Hop'] 
            },
            { 
                id: '2', 
                name: 'Taylor Swift', 
                images: [{url: 'https://via.placeholder.com/200'}], 
                genres: ['Pop'] 
            },
            { 
                id: '3', 
                name: 'Daft Punk', 
                images: [{url: 'https://via.placeholder.com/200'}], 
                genres: ['Electronic'] 
            }
        ];
        showArtistResults(demoArtists);
    }
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

function showError(message) {
    const error = document.getElementById('error-message');
    if (error) {
        error.textContent = message;
        error.style.display = 'block';
    }
}