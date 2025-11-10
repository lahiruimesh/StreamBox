// app/(tabs)/favourites.tsx
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/Card';
import { removeFavourite } from '../slices/favouritesSlice';
import { RootState } from '../store';

export default function FavouritesScreen() {
  const favourites = useSelector((state: RootState) => state.favourites.items);
  const dispatch = useDispatch();
  const router = useRouter();
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  if (!favourites || favourites.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: bg }]}>
        <Text style={{ color: text }}>No favourites yet</Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => {
    const isSong = Boolean(item.trackId || item.savedType === 'song');

    const title = isSong ? item.trackName : item.title;
    const description = isSong ? item.artistName : item.description;
    const image = isSong
      ? (item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '342x342') : undefined)
      : (item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : item.thumbnail);

    return (
      <Card
        title={title}
        description={description}
        image={image}
        isSong={isSong}
        onPress={() =>
          router.push({
            pathname: '/details/[id]',
            params: { id: String(isSong ? item.trackId : item.id), type: isSong ? 'song' : 'movie' },
          })
        }
        rightAction={
          <TouchableOpacity onPress={() => dispatch(removeFavourite(isSong ? item.trackId : item.id))}>
            <Text style={{ color: '#E50914' }}>Remove</Text>
          </TouchableOpacity>
        }
      />
    );
  };

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: bg }}>
      <FlatList
        data={favourites}
        keyExtractor={(i: any) => String(i.id ?? i.trackId)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
