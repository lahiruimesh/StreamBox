// Search Page
import { useThemeColor } from '@/hooks/use-theme-color';
import { dataAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average?: number;
};

type Song = {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const [movieResults, songResults] = await Promise.all([
        dataAPI.getMovies('Popular'),
        dataAPI.getSongs('Trending'),
      ]);
      
      // Filter by search query
      const filteredMovies = movieResults.filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase())
      );
      const filteredSongs = songResults.filter(s => 
        s.trackName.toLowerCase().includes(query.toLowerCase()) ||
        s.artistName.toLowerCase().includes(query.toLowerCase())
      );
      
      setMovies(filteredMovies);
      setSongs(filteredSongs);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToDetails = (id: number, type: 'movie' | 'song') => {
    router.push({
      pathname: '/details/[id]',
      params: { id: String(id), type },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={textColor} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search movies, songs..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <FlatList
          data={[...movies, ...songs]}
          keyExtractor={(item: any) => `${item.id || item.trackId}-${item.title || item.trackName}`}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => {
            const isMovie = 'title' in item;
            return (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => navigateToDetails(
                  isMovie ? item.id : item.trackId,
                  isMovie ? 'movie' : 'song'
                )}
              >
                {isMovie && item.poster_path ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w185${item.poster_path}` }}
                    style={styles.resultImage}
                  />
                ) : !isMovie && item.artworkUrl100 ? (
                  <Image
                    source={{ uri: item.artworkUrl100 }}
                    style={styles.resultImage}
                  />
                ) : (
                  <View style={styles.resultImagePlaceholder}>
                    <Ionicons 
                      name={isMovie ? 'film' : 'musical-notes'} 
                      size={40} 
                      color="#888" 
                    />
                  </View>
                )}
                <Text style={[styles.resultTitle, { color: textColor }]} numberOfLines={2}>
                  {isMovie ? item.title : item.trackName}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            query.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color="#888" />
                <Text style={[styles.emptyText, { color: '#888' }]}>No results found</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color="#888" />
                <Text style={[styles.emptyText, { color: '#888' }]}>Search for movies and songs</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 12,
  },
  resultCard: {
    flex: 1,
    margin: 4,
    maxWidth: '31%',
  },
  resultImage: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  resultImagePlaceholder: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
