// Dummy API service for authentication and data fetching
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simulate network delay
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// ============ Auth API ============

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// User storage key
const USERS_STORAGE_KEY = 'app:registered_users';

// Helper to get all registered users from AsyncStorage
async function getRegisteredUsers() {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Helper to save users to AsyncStorage
async function saveRegisteredUsers(users: any[]) {
  try {
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export const authAPI = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay();
    
    const users = await getRegisteredUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const token = `token-${user.id}-${Date.now()}`;
      const userData = { id: user.id, email: user.email, name: user.name, avatar: user.avatar };
      
      await AsyncStorage.setItem('auth:token', token);
      await AsyncStorage.setItem('auth:user', JSON.stringify(userData));
      
      return {
        success: true,
        user: userData,
        token,
        message: 'Login successful'
      };
    }
    
    return {
      success: false,
      message: 'Invalid email or password'
    };
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await delay();
    
    const users = await getRegisteredUsers();
    const exists = users.find((u: any) => u.email === email);
    
    if (exists) {
      return {
        success: false,
        message: 'Email already registered'
      };
    }
    
    const newUserId = `user-${Date.now()}`;
    const newAvatar = `https://i.pravatar.cc/150?img=${users.length + 1}`;
    const newUser: User = {
      id: newUserId,
      email,
      name,
      avatar: newAvatar
    };
    
    // Save to AsyncStorage with password
    const userWithPassword = { ...newUser, password };
    users.push(userWithPassword);
    await saveRegisteredUsers(users);
    
    const token = `token-${newUser.id}-${Date.now()}`;
    await AsyncStorage.setItem('auth:token', token);
    await AsyncStorage.setItem('auth:user', JSON.stringify(newUser));
    
    return {
      success: true,
      user: newUser,
      token,
      message: 'Registration successful'
    };
  },

  async logout(): Promise<void> {
    await delay(300);
    await AsyncStorage.removeItem('auth:token');
    await AsyncStorage.removeItem('auth:user');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('auth:user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('auth:token');
    return !!token;
  }
};

// ============ Data Fetching API ============

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  genre_ids?: number[];
}

export interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  primaryGenreName?: string;
}

// Dummy movie data
const DUMMY_MOVIES: Movie[] = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    vote_average: 8.7,
    release_date: '1994-09-23',
    genre_ids: [18, 80]
  },
  {
    id: 2,
    title: 'The Godfather',
    overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    vote_average: 8.7,
    release_date: '1972-03-14',
    genre_ids: [18, 80]
  },
  {
    id: 3,
    title: 'The Dark Knight',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    vote_average: 8.5,
    release_date: '2008-07-16',
    genre_ids: [28, 18, 80]
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    vote_average: 8.5,
    release_date: '1994-09-10',
    genre_ids: [80, 53]
  },
  {
    id: 5,
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    vote_average: 8.4,
    release_date: '2010-07-15',
    genre_ids: [28, 878, 53]
  },
];

// Dummy song data
const DUMMY_SONGS: Song[] = [
  {
    trackId: 1001,
    trackName: 'Blinding Lights',
    artistName: 'The Weeknd',
    collectionName: 'After Hours',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6b/e5/68/6be56874-8a0b-c2f8-1c45-3a8c2f6a9c0f/source/100x100bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/sample.m4a',
    primaryGenreName: 'Pop'
  },
  {
    trackId: 1002,
    trackName: 'Shape of You',
    artistName: 'Ed Sheeran',
    collectionName: '÷ (Divide)',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/76/a0/a6/76a0a6e2-36e9-67c9-8e9a-a2e5c27e1b6f/source/100x100bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/sample.m4a',
    primaryGenreName: 'Pop'
  },
  {
    trackId: 1003,
    trackName: 'Bohemian Rhapsody',
    artistName: 'Queen',
    collectionName: 'A Night at the Opera',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/0b/25/6d/0b256d8c-bed6-8f3d-5a29-8c7c5d6c1d6c/source/100x100bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview124/v4/sample.m4a',
    primaryGenreName: 'Rock'
  },
  {
    trackId: 1004,
    trackName: 'Smells Like Teen Spirit',
    artistName: 'Nirvana',
    collectionName: 'Nevermind',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/c8/c8/c8/c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8/source/100x100bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview118/v4/sample.m4a',
    primaryGenreName: 'Rock'
  },
  {
    trackId: 1005,
    trackName: 'Lose Yourself',
    artistName: 'Eminem',
    collectionName: '8 Mile (Original Motion Picture Soundtrack)',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/d4/d4/d4/d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4/source/100x100bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview114/v4/sample.m4a',
    primaryGenreName: 'Hip-Hop'
  },
];

export const dataAPI = {
  async getMovies(category: string = 'popular'): Promise<Movie[]> {
    try {
      const TMDB_KEY = '88915f72aa8685d9c6603cb2aee663de';
      let endpoint = '';
      
      switch (category.toLowerCase()) {
        case 'top rated':
          endpoint = `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=1`;
          break;
        case 'newest':
          endpoint = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_KEY}&language=en-US&page=1`;
          break;
        case 'horror':
          endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=27&language=en-US&page=1`;
          break;
        default:
          endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  },

  async getMovieById(id: number): Promise<Movie | null> {
    try {
      const TMDB_KEY = '88915f72aa8685d9c6603cb2aee663de';
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  },

  async getSongs(category: string = 'trending'): Promise<Song[]> {
    try {
      let term = 'top songs';
      
      switch (category.toLowerCase()) {
        case 'pop':
          term = 'pop music';
          break;
        case 'rock':
          term = 'rock music';
          break;
        case 'hip-hop':
          term = 'hip hop';
          break;
        case 'classical':
          term = 'classical music';
          break;
        default:
          term = 'trending music';
      }
      
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=25`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching songs:', error);
      return [];
    }
  },

  async getSongById(id: number): Promise<Song | null> {
    try {
      const response = await fetch(
        `https://itunes.apple.com/lookup?id=${id}&entity=song`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results?.[0] || null;
    } catch (error) {
      console.error('Error fetching song details:', error);
      return null;
    }
  },

  async searchMovies(query: string): Promise<Movie[]> {
    await delay();
    const lowercaseQuery = query.toLowerCase();
    return DUMMY_MOVIES.filter(m => 
      m.title.toLowerCase().includes(lowercaseQuery) ||
      m.overview.toLowerCase().includes(lowercaseQuery)
    );
  },

  async searchSongs(query: string): Promise<Song[]> {
    await delay();
    const lowercaseQuery = query.toLowerCase();
    return DUMMY_SONGS.filter(s => 
      s.trackName.toLowerCase().includes(lowercaseQuery) ||
      s.artistName.toLowerCase().includes(lowercaseQuery)
    );
  }
};
