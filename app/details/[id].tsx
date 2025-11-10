// app/details/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { addFavourite, removeFavourite } from '../slices/favouritesSlice';
import { RootState } from '../store';

export default function Details() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: 'movie' | 'song' }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
          // iTunes lookup by id
          const res = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
          const json = await res.json();
          setItem(json.results?.[0] ?? null);
        } else {
          // movie (TMDB)
          const API_KEY = 'YOUR_TMDB_KEY_HERE';
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

  const toggleFav = () => {
    if (!item) return;
    if (isFav) {
      dispatch(removeFavourite(item.id ?? item.trackId));
    } else {
      // store the item with a common shape so favourites screen can show both
      const payload = { ...(item), savedType: type || 'movie' };
      dispatch(addFavourite(payload));
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (!item) return <View style={styles.center}><Text>Not found</Text></View>;

  // Render song or movie fields
  if (type === 'song') {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Image source={{ uri: item.artworkUrl100?.replace('100x100', '600x600') }} style={styles.image} />
        <Text style={styles.title}>{item.trackName}</Text>
        <Text style={styles.sub}>{item.artistName} • {item.collectionName}</Text>
        <Text style={styles.desc}>{item.primaryGenreName}</Text>

        {/* Preview link */}
        {item.previewUrl ? (
          <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(item.previewUrl)}>
            <Text style={{ color: '#fff' }}>Play Preview</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={toggleFav}>
          <Text style={{ color: '#fff' }}>{isFav ? 'Remove from favourites' : 'Add to favourites'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // default: movie
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.sub}>Release: {item.release_date} • Rating: {item.vote_average}</Text>
      <Text style={styles.desc}>{item.overview}</Text>

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
