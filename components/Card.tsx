import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  title: string;
  description?: string;
  image?: string;
  onPress?: () => void;
  rightAction?: React.ReactNode;
};

export default function Card({ title, description, image, onPress, rightAction }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.desc}>{description}</Text>
      </View>
      <View style={styles.action}>
        {rightAction}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 10, alignItems: 'center', elevation: 1 },
  image: { width: 80, height: 80, borderRadius: 6, marginRight: 10 },
  body: { flex: 1 },
  title: { fontWeight: '700', fontSize: 16 },
  desc: { fontSize: 13, color: '#555' },
  action: { marginLeft: 8 }
});
