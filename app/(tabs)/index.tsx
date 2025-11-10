// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import Card from '../../components/Card';
import { useRouter } from 'expo-router';

const API_KEY = '88915f72aa8685d9c6603cb2aee663de'; // keep your key or import from .env

type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average?: number;
};

type Song = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
};

export default function Home() {
  const [mode, setMode] = useState<'movies' | 'songs'>('movies'); // toggle
  const [movies, setMovies] = useState<Movie[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Popular');
  const router = useRouter();

  const movieCategories = [
    { name: 'Popular', url: `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1` },
    { name: 'Top Rated', url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1` },
    { name: 'Newest', url: `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1` },
    { name: 'Horror', url: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=27&page=1` },
  ];

  // For songs we use iTunes Search API. We change the `term` per category.
  const songCategories = [
    { name: 'Trending', term: 'top pop' },
    { name: 'Pop', term: 'pop' },
    { name: 'Rock', term: 'rock' },
    { name: 'Hip-Hop', term: 'hip hop' },
    { name: 'Classical', term: 'classical' },
  ];

  // Fetch movies by selectedCategory (movieCategories)
  const fetchMovies = async (url: string) => {
    setLoading(true);
    try {
      const res = await fetch(url);
      const json = await res.json();
      setMovies(json.results || []);
    } catch (err) {
      console.error('TMDB error', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch songs by chosen term using iTunes Search API
  const fetchSongs = async (term: string) => {
    setLoading(true);
    try {
      // term should be URL encoded
      const q = encodeURIComponent(term);
      const url = `https://itunes.apple.com/search?term=${q}&entity=song&limit=30`;
      const res = await fetch(url);
      const json = await res.json();
      setSongs(json.results || []);
    } catch (err) {
      console.error('iTunes error', err);
    } finally {
      setLoading(false);
    }
  };

  // load initial data whenever mode or selectedCategory changes
  useEffect(() => {
    (async () => {
      if (mode === 'movies') {
        // find movie category URL
        const cat = movieCategories.find(c => c.name === selectedCategory) || movieCategories[0];
        await fetchMovies(cat.url);
      } else {
        const cat = songCategories.find(c => c.name === selectedCategory) || songCategories[0];
        await fetchSongs(cat.term);
      }
    })();
  }, [mode, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // render item handler: map movie/song to Card props
  const renderMovieItem = ({ item }: { item: Movie }) => (
    <View style={styles.itemContainer}>
      <Card
        title={item.title}
        description={item.overview}
        image={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : undefined}
        badge={item.vote_average ? item.vote_average.toFixed(1) : undefined}
        onPress={() =>
          router.push({
            pathname: '/details/[id]',
            params: { id: String(item.id), type: 'movie' },
          })
        }
      />
    </View>
  );

  const renderSongItem = ({ item }: { item: Song }) => (
    <View style={styles.itemContainer}>
      <Card
        title={item.trackName}
        description={item.artistName}
        image={item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '342x342') : undefined}
        onPress={() =>
          router.push({
            pathname: '/details/[id]',
            params: { id: String(item.trackId), type: 'song' },
          })
        }
      />
    </View>
  );

  const dataToShow = mode === 'movies' ? movies : songs;

  return (
    <View style={{ flex: 1 }}>
      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity onPress={() => { setMode('movies'); setSelectedCategory('Popular'); }} style={[styles.modeButton, mode === 'movies' && styles.modeButtonActive]}>
          <Text style={[styles.modeText, mode === 'movies' && styles.modeTextActive]}>Movies</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setMode('songs'); setSelectedCategory('Trending'); }} style={[styles.modeButton, mode === 'songs' && styles.modeButtonActive]}>
          <Text style={[styles.modeText, mode === 'songs' && styles.modeTextActive]}>Songs</Text>
        </TouchableOpacity>
      </View>

      {/* Category selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {(mode === 'movies' ? movieCategories : songCategories).map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[styles.categoryButton, selectedCategory === cat.name && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.name && styles.categoryTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={dataToShow}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        keyExtractor={(item: any) => String(item.id ?? item.trackId)}
        renderItem={(props) => (mode === 'movies' ? renderMovieItem(props as any) : renderSongItem(props as any))}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modeToggle: { flexDirection: 'row', padding: 12, justifyContent: 'center' },
  modeButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#eee', marginHorizontal: 8 },
  modeButtonActive: { backgroundColor: '#E50914' },
  modeText: { color: '#333', fontWeight: '600' },
  modeTextActive: { color: '#fff' },

  categoryContainer: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8 },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#222',
    marginRight: 10,
  },
  categoryButtonActive: { backgroundColor: '#E50914' },
  categoryText: { color: '#fff' },
  categoryTextActive: { fontWeight: '700' },

  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 12 },
  itemContainer: { flex: 1, marginBottom: 12, marginHorizontal: 6 },
});
