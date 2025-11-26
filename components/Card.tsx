// components/Card.tsx
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  description?: string;
  image?: string;
  onPress?: () => void;
  rightAction?: React.ReactNode;
  badge?: string | number;
  isSong?: boolean; // NEW: mark this card as a song
  showFavourite?: boolean;
  isFavourite?: boolean;
  onFavouritePress?: () => void;
};

const Card: React.FC<Props> = ({ title, description, image, onPress, rightAction, badge, isSong, showFavourite, isFavourite, onFavouritePress }) => {
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.touchable} accessibilityRole="button">
      <View style={[styles.card, { backgroundColor: cardBg }]}> 
        {/* Don't show image for songs */}
        {!isSong && image ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: image }} style={styles.image} />
            {badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Show music icon for songs instead of image */}
        {isSong && (
          <View style={styles.songHeader}>
            <View style={styles.musicIconLarge}>
              <Ionicons name="musical-notes" size={32} color="#E50914" />
            </View>
          </View>
        )}

        <View style={[styles.content, isSong && styles.songContent]}>
          <Text numberOfLines={isSong ? 2 : 2} style={[styles.title, { color: text }]}>
            {title}
          </Text>
          {description ? (
            <Text numberOfLines={isSong ? 1 : 2} style={[styles.desc, { color: useThemeColor({}, 'icon') }]}>
              {description}
            </Text>
          ) : null}
        </View>

        {rightAction ? <View style={styles.action}>{rightAction}</View> : null}

        {/* Favourite toggle (small heart) */}
        {showFavourite ? (
          <TouchableOpacity style={styles.fav} onPress={onFavouritePress}>
            <Ionicons name={isFavourite ? 'heart' : 'heart-outline'} size={18} color={isFavourite ? '#E50914' : '#fff'} />
          </TouchableOpacity>
        ) : null}
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
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
    top: 10,
    right: 10,
    backgroundColor: '#E50914',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  songHeader: {
    width: '100%',
    paddingVertical: 32,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicIconLarge: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 14,
  },
  songContent: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
    lineHeight: 20,
  },
  desc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  action: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  fav: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
  },
});
  