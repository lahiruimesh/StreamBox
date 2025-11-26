// Netflix-style Profile Screen
import { useTheme } from '@/app/ThemeProvider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { authAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const theme = useTheme();
  const router = useRouter();
  
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    (async () => {
      try {
        const user = await authAPI.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setName(user.name);
          setPhoto(user.avatar || null);
        }
        
        const s = await AsyncStorage.getItem('user:profile');
        if (s) {
          const parsed = JSON.parse(s);
          setName(parsed.name || name);
          setPhoto(parsed.photo || photo);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo permissions');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      quality: 0.8, 
      allowsEditing: true, 
      aspect: [1, 1] 
    });
    if (!res.canceled) {
      setPhoto(res.assets?.[0]?.uri ?? (res as any).uri);
    }
  };

  const save = async () => {
    try {
      await AsyncStorage.setItem('user:profile', JSON.stringify({ name, photo }));
      Alert.alert('Saved', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authAPI.logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Account</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        <TouchableOpacity onPress={pickPhoto} style={styles.profileRow}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
          )}
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: textColor }]}>
              {name || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{currentUser?.email || 'user@streambox.com'}</Text>
          </View>

          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingRow}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Display Name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        <TouchableOpacity style={styles.settingRow} onPress={save}>
          <Text style={[styles.settingText, { color: textColor }]}>Save Changes</Text>
          <Ionicons name="checkmark-circle" size={24} color={tintColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.themeButtons}>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme.currentMode === 'light' && { backgroundColor: tintColor }
            ]}
            onPress={() => theme.setTheme('light')}
          >
            <Ionicons 
              name="sunny" 
              size={20} 
              color={theme.currentMode === 'light' ? '#fff' : '#888'} 
            />
            <Text style={[
              styles.themeButtonText,
              { color: theme.currentMode === 'light' ? '#fff' : '#888' }
            ]}>
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeButton,
              theme.currentMode === 'dark' && { backgroundColor: tintColor }
            ]}
            onPress={() => theme.setTheme('dark')}
          >
            <Ionicons 
              name="moon" 
              size={20} 
              color={theme.currentMode === 'dark' ? '#fff' : '#888'} 
            />
            <Text style={[
              styles.themeButtonText,
              { color: theme.currentMode === 'dark' ? '#fff' : '#888' }
            ]}>
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeButton,
              theme.currentMode === 'system' && { backgroundColor: tintColor }
            ]}
            onPress={() => theme.setTheme('system')}
          >
            <Ionicons 
              name="phone-portrait" 
              size={20} 
              color={theme.currentMode === 'system' ? '#fff' : '#888'} 
            />
            <Text style={[
              styles.themeButtonText,
              { color: theme.currentMode === 'system' ? '#fff' : '#888' }
            ]}>
              Auto
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingText: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E50914',
  },
});
