// Netflix-style My List (Favourites) Screen
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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
        <Ionicons name="download-outline" size={64} color="#444" />
        <Text style={[styles.emptyText, { color: text }]}>No items in your list</Text>
        <Text style={styles.emptySubtext}>Add movies and shows to watch later</Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => {
    const isSong = Boolean(item.trackId || item.savedType === 'song');
    const title = isSong ? item.trackName : item.title;
    const description = isSong ? item.artistName : item.overview;
    const image = isSong
      ? null
      : (item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() =>
          router.push({
            pathname: '/details/[id]',
            params: { id: String(isSong ? item.trackId : item.id), type: isSong ? 'song' : 'movie' },
          })
        }
      >
        {!isSong && image ? (
          <Image source={{ uri: image }} style={styles.itemPoster} />
        ) : (
          <View style={styles.placeholderPoster}>
            <Ionicons name="musical-notes" size={40} color="#666" />
          </View>
        )}
        
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {description}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => dispatch(removeFavourite(isSong ? item.trackId : item.id))}
        >
          <Ionicons name="close-circle" size={28} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: text }]}>My List</Text>
        <Text style={styles.headerSubtitle}>{favourites.length} items</Text>
      </View>
      
      <FlatList
        data={favourites}
        keyExtractor={(i: any) => String(i.id ?? i.trackId)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },

  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },

  listContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemPoster: {
    width: 100,
    height: 150,
  },
  placeholderPoster: {
    width: 100,
    height: 150,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  removeButton: {
    padding: 16,
    justifyContent: 'center',
  },
});

