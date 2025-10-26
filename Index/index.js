// Home page specific JavaScript with Spotify API
document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
});

async function initializeHomePage() {
    setupSearch();
    setupGenres();
    setupAnimations();
    await loadPopularArtists();
}

function setupSearch() {
    const searchButton = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-input');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });
        
        searchInput.addEventListener('input', function() {
            const isValid = this.value.trim().length > 0;
            this.style.borderColor = isValid ? '' : 'var(--error)';
            searchButton.disabled = !isValid;
        });
    }
}

function setupGenres() {
    const genrePills = document.querySelectorAll('.genre-pill');
    
    genrePills.forEach(pill => {
        pill.addEventListener('click', function() {
            const genre = this.textContent;
            handleGenreSelection(genre);
        });
    });
}

function setupAnimations() {
    if (typeof VibeCheckAnimations !== 'undefined') {
        VibeCheckAnimations.initHomePageAnimations();
        VibeCheckAnimations.initInteractiveAnimations();
    }
}

async function handleSearch() {
    const query = document.querySelector('.search-input').value.trim();
    if (!query) {
        showError('Please enter an artist name');
        return;
    }

    showLoading();
    hideError();

    try {
        const data = await spotifyAPI.searchArtists(query);
        displayArtistResults(data.artists.items);
    } catch (error) {
        console.error('Search error:', error);
        showError('Error searching for artists. Please try again.');
    } finally {
        hideLoading();
    }
}

async function handleGenreSelection(genre) {
    showLoading();
    hideError();

    try {
        const data = await spotifyAPI.searchByGenre(genre);
        
        if (data.tracks?.items) {
            // Extract unique artists from tracks and get their full details
            const artistIds = extractArtistIdsFromTracks(data.tracks.items);
            if (artistIds.length > 0) {
                await displayArtistsFromIds(artistIds, genre);
            } else {
                throw new Error('No artists found in tracks');
            }
        } else {
            throw new Error('No tracks in genre response');
        }
        
    } catch (error) {
        console.error('Genre search error:', error);
        showError(`No ${genre} music found. Please try another genre.`);
        showDemoGenreResults(genre);
    } finally {
        hideLoading();
    }
}

function extractArtistIdsFromTracks(tracks) {
    const artistIds = new Set();
    
    tracks.forEach(track => {
        track.artists?.forEach(artist => {
            if (artist.id) {
                artistIds.add(artist.id);
            }
        });
    });
    
    return Array.from(artistIds).slice(0, 6); // Limit to 6 artists
}

async function displayArtistsFromIds(artistIds, genre) {
    try {
        const data = await spotifyAPI.getSeveralArtists(artistIds);
        
        if (data.artists && data.artists.length > 0) {
            displayArtistResults(data.artists, genre);
        } else {
            throw new Error('No artist details returned');
        }
    } catch (error) {
        console.error('Error loading artist details:', error);
        // Fallback to showing tracks if artist details fail
        throw error;
    }
}

function displayArtistResults(artists, genre = null) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!artists || artists.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No artists found. Try a different search.</p>';
        return;
    }

    resultsContainer.innerHTML = '';

    if (genre) {
        const genreTitle = document.createElement('h3');
        genreTitle.className = 'section-title';
        genreTitle.textContent = `Popular ${genre} Artists`;
        resultsContainer.appendChild(genreTitle);
    }

    artists.forEach(artist => {
        const artistCard = createArtistCard(artist, genre || artist.genres?.[0] || 'Music');
        resultsContainer.appendChild(artistCard);
    });

    if (typeof VibeCheckAnimations !== 'undefined') {
        VibeCheckAnimations.initInteractiveAnimations();
    }
}

function createArtistCard(artist, genre) {
    const artistCard = document.createElement('div');
    artistCard.className = 'artist-card card';
    
    const imageUrl = artist.images?.[0]?.url || 'https://via.placeholder.com/200';
    
    artistCard.innerHTML = `
        <img src="${imageUrl}" alt="${artist.name}" class="artist-image">
        <div class="artist-name">${artist.name}</div>
        <div class="artist-genre">${genre}</div>
    `;
    
    artistCard.addEventListener('click', function() {
        navigateToArtist(artist.id, artist.name);
    });
    
    return artistCard;
}

function navigateToArtist(artistId, artistName) {
    // window.location.href = `Artist/artist.html?artistId=${artistId}&artistName=${encodeURIComponent(artistName)}`;
    const artistPageUrl = `Artist/artist.html?artistId=${artistId}&artistName=${encodeURIComponent(artistName)}`;
    console.log('Navigating to:', artistPageUrl); // Debug log
    window.location.href = artistPageUrl;
}

