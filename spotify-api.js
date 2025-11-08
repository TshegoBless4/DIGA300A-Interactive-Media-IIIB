class SpotifyAPI {
    constructor() {
        this.clientId = 'd5d3636adc6746a69aece5765bd9a775'; 
        this.clientSecret = '927608615fc64266a18c0288f00c97ca'; 
        this.accessToken = null;
        this.tokenExpiry = null;
        this.baseURL = 'https://api.spotify.com/v1';
        console.log('SpotifyAPI initialized with Client ID:', this.clientId ? 'SET' : 'MISSING');
    }

    async getAccessToken() {
        console.log('Getting access token...');
        
        // Check if token is still valid (with 5 minute buffer)
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
            console.log('Using cached token');
            return this.accessToken;
        }

        try {
            // Simple validation - only check if credentials exist
            if (!this.clientId || !this.clientSecret) {
                throw new Error('Spotify API credentials are missing. Please check spotify-api.js');
            }

            console.log('Making token request to Spotify...');
            const authString = btoa(this.clientId + ':' + this.clientSecret);
            
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + authString
                },
                body: 'grant_type=client_credentials'
            });

            console.log('Token request status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Token request failed:', errorText);
                
                // More specific error messages
                if (response.status === 400) {
                    throw new Error('Invalid client credentials. Please check your Client ID and Secret.');
                } else if (response.status === 401) {
                    throw new Error('Authentication failed. Client ID or Secret may be incorrect.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            console.log('Access token received successfully');
            this.accessToken = data.access_token;
            
            // Set token expiry (usually 1 hour)
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            
            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', error.message);
            
            // Check if it's a network error
            if (error.message.includes('Failed to fetch')) {
                console.error('Network error - check your internet connection');
            }
            
            throw error;
        }
    }

    async searchArtists(query) {
        console.log('Searching artists for:', query);
        
        try {
            const token = await this.getAccessToken();
            const url = `${this.baseURL}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`;
            
            console.log('Making search request...');
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`Search failed! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Search successful:', data.artists?.items?.length || 0, 'artists found');
            return data;
        } catch (error) {
            console.error('Search artists error:', error.message);
            throw error;
        }
    }

    async searchByGenre(genre) {
        console.log('Searching by genre:', genre);
        
        try {
            const token = await this.getAccessToken();
            const url = `${this.baseURL}/search?q=genre:${encodeURIComponent(genre)}&type=track&limit=20`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`Genre search failed! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Genre search successful:', data.tracks?.items?.length || 0, 'tracks found');
            return data;
        } catch (error) {
            console.error('Genre search error:', error.message);
            throw error;
        }
    }

    async getArtist(artistId) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseURL}/artists/${artistId}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`Get artist failed! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get artist error:', error.message);
            throw error;
        }
    }

    async getArtistTopTracks(artistId) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseURL}/artists/${artistId}/top-tracks?market=US`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`Get top tracks failed! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get top tracks error:', error.message);
            throw error;
        }
    }

    async getSeveralArtists(artistIds) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseURL}/artists?ids=${artistIds.join(',')}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`Get several artists failed! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get several artists error:', error.message);
            throw error;
        }
    }

    async getArtistAlbums(artistId, limit = 20) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseURL}/artists/${artistId}/albums?limit=${limit}&market=US`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`Get artist albums failed! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get artist albums error:', error.message);
            throw error;
        }
    }

    async getAlbumTracks(albumId) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseURL}/albums/${albumId}/tracks?market=US`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`Get album tracks failed! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get album tracks error:', error.message);
            throw error;
        }
    }

    // Utility method to clear token (for testing)
    clearToken() {
        this.accessToken = null;
        this.tokenExpiry = null;
        console.log('Access token cleared');
    }

    // Check if token is valid
    isTokenValid() {
        return this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
    }
}

// Create global instance
const spotifyAPI = new SpotifyAPI();