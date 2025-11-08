
document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
});

let currentGenre = null;
let currentOffset = 0;
const ARTISTS_PER_PAGE = 6;

// Navigation history management
let navigationHistory = [];
let currentPageState = null;
let genreHistory = [];

async function initializeHomePage() {
    setupSearch();
    setupGenres();
    setupAnimations();
    setupNavigationButtons();
    setupBackButton();
    setupBrowserBackButton();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fromBack') && navigationHistory.length > 0) {
        const previousState = navigationHistory.pop();
        restoreState(previousState);
    } else {
        await loadPopularArtists();
    }
}

function saveCurrentState() {
    const state = {
        genre: currentGenre,
        offset: currentOffset,
        artists: getCurrentDisplayedArtists(),
        searchTerm: document.querySelector('.search-input')?.value || '',
        page: 'home'
    };
    currentPageState = state;
}

function getCurrentDisplayedArtists() {
    const artistCards = document.querySelectorAll('.artist-card');
    const artists = [];
    
    artistCards.forEach(card => {
        const name = card.querySelector('.artist-name')?.textContent;
        const genre = card.querySelector('.artist-genre')?.textContent;
        const image = card.querySelector('.artist-image')?.src;
        const artistId = card.getAttribute('data-artist-id');
        
        if (name) {
            artists.push({ name, genre, image, id: artistId });
        }
    });
    
    return artists;
}

function pushToHistory(state) {
    navigationHistory.push(JSON.parse(JSON.stringify(state)));
    if (navigationHistory.length > 10) {
        navigationHistory.shift();
    }
}

function setupBackButton() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromBack = urlParams.get('fromBack');
    
    if (fromBack && navigationHistory.length > 0) {
        const previousState = navigationHistory.pop();
        restoreState(previousState);
    }
}

function restoreState(state) {
    if (!state) return;
    
    currentGenre = state.genre;
    currentOffset = state.offset;
    
    const searchInput = document.querySelector('.search-input');
    if (searchInput && state.searchTerm) {
        searchInput.value = state.searchTerm;
    }
    
    if (state.artists && state.artists.length > 0) {
        displayArtistResultsFromState(state.artists, state.genre);
    }
    
    if (state.genre) {
        setActiveGenrePill(state.genre);
        showNextButton();
    } else {
        resetGenrePills();
        hideNextButton();
    }
}

function displayArtistResultsFromState(artists, genre) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (genre && genre !== 'Popular') {
        const genreTitle = document.createElement('h3');
        genreTitle.className = 'section-title';
        genreTitle.textContent = `${genre} Artists`;
        resultsContainer.appendChild(genreTitle);
    }

    artists.forEach(artist => {
        const artistCard = document.createElement('div');
        artistCard.className = 'artist-card card';
        artistCard.setAttribute('data-artist-id', artist.id || '');
        
        const displayGenre = genre || artist.genre || 'Music';
        const imageUrl = artist.image || 'https://via.placeholder.com/200';
        
        artistCard.innerHTML = `
            <img src="${imageUrl}" alt="${artist.name}" class="artist-image">
            <div class="artist-name">${artist.name}</div>
            <div class="artist-genre">${displayGenre}</div>
        `;
        
        artistCard.addEventListener('click', function() {
            saveCurrentState();
            pushToHistory(currentPageState);
            navigateToArtist(artist.id, artist.name);
        });
        
        resultsContainer.appendChild(artistCard);
    });
}

function setupBrowserBackButton() {
    window.addEventListener('popstate', function(event) {
        if (navigationHistory.length > 0) {
            const previousState = navigationHistory.pop();
            restoreState(previousState);
        } else {
            loadPopularArtists();
        }
    });
}

function setupNavigationButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'navigation-buttons-container';
    
    const previousButton = document.createElement('button');
    previousButton.className = 'btn btn-secondary previous-button';
    previousButton.innerHTML = '← Previous';
    previousButton.style.display = 'none';
    previousButton.addEventListener('click', loadPreviousGenreArtists);
    
    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-primary next-button';
    nextButton.textContent = 'Next →';
    nextButton.style.display = 'none';
    nextButton.addEventListener('click', loadNextGenreArtists);
    
    buttonContainer.appendChild(previousButton);
    buttonContainer.appendChild(nextButton);
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.parentNode.insertBefore(buttonContainer, resultsContainer.nextSibling);
}

