// app/welcome.tsx
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to login after 4 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* StreamBox Logo Text */}
      <Text style={styles.logoText}>
        <Text style={styles.logoRed}>Stream</Text>
        <Text style={styles.logoWhite}>Box</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  logoText: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  logoRed: {
    color: '#E50914',
  },
  logoWhite: {
    color: '#fff',
  },
});
