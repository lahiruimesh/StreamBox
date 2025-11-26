// Netflix-style Home Screen
import { useThemeColor } from '@/hooks/use-theme-color';
import { dataAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addFavourite, removeFavourite } from '../../app/slices/favouritesSlice';
import { RootState } from '../../app/store';

const { width } = Dimensions.get('window');

type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  genre_ids?: number[];
  release_date?: string;
};

type Song = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  primaryGenreName?: string;
};

export default function Home() {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Movie[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const router = useRouter();
  const favourites = useSelector((s: RootState) => s.favourites.items);
  const dispatch = useDispatch();
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [popular, topRated, horror, songs] = await Promise.all([
        dataAPI.getMovies('Popular'),
        dataAPI.getMovies('Top Rated'),
        dataAPI.getMovies('Horror'),
        dataAPI.getSongs('Trending'),
      ]);
      
      setPopularMovies(popular);
      setTopRatedMovies(topRated);
      setHorrorMovies(horror);
      setTrendingSongs(songs);
      
      // Set first popular movie as hero
      if (popular.length > 0) {
        setHeroMovie(popular[0]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFavourite = (id: number) => {
    return favourites.some(f => String(f.id) === String(id));
  };

  const toggleFavourite = (item: any, type: 'movie' | 'song') => {
    const id = type === 'movie' ? item.id : item.trackId;
    const exists = isFavourite(id);
    
    if (exists) {
      dispatch(removeFavourite(id));
    } else {
      dispatch(addFavourite({ ...item, id, savedType: type }));
    }
  };

  const navigateToDetails = (id: number, type: 'movie' | 'song') => {
    router.push({
      pathname: '/details/[id]',
      params: { id: String(id), type },
    });
  };

  const renderMovieCard = (movie: Movie, index: number) => (
    <TouchableOpacity
      key={`${movie.id}-${index}`}
      style={styles.movieCard}
      onPress={() => navigateToDetails(movie.id, 'movie')}
    >
      <Image
        source={{
          uri: movie.poster_path
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
            : 'https://via.placeholder.com/150x225/333/fff?text=No+Image',
        }}
        style={styles.moviePoster}
      />
      <TouchableOpacity
        style={styles.favIconSmall}
        onPress={() => toggleFavourite(movie, 'movie')}
      >
        <Ionicons
          name={isFavourite(movie.id) ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavourite(movie.id) ? tint : '#fff'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSongCard = (song: Song, index: number) => (
    <TouchableOpacity
      key={`${song.trackId}-${index}`}
      style={styles.movieCard}
      onPress={() => navigateToDetails(song.trackId, 'song')}
    >
      <View style={styles.songCardContent}>
        <Ionicons name="musical-notes" size={50} color="#888" />
        <Text style={styles.songCardTitle} numberOfLines={2}>
          {song.trackName}
        </Text>
        <Text style={styles.songCardArtist} numberOfLines={1}>
          {song.artistName}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.favIconSmall}
        onPress={() => toggleFavourite(song, 'song')}
      >
        <Ionicons
          name={isFavourite(song.trackId) ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavourite(song.trackId) ? tint : '#fff'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        {heroMovie && (
          <View style={styles.heroSection}>
            <Image
              source={{
                uri: heroMovie.backdrop_path
                  ? `https://image.tmdb.org/t/p/w780${heroMovie.backdrop_path}`
                  : heroMovie.poster_path
                  ? `https://image.tmdb.org/t/p/w780${heroMovie.poster_path}`
                  : 'https://via.placeholder.com/780x440/333/fff?text=StreamBox',
              }}
              style={styles.heroImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
              style={styles.heroGradient}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroInfo}>
                <Text style={styles.heroTag}>SERIES</Text>
                <Text style={styles.heroTitle}>{heroMovie.title}</Text>
                
                <View style={styles.heroButtons}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => navigateToDetails(heroMovie.id, 'movie')}
                  >
                    <Ionicons name="play" size={20} color="#000" />
                    <Text style={styles.playButtonText}>Play</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => toggleFavourite(heroMovie, 'movie')}
                  >
                    <Ionicons
                      name={isFavourite(heroMovie.id) ? 'checkmark' : 'add'}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.downloadButtonText}>
                      {isFavourite(heroMovie.id) ? 'In My List' : 'Add to My List'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.heroDescription} numberOfLines={3}>
                  {heroMovie.overview}
                </Text>
                
                <View style={styles.heroMeta}>
                  <Text style={styles.heroMetaText}>
                    {heroMovie.release_date?.split('-')[0]} • 18+ • 1 Season
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Popular on Netflix */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>Popular on Netflix</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularMovies}
            renderItem={({ item, index }) => renderMovieCard(item, index)}
            keyExtractor={(item, index) => `popular-${item.id}-${index}`}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* TV Dramas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>TV Dramas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={topRatedMovies}
            renderItem={({ item, index }) => renderMovieCard(item, index)}
            keyExtractor={(item, index) => `drama-${item.id}-${index}`}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Horror */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>Horror</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={horrorMovies}
            renderItem={({ item, index }) => renderMovieCard(item, index)}
            keyExtractor={(item, index) => `horror-${item.id}-${index}`}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Trending Music */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>Trending Music</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingSongs}
            renderItem={({ item, index }) => renderSongCard(item, index)}
            keyExtractor={(item, index) => `song-${item.trackId}-${index}`}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>
      
      {/* Transparent Header Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
        style={styles.header}
      >
        <Text style={styles.headerLogo}><Text style={styles.headerLogoRed}>Stream</Text>Box</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search" size={26} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerLogoRed: {
    color: '#E50914',
  },
  searchButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Hero Section
  heroSection: {
    height: 500,
    position: 'relative',
    marginBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroInfo: {
    alignItems: 'flex-start',
  },
  heroTag: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    maxWidth: '80%',
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  playButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(109, 109, 110, 0.8)',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  heroDescription: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
    marginBottom: 8,
    maxWidth: '90%',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMetaText: {
    fontSize: 11,
    color: '#aaa',
  },
  
  // Sections
  section: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: 12,
  },
  
  // Movie Card
  movieCard: {
    width: 110,
    marginHorizontal: 4,
    position: 'relative',
  },
  moviePoster: {
    width: '100%',
    height: 165,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
  },
  favIconSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  
  // Song Card
  songCardContent: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  songCardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  songCardArtist: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});
