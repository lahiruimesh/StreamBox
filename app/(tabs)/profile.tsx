import { useTheme } from '@/app/ThemeProvider';
import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('user:profile');
        if (s) {
          const parsed = JSON.parse(s);
          setName(parsed.name || '');
          setPhoto(parsed.photo || null);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo permissions to set profile photo');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled) {
      setPhoto(res.assets?.[0]?.uri ?? (res as any).uri);
    }
  };

  const save = async () => {
    try {
      await AsyncStorage.setItem('user:profile', JSON.stringify({ name, photo }));
      Alert.alert('Saved', 'Profile saved');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: useThemeColor({}, 'background') }] }>
      <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrap}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={{ color: useThemeColor({}, 'text') }}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput style={[styles.input, { borderColor: useThemeColor({}, 'icon'), color: useThemeColor({}, 'text') }]} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor={useThemeColor({}, 'icon')} />

      <TouchableOpacity style={[styles.button, { backgroundColor: useThemeColor({}, 'tint') }]} onPress={save}>
        <Text style={{ color: useThemeColor({}, 'background'), fontWeight: '700' }}>Save</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Text style={{ color: useThemeColor({}, 'text') }}>Theme</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity style={styles.smallBtn} onPress={() => theme.setTheme('light')}>
            <Text>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={() => theme.setTheme('dark')}>
            <Text>Dark</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={() => theme.setTheme('system')}>
            <Text>System</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  avatarWrap: { width: 120, height: 120, borderRadius: 999, overflow: 'hidden', marginBottom: 16 },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, backgroundColor: '#888', justifyContent: 'center', alignItems: 'center' },
  input: { width: '100%', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginTop: 8 },
  button: { marginTop: 12, backgroundColor: '#E50914', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  smallBtn: { padding: 8, borderRadius: 8, backgroundColor: '#eee' },
});

