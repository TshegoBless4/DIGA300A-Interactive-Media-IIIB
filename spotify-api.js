// Spotify API configuration and functions
class SpotifyAPI {
    constructor() {
        
        this.clientId = 'd5d3636adc6746a69aece5765bd9a775'; // PASTE YOUR CLIENT ID
        this.clientSecret = '927608615fc64266a18c0288f00c97ca'; // 
        this.accessToken = null;
        this.baseURL = 'https://api.spotify.com/v1';
        console.log('SpotifyAPI initialized with Client ID:', this.clientId ? 'SET' : 'MISSING');
    }

    async getAccessToken() {
        console.log(' Getting access token...');
        
        if (this.accessToken) {
            console.log(' Using cached token');
            return this.accessToken;
        }

        try {
            // Validate credentials first
            if (!this.clientId || this.clientId === 'your_actual_client_id_here' || 
                !this.clientSecret || this.clientSecret === 'your_actual_client_secret_here') {
                throw new Error(' Spotify API credentials are missing or not updated. Please check spotify-api.js');
            }

            const authString = btoa(this.clientId + ':' + this.clientSecret);
            
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + authString
                },
                body: 'grant_type=client_credentials'
            });

            console.log('🔍 Token request status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(' Token request failed:', errorText);
                throw new Error(`HTTP error! status: ${response.status}. Check your Client ID and Secret.`);
            }

            const data = await response.json();
            console.log('Access token received successfully');
            this.accessToken = data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', error.message);
            throw error;
        }
    }

    async searchArtists(query) {
        console.log('🎵 Searching artists for:', query);
        
        try {
            const token = await this.getAccessToken();
            const url = `${this.baseURL}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`;
            
            console.log(' Making search request...');
            
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
            console.error(' Search artists error:', error.message);
            throw error;
        }
    }

    async searchByGenre(genre) {
        console.log('🎶 Searching by genre:', genre);
        
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
            console.log(' Genre search successful:', data.tracks?.items?.length || 0, 'tracks found');
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
            console.error(' Get artist error:', error.message);
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
            console.error(' Get top tracks error:', error.message);
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
            console.error(' Get several artists error:', error.message);
            throw error;
        }
    }
    // Add these methods to your SpotifyAPI class:

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
        console.error(' Get artist albums error:', error.message);
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
        console.error(' Get album tracks error:', error.message);
        throw error;
    }
}
}

// Create global instance
const spotifyAPI = new SpotifyAPI();