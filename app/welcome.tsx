// app/welcome.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

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
      {/* Logo */}
      <Image
        source={require('../assets/images/StreamBox.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Welcome to StreamBox 🎬</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffff', // Netflix-style red
  },
  logo: {
    width: 200,  // adjust as needed
    height: 200,
    marginBottom: 20,
  },
  title: {
    color: '#000000ff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
