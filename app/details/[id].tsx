import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addFavourite, removeFavourite } from '../slices/favouritesSlice';

type Item = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
};

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  const favourites = useSelector((state: RootState) => state.favourites.items);
  const isFav = favourites.some((f: any) => f.id === Number(id));

  useEffect(() => {
    if (!id) return;
    fetch(`https://dummyjson.com/products/${id}`)
      .then(res => res.json())
      .then(json => setItem(json))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFav = () => {
    if (!item) return;
    if (isFav) {
      dispatch(removeFavourite(item.id));
      Alert.alert('Removed', 'Removed from favourites');
    } else {
      dispatch(addFavourite(item));
      Alert.alert('Added', 'Added to favourites');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (!item) return <View style={styles.center}><Text>Item not found</Text></View>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="cover" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <Text style={styles.desc}>{item.description}</Text>

      <TouchableOpacity style={styles.favButton} onPress={toggleFav}>
        <Text style={{ color: '#fff' }}>{isFav ? 'Remove from favourites' : 'Add to favourites'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.favButton, { marginTop: 10, backgroundColor: '#444' }]} onPress={() => router.back()}>
        <Text style={{ color: '#fff' }}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 220, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  price: { fontSize: 18, color: '#E50914', marginBottom: 8 },
  desc: { fontSize: 14, color: '#333' },
  favButton: { marginTop: 16, backgroundColor: '#E50914', padding: 12, alignItems: 'center', borderRadius: 8 }
});
