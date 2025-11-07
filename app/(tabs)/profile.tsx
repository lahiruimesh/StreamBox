import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Profile() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('user').then(s => { if (s) setUser(JSON.parse(s)); });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Name: <Text style={styles.value}>{user?.name || 'Guest'}</Text></Text>
      <Text style={styles.label}>Email: <Text style={styles.value}>{user?.email || '-'}</Text></Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={{ color: '#fff' }}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 16, marginTop: 8 },
  value: { fontWeight: '600' },
  button: { marginTop: 20, backgroundColor: '#E50914', padding: 12, alignItems: 'center', borderRadius: 8 }
});