async function loadPreviousGenreArtists() {
    if (genreHistory.length <= 1) {
        if (currentGenre) {
            await handleGenreSelection(currentGenre);
        }
        return;
    }
    
    genreHistory.pop();
    const previousState = genreHistory[genreHistory.length - 1];
    
    if (previousState) {
        showLoading();
        hideError();
        
        currentGenre = previousState.genre;
        currentOffset = previousState.offset;
        
        setActiveGenrePill(currentGenre);
        
        try {
            const searchQuery = previousState.searchQuery || `genre:${currentGenre}`;
            const data = await spotifyAPI.searchArtists(searchQuery);
            
            if (data.artists?.items && data.artists.items.length > 0) {
                displayArtistResults(data.artists.items, currentGenre);
            } else {
                showError(`No ${currentGenre} artists found. Try another genre.`);
            }
            
            updateNavigationButtons();
            
        } catch (error) {
            console.error('Previous genre artists error:', error);
            showError('Error loading artists. Please try again.');
            updateNavigationButtons();
        } finally {
            hideLoading();
        }
    }
}

async function loadNextGenreArtists() {
    if (!currentGenre) return;
    
    showLoading();
    hideError();
    
    const currentState = {
        genre: currentGenre,
        offset: currentOffset,
        searchQuery: `genre:${currentGenre}`,
        artists: getCurrentDisplayedArtists()
    };
    genreHistory.push(currentState);
    
    try {
        const randomTerms = getRandomSearchTerms(currentGenre);
        const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];
        
        const searchQuery = `genre:${currentGenre} ${randomTerm}`;
        const data = await spotifyAPI.searchArtists(searchQuery);
        
        if (data.artists?.items && data.artists.items.length > 0) {
            displayArtistResults(data.artists.items, currentGenre);
            
            if (genreHistory.length > 0) {
                genreHistory[genreHistory.length - 1].searchQuery = searchQuery;
            }
        } else {
            const genreData = await spotifyAPI.searchByGenre(currentGenre);
            const artistIds = extractArtistIdsFromTracks(genreData.tracks.items);
            if (artistIds.length > 0) {
                await displayArtistsFromIds(artistIds, currentGenre);
            } else {
                throw new Error('No artists found');
            }
        }
        
        updateNavigationButtons();
        
    } catch (error) {
        console.error('Next genre artists error:', error);
        showError('Error loading more artists. Please try again.');
        updateNavigationButtons();
    } finally {
        hideLoading();
    }
}

function updateNavigationButtons() {
    const previousButton = document.querySelector('.previous-button');
    const nextButton = document.querySelector('.next-button');
    
    if (previousButton) {
        previousButton.style.display = genreHistory.length > 1 ? 'inline-block' : 'none';
    }
    
    if (nextButton) {
        nextButton.style.display = currentGenre ? 'inline-block' : 'none';
    }
}

function hideNavigationButtons() {
    const previousButton = document.querySelector('.previous-button');
    const nextButton = document.querySelector('.next-button');
    
    if (previousButton) previousButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    
    genreHistory = [];
}

function showNextButton() {
    const nextButton = document.querySelector('.next-button');
    if (nextButton) {
        nextButton.style.display = 'inline-block';
    }
    updateNavigationButtons();
}

function hideNextButton() {
    const nextButton = document.querySelector('.next-button');
    if (nextButton) {
        nextButton.style.display = 'none';
    }
    updateNavigationButtons();
}

