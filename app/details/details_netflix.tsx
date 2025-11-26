// Netflix-style Details Page
import { useThemeColor } from '@/hooks/use-theme-color';
import { dataAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addFavourite, removeFavourite } from '../slices/favouritesSlice';
import { RootState } from '../store';

const { width } = Dimensions.get('window');

export default function Details() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: 'movie' | 'song' }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const favourites = useSelector((s: RootState) => s.favourites.items);
  const isFav = favourites.some((f: any) => String(f.id ?? f.trackId) === String(id));
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        console.log('Fetching details for:', id, 'type:', type);
        if (type === 'song') {
          const result = await dataAPI.getSongById(parseInt(id));
          console.log('Song result:', result);
          setItem(result);
        } else {
          const result = await dataAPI.getMovieById(parseInt(id));
          console.log('Movie result:', result);
          setItem(result);
        }
      } catch (err) {
        console.error('Details fetch err', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type]);

  const handlePlayPause = async () => {
    if (!item || !item.previewUrl) {
      Alert.alert('No preview available');
      return;
    }

    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: item.previewUrl },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.unloadAsync().catch(() => {});
            soundRef.current = null;
          }
        });
      } else {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else if (status.isLoaded) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Audio play error', err);
      Alert.alert('Playback error');
    }
  };

  useEffect(() => {
    return () => {
      (async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch (e) {
            console.error('Cleanup error', e);
          }
        }
      })();
    };
  }, []);

  const handleFavourite = () => {
    if (isFav) {
      dispatch(removeFavourite(parseInt(id)));
    } else {
      const itemToAdd = { ...item, id: parseInt(id), savedType: type };
      dispatch(addFavourite(itemToAdd));
    }
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: textColor }]}>Content not found</Text>
        </View>
      </View>
    );
  }

  const isSong = type === 'song';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroSection}>
          {!isSong && item.backdrop_path ? (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w780${item.backdrop_path}` }}
              style={styles.backdropImage}
            />
          ) : !isSong && item.poster_path ? (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w780${item.poster_path}` }}
              style={styles.backdropImage}
            />
          ) : (
            <View style={[styles.backdropPlaceholder, { backgroundColor: '#1a1a1a' }]}>
              <Ionicons name="musical-notes" size={80} color="#444" />
            </View>
          )}
          <View style={styles.heroGradient} />
          
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Download/Share Icons */}
          <View style={styles.topRightIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Title */}
          <Text style={[styles.title, { color: textColor }]}>
            {isSong ? item.trackName : item.title}
          </Text>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            {!isSong && item.release_date && (
              <Text style={styles.metaText}>{item.release_date.split('-')[0]}</Text>
            )}
            {!isSong && item.vote_average && (
              <Text style={styles.metaText}>⭐ {item.vote_average.toFixed(1)}</Text>
            )}
            {isSong && item.collectionName && (
              <Text style={styles.metaText}>{item.collectionName}</Text>
            )}
            {isSong && item.artistName && (
              <Text style={styles.metaText}>{item.artistName}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={24} color="#000" />
              <Text style={styles.playButtonText}>
                {isSong ? 'Play Song' : 'Continue Watch'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handleFavourite}
            >
              <Ionicons 
                name={isFav ? 'checkmark' : 'download-outline'} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.downloadButtonText}>
                {isFav ? 'In My List' : 'Download'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: textColor }]}>
            {isSong ? `${item.artistName} - ${item.collectionName || 'Single'}` : item.overview || 'No description available.'}
          </Text>

          {/* Cast/Artist Info */}
          <View style={styles.infoSection}>
            <Text style={[styles.infoLabel, { color: '#888' }]}>
              {isSong ? 'Artist:' : 'Director:'}
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {isSong ? item.artistName : 'Siddharth Sengupta'}
            </Text>
          </View>

          {isSong && item.primaryGenreName && (
            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: '#888' }]}>Genre:</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>{item.primaryGenreName}</Text>
            </View>
          )}

          {/* Episodes Section (for movies/shows) */}
          {!isSong && (
            <View style={styles.episodesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>EPISODES</Text>
                <Text style={styles.seasonSelector}>Season 1 ▼</Text>
              </View>

              <TouchableOpacity style={styles.episodeCard}>
                <Image
                  source={{
                    uri: item.poster_path
                      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                      : 'https://via.placeholder.com/160x90/333/fff?text=Episode',
                  }}
                  style={styles.episodeThumb}
                />
                <View style={styles.episodeInfo}>
                  <View style={styles.episodeHeader}>
                    <Text style={[styles.episodeTitle, { color: textColor }]}>1  Fort Boon Hai</Text>
                    <TouchableOpacity style={styles.downloadIcon}>
                      <Ionicons name="download-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.episodeDescription} numberOfLines={3}>
                    College graduate Velan's plans for his future are upended when
                    internship pressure offers him a gig at the hottest club of...
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Trailers & More */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>TRAILERS & MORE</Text>
          </View>

          {/* More Like This */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>MORE LIKE THIS</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },

  // Hero Section
  heroSection: {
    height: 400,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightIcons: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Section
  contentSection: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: '#888',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(109, 109, 110, 0.7)',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Description & Info
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },

  // Episodes Section
  episodesSection: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seasonSelector: {
    fontSize: 14,
    color: '#888',
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  episodeThumb: {
    width: 160,
    height: 90,
  },
  episodeInfo: {
    flex: 1,
    padding: 12,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  downloadIcon: {
    padding: 4,
  },
  episodeDescription: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },

  // Sections
  section: {
    marginTop: 32,
  },
});
