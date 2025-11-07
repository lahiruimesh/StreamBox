import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import Card from '../../components/Card';
import { removeFavourite } from '../slices/favouritesSlice';
import { useRouter } from 'expo-router';

export default function FavouritesScreen() {
  const favourites = useSelector((state: RootState) => state.favourites.items);
  const dispatch = useDispatch();
  const router = useRouter();

  if (!favourites || favourites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>No favourites yet</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={favourites}
        keyExtractor={(i: any) => String(i.id)}
        renderItem={({ item }: any) => (
          <Card
            title={item.title}
            description={item.description}
            image={item.thumbnail}
            onPress={() => router.push(`../details/${item.id}`)}
            rightAction={
              <TouchableOpacity onPress={() => dispatch(removeFavourite(item.id))}>
                <Text style={{ color: '#E50914' }}>Remove</Text>
              </TouchableOpacity>
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