function showDemoGenreResults(genre) {
    const resultsContainer = document.getElementById('search-results');
    const demoArtists = getDemoArtistsByGenre(genre);
    
    let html = `<h3 class="section-title">Popular ${genre} Artists</h3>`;
    
    demoArtists.forEach(artist => {
        html += `
            <div class="artist-card card">
                <img src="${artist.image}" alt="${artist.name}" class="artist-image">
                <div class="artist-name">${artist.name}</div>
                <div class="artist-genre">${genre}</div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
    
    document.querySelectorAll('.artist-card').forEach(card => {
        card.addEventListener('click', function() {
            const artistName = this.querySelector('.artist-name').textContent;
            const artistId = this.getAttribute('data-artist-id') || 'demo';
            navigateToArtist(artistId, artistName);
        });
    });
}

function getDemoArtistsByGenre(genre) {
    const demoArtists = {
        'R&B': [
            { id: '2h93pZq0e7k5yf4dywlkpM', name: 'Frank Ocean', image: 'https://via.placeholder.com/200' },
            { id: '7tDP9SpanWMLwU6Dhrc20R', name: 'SZA', image: 'https://via.placeholder.com/200' },
            { id: '20qyvvg5r7rR5TZPwbi9N0', name: 'Daniel Caesar', image: 'https://via.placeholder.com/200' }
        ],
        'Jazz': [
            { id: '0kbYTNQb4Pb1rPbbaF0pT4', name: 'Miles Davis', image: 'https://via.placeholder.com/200' },
            { id: '2d1Dl0nqz8TzMAc1pXV5ww', name: 'John Coltrane', image: 'https://via.placeholder.com/200' },
            { id: '5rM4q5mrOaD5x1d5q8xmyw', name: 'Ella Fitzgerald', image: 'https://via.placeholder.com/200' }
        ],
        'Hip-hop': [
            { id: '2YZyLoL8N0Wb9xBt1NhZWg', name: 'Kendrick Lamar', image: 'https://via.placeholder.com/200' },
            { id: '3TVXtAsR1Inumwj472S9r4', name: 'Drake', image: 'https://via.placeholder.com/200' },
            { id: '6O4EGCCb6DoIiR6B1QCQgp', name: 'J. Cole', image: 'https://via.placeholder.com/200' }
        ],
        'Pop': [
            { id: '06HL4z0CvFAxyc27GXpf02', name: 'Taylor Swift', image: 'https://via.placeholder.com/200' },
            { id: '66CXWjxzNUsdJxJ2JdwvnR', name: 'Ariana Grande', image: 'https://via.placeholder.com/200' },
            { id: '6eUKZXaKkcviH0Ku9w2n3V', name: 'Ed Sheeran', image: 'https://via.placeholder.com/200' }
        ],
        'Rock': [
            { id: '3WrFJ7ztbogyGnTHbHJFl2', name: 'The Beatles', image: 'https://via.placeholder.com/200' },
            { id: '1dfeR4HaWDbWqFHLkxsg1d', name: 'Queen', image: 'https://via.placeholder.com/200' },
            { id: '36QJpDe2go2KgaRleHCDTp', name: 'Led Zeppelin', image: 'https://via.placeholder.com/200' }
        ]
    };
    
    return demoArtists[genre] || [
        { id: 'demo-1', name: `${genre} Artist 1`, image: 'https://via.placeholder.com/200' },
        { id: 'demo-2', name: `${genre} Artist 2`, image: 'https://via.placeholder.com/200' },
        { id: 'demo-3', name: `${genre} Artist 3`, image: 'https://via.placeholder.com/200' }
    ];
}

async function loadPopularArtists() {
    try {
        const popularArtistIds = [
            '2h93pZq0e7k5yf4dywlkpM', // Frank Ocean
            '06HL4z0CvFAxyc27GXpf02', // Taylor Swift
            '3TVXtAsR1Inumwj472S9r4', // Drake
            '0du5cEVh5yTK9QJze8zA0C', // Bruno Mars
            '1uNFoZAHBGtllmzznpCI3s'  // Justin Bieber
        ];

        const data = await spotifyAPI.getSeveralArtists(popularArtistIds);
        displayArtistResults(data.artists);
    } catch (error) {
        console.log('Using demo popular artists');
        const demoArtists = [
            { id: '1', name: 'Kendrick Lamar', images: [{url: 'https://via.placeholder.com/200'}], genres: ['Hip-Hop'] },
            { id: '2', name: 'Taylor Swift', images: [{url: 'https://via.placeholder.com/200'}], genres: ['Pop'] },
            { id: '3', name: 'Daft Punk', images: [{url: 'https://via.placeholder.com/200'}], genres: ['Electronic'] }
        ];
        displayArtistResults(demoArtists);
    }
}

function showLoading() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('search-results');
    if (loading) loading.style.display = 'block';
    if (results) results.style.display = 'none';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('search-results');
    if (loading) loading.style.display = 'none';
    if (results) results.style.display = 'grid';
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}