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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.touchable} accessibilityRole="button">
      <View style={[styles.card, { backgroundColor: bg }]}> 
        {image ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: image }} style={styles.image} />
            {badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}

            {/* MUSIC ICON OVERLAY */}
            {isSong && (
              <View style={styles.musicIcon}>
                <Ionicons name="musical-notes" size={18} color="#fff" />
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.content}>
          <Text numberOfLines={2} style={[styles.title, { color: text }]}>
            {title}
          </Text>
          {description ? (
            <Text numberOfLines={2} style={[styles.desc, { color: useThemeColor({}, 'icon') }]}>
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
  musicIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  fav: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 6,
    borderRadius: 20,
  },
});
  