async function loadPopularArtists() {
    try {
        const popularArtistIds = await getRandomPopularArtists();
        const data = await spotifyAPI.getSeveralArtists(popularArtistIds);
        displayArtistResults(data.artists, 'Popular');
        hideNavigationButtons();
        resetGenrePills();
        
        saveCurrentState();
    } catch (error) {
        console.log('Error loading popular artists:', error);
        showError('Error loading popular artists. Please try again.');
        hideNavigationButtons();
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
    
    saveCurrentState();
    pushToHistory(currentPageState);
    
    genreHistory = [];
    currentGenre = genre;
    currentOffset = 0;
    
    setActiveGenrePill(genre);
    
    try {
        const data = await spotifyAPI.searchByGenre(genre);
        
        if (data.tracks?.items) {
            const artistIds = extractArtistIdsFromTracks(data.tracks.items);
            if (artistIds.length > 0) {
                await displayArtistsFromIds(artistIds, genre);
                
                genreHistory.push({
                    genre: genre,
                    offset: 0,
                    searchQuery: `genre:${genre}`,
                    artists: getCurrentDisplayedArtists()
                });
                
                updateNavigationButtons();
            } else {
                throw new Error('No artists found in tracks');
            }
        } else {
            throw new Error('No tracks in genre response');
        }
        
    } catch (error) {
        console.error('Genre search error:', error);
        showError(`No ${genre} music found. Please try another genre.`);
        updateNavigationButtons();
    } finally {
        hideLoading();
    }
}

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

function resetGenrePills() {
    const genrePills = document.querySelectorAll('.genre-pill');
    genrePills.forEach(pill => {
        pill.classList.remove('active');
    });
    currentGenre = null;
}

function getRandomSearchTerms(genre) {
    const searchTerms = {
        'R&B': ['soul', 'neo soul', 'contemporary', '90s', 'modern'],
        'Jazz': ['bebop', 'fusion', 'smooth', 'contemporary', 'traditional'],
        'Hip-hop': ['rap', 'trap', 'boom bap', 'conscious', 'underground'],
        'Pop': ['indie', 'electropop', 'synthpop', 'dance', 'mainstream'],
        'Rock': ['alternative', 'indie', 'classic', 'hard', 'progressive'],
        'Electronic': ['house', 'techno', 'dubstep', 'ambient', 'dance'],
        'Country': ['americana', 'folk', 'bluegrass', 'outlaw', 'modern'],
        'Classical': ['baroque', 'romantic', 'contemporary', 'orchestral', 'piano'],
        'Reggae': ['dancehall', 'roots', 'dub', 'ska', 'modern'],
        'Metal': ['heavy', 'thrash', 'death', 'black', 'progressive'],
        'Indie': ['alternative', 'rock', 'pop', 'folk', 'electronic'],
        'Folk': ['americana', 'traditional', 'contemporary', 'acoustic', 'singer-songwriter'],
        'Blues': ['delta', 'chicago', 'electric', 'acoustic', 'modern'],
        'Soul': ['motown', 'philly', 'northern', 'deep', 'modern'],
        'Funk': ['p-funk', 'disco', 'afrobeat', 'modern', 'acid jazz']
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

    const artistsToDisplay = artists;
    
    artistsToDisplay.forEach(artist => {
        const displayGenre = genre || artist.genres?.[0] || 'Music';
        const artistCard = createArtistCard(artist, displayGenre);
        artistCard.setAttribute('data-artist-id', artist.id);
        resultsContainer.appendChild(artistCard);
    });

    if (typeof VibeCheckAnimations !== 'undefined') {
        VibeCheckAnimations.initInteractiveAnimations();
    }
}

function createArtistCard(artist, genre) {
    const artistCard = document.createElement('div');
    artistCard.className = 'artist-card card';
    artistCard.setAttribute('data-artist-id', artist.id);
    
    const imageUrl = artist.images?.[0]?.url || 'https://via.placeholder.com/200';
    
    artistCard.innerHTML = `
        <img src="${imageUrl}" alt="${artist.name}" class="artist-image">
        <div class="artist-name">${artist.name}</div>
        <div class="artist-genre">${genre}</div>
    `;
    
    artistCard.addEventListener('click', function() {
        saveCurrentState();
        pushToHistory(currentPageState);
        navigateToArtist(artist.id, artist.name);
    });
    
    return artistCard;
}

function navigateToArtist(artistId, artistName) {
    saveCurrentState();
    pushToHistory(currentPageState);
    
    const artistPageUrl = `Artist/artist.html?artistId=${artistId}&artistName=${encodeURIComponent(artistName)}&fromHome=true`;
    console.log('Navigating to artist:', artistName);
    window.location.href = artistPageUrl;
}

async function handleSearch() {
    const query = document.querySelector('.search-input').value.trim();
    if (!query) {
        showError('Please enter an artist name');
        return;
    }

    saveCurrentState();
    pushToHistory(currentPageState);

    showLoading();
    hideError();
    hideNavigationButtons();
    resetGenrePills();

    try {
        const data = await spotifyAPI.searchArtists(query);
        displayArtistResults(data.artists.items);
        
        saveCurrentState();
    } catch (error) {
        console.error('Search error:', error);
        showError('Error searching for artists. Please try again.');
    } finally {
        hideLoading();
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