// app/details/[id].tsx
import { useThemeColor } from '@/hooks/use-theme-color';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addFavourite, removeFavourite } from '../slices/favouritesSlice';
import { RootState } from '../store';

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

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        if (type === 'song') {
          const res = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
          const json = await res.json();
          setItem(json.results?.[0] ?? null);
        } else {
          const API_KEY = 'YOUR_TMDB_KEY_HERE'; // replace or import
          const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`);
          const json = await res.json();
          setItem(json);
        }
      } catch (err) {
        console.error('Details fetch err', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type]);

  // Play / Pause handlers for song preview
  const handlePlayPause = async () => {
    if (!item || !item.previewUrl) {
      Alert.alert('No preview available');
      return;
    }

    try {
      if (!soundRef.current) {
        // load and play
        const { sound } = await Audio.Sound.createAsync(
          { uri: item.previewUrl },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);

        // set a listener to update playing state when playback finishes
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setIsPlaying(false);
            // unload sound to free resources
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

  // Cleanup on unmount: stop & unload any sound
  useEffect(() => {
    return () => {
      (async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch (e) {
            /* ignore */
          }
          soundRef.current = null;
        }
      })();
    };
  }, []);

  const toggleFav = () => {
    if (!item) return;
    if (isFav) {
      dispatch(removeFavourite(item.id ?? item.trackId));
    } else {
      const payload = { ...(item), id: item.id ?? item.trackId, savedType: type || (item.trackId ? 'song' : 'movie') };
      dispatch(addFavourite(payload));
    }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: useThemeColor({}, 'background') }]}><ActivityIndicator size="large" /></View>;
  if (!item) return <View style={[styles.center, { backgroundColor: useThemeColor({}, 'background') }]}><Text style={{ color: useThemeColor({}, 'text') }}>Not found</Text></View>;

  if (type === 'song' || item.trackId) {
    // SONG DETAILS
    return (
      <View style={[{ flex: 1, padding: 16 }, { backgroundColor: useThemeColor({}, 'background') }] }>
        {item.artworkUrl100 ? (
          <Image source={{ uri: item.artworkUrl100.replace('100x100', '600x600') }} style={styles.image} />
        ) : null}
  <Text style={[styles.title, { color: useThemeColor({}, 'text') }]}>{item.trackName}</Text>
  <Text style={[styles.sub, { color: useThemeColor({}, 'icon') }]}>{item.artistName} • {item.collectionName}</Text>
  <Text style={[styles.desc, { color: useThemeColor({}, 'text') }]}>{item.primaryGenreName}</Text>

        <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
          <Text style={{ color: '#fff' }}>{isPlaying ? 'Pause Preview' : 'Play Preview'}</Text>
        </TouchableOpacity>

        {item.previewUrl ? (
      <TouchableOpacity style={[styles.button, { marginTop: 10, backgroundColor: '#444' }]} onPress={() => Linking.openURL(item.previewUrl)}>
        <Text style={{ color: '#fff' }}>Open Preview in Browser</Text>
      </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={toggleFav}>
          <Text style={{ color: '#fff' }}>{isFav ? 'Remove from favourites' : 'Add to favourites'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // MOVIE DETAILS
  return (
    <View style={[{ flex: 1, padding: 16 }, { backgroundColor: useThemeColor({}, 'background') }] }>
      <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.image} />
      <Text style={[styles.title, { color: useThemeColor({}, 'text') }]}>{item.title}</Text>
      <Text style={[styles.sub, { color: useThemeColor({}, 'icon') }]}>Release: {item.release_date} • Rating: {item.vote_average}</Text>
      <Text style={[styles.desc, { color: useThemeColor({}, 'text') }]}>{item.overview}</Text>

      <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={toggleFav}>
        <Text style={{ color: '#fff' }}>{isFav ? 'Remove from favourites' : 'Add to favourites'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 320, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  sub: { color: '#666', marginBottom: 12 },
  desc: { fontSize: 15, color: '#333' },
  button: { marginTop: 12, backgroundColor: '#E50914', padding: 12, alignItems: 'center', borderRadius: 8 }
});
