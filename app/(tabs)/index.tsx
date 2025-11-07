import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import { useRouter } from 'expo-router';

type Item = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
};

export default function Home() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=20')
      .then(res => res.json())
      .then(json => setData(json.products || []))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" /></View>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card
            title={item.title}
            description={item.description}
            image={item.thumbnail}
            onPress={() => router.push(`../details/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
