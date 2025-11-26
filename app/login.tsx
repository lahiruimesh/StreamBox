import { authAPI } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        Alert.alert('Success', response.message || 'Login successful');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', response.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}><Text style={styles.titleRed}>StreamBox</Text> Login</Text>
      <TextInput 
        placeholder="Email" 
        placeholderTextColor="#666"
        style={styles.input} 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
      />
      <TextInput 
        placeholder="Password" 
        placeholderTextColor="#666"
        style={styles.input} 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.push('/register')}>
        <Text style={{ color: '#888', fontSize: 15 }}>Don't have an account? <Text style={{ color: '#E50914', fontWeight: '600' }}>Register</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#000' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, alignSelf: 'center', color: '#fff' },
  titleRed: { color: '#E50914' },
  input: { height: 52, borderWidth: 1, borderColor: '#333', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 6, paddingHorizontal: 16, marginBottom: 16, fontSize: 15 },
  button: { backgroundColor: '#E50914', height: 52, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
