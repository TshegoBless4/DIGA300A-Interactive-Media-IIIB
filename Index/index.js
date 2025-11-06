// Home page specific JavaScript with Spotify API
document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
});

let currentGenre = null;
let currentOffset = 0;
const ARTISTS_PER_PAGE = 6;

async function initializeHomePage() {
    setupSearch();
    setupGenres();
    setupAnimations();
    setupNextButton();
    await loadPopularArtists();
}

function setupNextButton() {
    const nextButtonContainer = document.createElement('div');
    nextButtonContainer.className = 'next-button-container';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-primary next-button';
    nextButton.textContent = 'Next';
    nextButton.style.display = 'none';
    nextButton.addEventListener('click', loadNextGenreArtists);
    
    nextButtonContainer.appendChild(nextButton);
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.parentNode.insertBefore(nextButtonContainer, resultsContainer.nextSibling);
}

async function loadPopularArtists() {
    try {
        const popularArtistIds = await getRandomPopularArtists();
        const data = await spotifyAPI.getSeveralArtists(popularArtistIds);
        displayArtistResults(data.artists, 'Popular');
        hideNextButton(); // Hide next button for popular artists
        resetGenrePills(); // Reset genre pills when showing popular artists
    } catch (error) {
        console.log('Using demo popular artists');
        const demoArtists = [
            { id: '1', name: 'Kendrick Lamar', images: [{url: 'https://via.placeholder.com/200'}], genres: ['Hip-Hop'] },
            { id: '2', name: 'Taylor Swift', images: [{url: 'https://via.placeholder.com/200'}], genres: ['Pop'] },
            { id: '3', name: 'Daft Punk', images: [{url: 'https://via.placeholder.com/200'}], genres: ['Electronic'] },
            { id: '4', name: 'Frank Ocean', images: [{url: 'https://via.placeholder.com/200'}], genres: ['R&B'] },
            { id: '5', name: 'The Weeknd', images: [{url: 'https://via.placeholder.com/200'}], genres: ['Pop'] },
            { id: '6', name: 'Beyoncé', images: [{url: 'https://via.placeholder.com/200'}], genres: ['R&B'] }
        ];
        displayArtistResults(demoArtists, 'Popular Artists');
        hideNextButton();
        resetGenrePills();
    }
}

