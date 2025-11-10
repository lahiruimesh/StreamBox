// components/Card.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  title: string;
  description?: string;
  image?: string;
  onPress?: () => void;
  rightAction?: React.ReactNode;
  // optional small badge (e.g., rating) shown top-right of image
  badge?: string | number;
};

const Card: React.FC<Props> = ({ title, description, image, onPress, rightAction, badge }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.touchable}
      accessibilityRole="button"
    >
      <View style={styles.card}>
        {image ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: image }} style={styles.image} />
            {badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          {description ? (
            <Text numberOfLines={2} style={styles.desc}>
              {description}
            </Text>
          ) : null}
        </View>

        {rightAction ? <View style={styles.action}>{rightAction}</View> : null}
      </View>
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3, // android
    shadowColor: '#000', // ios
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E50914',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  desc: {
    fontSize: 12,
    color: '#666',
  },
  action: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
});