async function getRandomPopularArtists() {
    const popularArtistIds = [
        '2h93pZq0e7k5yf4dywlkpM', // Frank Ocean
        '06HL4z0CvFAxyc27GXpf02', // Taylor Swift
        '3TVXtAsR1Inumwj472S9r4', // Drake
        '0du5cEVh5yTK9QJze8zA0C', // Bruno Mars
        '1uNFoZAHBGtllmzznpCI3s', // Justin Bieber
        '1Xyo4u8uXC1ZmMpatF05PJ', // The Weeknd
        '6eUKZXaKkcviH0Ku9w2n3V', // Ed Sheeran
        '66CXWjxzNUsdJxJ2JdwvnR', // Ariana Grande
        '4q3ewBCX7sLwd24euuV69X', // Bad Bunny
        '5K4W6rqBFWDnAN6FQUkS6x', // Kanye West
        '7dGJo4pcD2V6oG8kP0tJRR', // Eminem
        '3Nrfpe0tUJi4K4DXYWgMUX', // BTS
        '1HY2Jd0NmPuamShAr6KMms', // Lady Gaga
        '0C8ZW7ezQVs4URX5aX7Kqx', // Selena Gomez
        '6qqNVTkY8uBg9cP3Jd7DAH', // Billie Eilish
        '4dpARuHxo51G3z768sgnrY', // Adele
        '1McMsnEElThX1knmY4oliG', // Olivia Rodrigo
        '6jJ0s89eD6GaHleKKya26X', // Katy Perry
        '53XhwfbYqKCa1cC15pYq2q', // Imagine Dragons
        '7n2wHs1TKAczGzO7Dd2rGr'  // Shawn Mendes
    ];
    
    const shuffled = [...popularArtistIds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, ARTISTS_PER_PAGE);
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

async function handleGenreSelection(genre) {
    showLoading();
    hideError();
    
    currentGenre = genre;
    currentOffset = 0; // Reset offset for new genre
    
    // Set active state on genre pill
    setActiveGenrePill(genre);
    
    try {
        const data = await spotifyAPI.searchByGenre(genre);
        
        if (data.tracks?.items) {
            const artistIds = extractArtistIdsFromTracks(data.tracks.items);
            if (artistIds.length > 0) {
                await displayArtistsFromIds(artistIds, genre);
                showNextButton(); // Show next button for genre exploration
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
        showNextButton(); // Still show next button for demo data
    } finally {
        hideLoading();
    }
}

// NEW: Function to set active state on genre pill
function setActiveGenrePill(genre) {
    const genrePills = document.querySelectorAll('.genre-pill');
    
    genrePills.forEach(pill => {
        if (pill.textContent === genre) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
}

// NEW: Function to reset all genre pills (remove active state)
function resetGenrePills() {
    const genrePills = document.querySelectorAll('.genre-pill');
    genrePills.forEach(pill => {
        pill.classList.remove('active');
    });
    currentGenre = null;
}

async function loadNextGenreArtists() {
    if (!currentGenre) return;
    
    showLoading();
    hideError();
    
    try {
        // Use offset to get different results (Spotify search doesn't support offset well for genre search)
        // So we'll use a different approach - search with random terms related to the genre
        const randomTerms = getRandomSearchTerms(currentGenre);
        const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];
        
        const searchQuery = `genre:${currentGenre} ${randomTerm}`;
        const data = await spotifyAPI.searchArtists(searchQuery);
        
        if (data.artists?.items && data.artists.items.length > 0) {
            displayArtistResults(data.artists.items, currentGenre);
        } else {
            // Fallback to regular genre search
            const genreData = await spotifyAPI.searchByGenre(currentGenre);
            const artistIds = extractArtistIdsFromTracks(genreData.tracks.items);
            if (artistIds.length > 0) {
                await displayArtistsFromIds(artistIds, currentGenre);
            } else {
                throw new Error('No artists found');
            }
        }
        
    } catch (error) {
        console.error('Next genre artists error:', error);
        showDemoGenreResults(currentGenre); // Show different demo artists
    } finally {
        hideLoading();
    }
}

function getRandomSearchTerms(genre) {
    const searchTerms = {
        'R&B': ['soul', 'neo soul', 'contemporary', '90s', 'modern'],
        'Jazz': ['bebop', 'fusion', 'smooth', 'contemporary', 'traditional'],
        'Hip-hop': ['rap', 'trap', 'boom bap', 'conscious', 'underground'],
        'Pop': ['indie', 'electropop', 'synthpop', 'dance', 'mainstream'],
        'Rock': ['alternative', 'indie', 'classic', 'hard', 'progressive']
    };
    
    return searchTerms[genre] || ['new', 'popular', 'latest', 'rising'];
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
    
    return Array.from(artistIds).slice(0, ARTISTS_PER_PAGE);
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
        genreTitle.textContent = `${genre} Artists`;
        resultsContainer.appendChild(genreTitle);
    }

    // Only shuffle for genre exploration, not for search results
    const artistsToDisplay = genre ? [...artists].sort(() => 0.5 - Math.random()) : artists;
    
    artistsToDisplay.forEach(artist => {
        const displayGenre = genre || artist.genres?.[0] || 'Music';
        const artistCard = createArtistCard(artist, displayGenre);
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
    const artistPageUrl = `Artist/artist.html?artistId=${artistId}&artistName=${encodeURIComponent(artistName)}`;
    console.log('Navigating to:', artistPageUrl);
    window.location.href = artistPageUrl;
}

async function handleSearch() {
    const query = document.querySelector('.search-input').value.trim();
    if (!query) {
        showError('Please enter an artist name');
        return;
    }

    showLoading();
    hideError();
    hideNextButton(); // Hide next button for text search
    resetGenrePills(); // Reset genre pills when doing text search

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

function showDemoGenreResults(genre) {
    const resultsContainer = document.getElementById('search-results');
    const demoArtists = getDemoArtistsByGenre(genre);
    
    let html = `<h3 class="section-title">${genre} Artists</h3>`;
    
    demoArtists.forEach(artist => {
        html += `
            <div class="artist-card card" data-artist-id="${artist.id}">
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
            const artistId = this.getAttribute('data-artist-id');
            navigateToArtist(artistId, artistName);
        });
    });
}

function getDemoArtistsByGenre(genre) {
    const demoArtists = {
        'R&B': [
            { id: '2h93pZq0e7k5yf4dywlkpM', name: 'Frank Ocean', image: 'https://via.placeholder.com/200' },
            { id: '7tDP9SpanWMLwU6Dhrc20R', name: 'SZA', image: 'https://via.placeholder.com/200' },
            { id: '20qyvvg5r7rR5TZPwbi9N0', name: 'Daniel Caesar', image: 'https://via.placeholder.com/200' },
            { id: '5K4W6rqBFWDnAN6FQUkS6x', name: 'Kanye West', image: 'https://via.placeholder.com/200' },
            { id: '1Xyo4u8uXC1ZmMpatF05PJ', name: 'The Weeknd', image: 'https://via.placeholder.com/200' },
            { id: '6M2wZ9GZgrQXHCFfjv46we', name: 'Dua Lipa', image: 'https://via.placeholder.com/200' }
        ],
        'Jazz': [
            { id: '0kbYTNQb4Pb1rPbbaF0pT4', name: 'Miles Davis', image: 'https://via.placeholder.com/200' },
            { id: '2d1Dl0nqz8TzMAc1pXV5ww', name: 'John Coltrane', image: 'https://via.placeholder.com/200' },
            { id: '5rM4q5mrOaD5x1d5q8xmyw', name: 'Ella Fitzgerald', image: 'https://via.placeholder.com/200' },
            { id: '4Z8W4fKeB5YxbusRsdQVPb', name: 'Radiohead', image: 'https://via.placeholder.com/200' },
            { id: '4pejUc4iciQfgdX6OKulQn', name: 'Queens of the Stone Age', image: 'https://via.placeholder.com/200' },
            { id: '3WrFJ7ztbogyGnTHbHJFl2', name: 'The Beatles', image: 'https://via.placeholder.com/200' }
        ],
        'Hip-hop': [
            { id: '2YZyLoL8N0Wb9xBt1NhZWg', name: 'Kendrick Lamar', image: 'https://via.placeholder.com/200' },
            { id: '3TVXtAsR1Inumwj472S9r4', name: 'Drake', image: 'https://via.placeholder.com/200' },
            { id: '6O4EGCCb6DoIiR6B1QCQgp', name: 'J. Cole', image: 'https://via.placeholder.com/200' },
            { id: '7dGJo4pcD2V6oG8kP0tJRR', name: 'Eminem', image: 'https://via.placeholder.com/200' },
            { id: '4q3ewBCX7sLwd24euuV69X', name: 'Bad Bunny', image: 'https://via.placeholder.com/200' },
            { id: '1RyvyyTE3xzB2ZywiAwp0i', name: 'Future', image: 'https://via.placeholder.com/200' }
        ],
        'Pop': [
            { id: '06HL4z0CvFAxyc27GXpf02', name: 'Taylor Swift', image: 'https://via.placeholder.com/200' },
            { id: '66CXWjxzNUsdJxJ2JdwvnR', name: 'Ariana Grande', image: 'https://via.placeholder.com/200' },
            { id: '6eUKZXaKkcviH0Ku9w2n3V', name: 'Ed Sheeran', image: 'https://via.placeholder.com/200' },
            { id: '1uNFoZAHBGtllmzznpCI3s', name: 'Justin Bieber', image: 'https://via.placeholder.com/200' },
            { id: '4q3ewBCX7sLwd24euuV69X', name: 'Bad Bunny', image: 'https://via.placeholder.com/200' },
            { id: '6jJ0s89eD6GaHleKKya26X', name: 'Katy Perry', image: 'https://via.placeholder.com/200' }
        ],
        'Rock': [
            { id: '3WrFJ7ztbogyGnTHbHJFl2', name: 'The Beatles', image: 'https://via.placeholder.com/200' },
            { id: '1dfeR4HaWDbWqFHLkxsg1d', name: 'Queen', image: 'https://via.placeholder.com/200' },
            { id: '36QJpDe2go2KgaRleHCDTp', name: 'Led Zeppelin', image: 'https://via.placeholder.com/200' },
            { id: '4pejUc4iciQfgdX6OKulQn', name: 'Queens of the Stone Age', image: 'https://via.placeholder.com/200' },
            { id: '4Z8W4fKeB5YxbusRsdQVPb', name: 'Radiohead', image: 'https://via.placeholder.com/200' },
            { id: '2ye2Wgw4gimLv2eAKyk1NB', name: 'Metallica', image: 'https://via.placeholder.com/200' }
        ]
    };
    
    return demoArtists[genre] || [
        { id: 'demo-1', name: `${genre} Artist 1`, image: 'https://via.placeholder.com/200' },
        { id: 'demo-2', name: `${genre} Artist 2`, image: 'https://via.placeholder.com/200' },
        { id: 'demo-3', name: `${genre} Artist 3`, image: 'https://via.placeholder.com/200' },
        { id: 'demo-4', name: `${genre} Artist 4`, image: 'https://via.placeholder.com/200' },
        { id: 'demo-5', name: `${genre} Artist 5`, image: 'https://via.placeholder.com/200' },
        { id: 'demo-6', name: `${genre} Artist 6`, image: 'https://via.placeholder.com/200' }
    ];
}

function showNextButton() {
    const nextButton = document.querySelector('.next-button');
    if (nextButton) {
        nextButton.style.display = 'block';
    }
}

function hideNextButton() {
    const nextButton = document.querySelector('.next-button');
    if (nextButton) {
        nextButton.style.display = 'none';
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