import { authAPI } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Fill all fields');
    
    setLoading(true);
    try {
      const response = await authAPI.register(name, email, password);
      
      if (response.success) {
        Alert.alert('Success', response.message || 'Registration successful');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create <Text style={styles.titleRed}>StreamBox</Text> account</Text>
      <TextInput 
        placeholder="Name" 
        placeholderTextColor="#666"
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
      />
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
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#000' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, textAlign: 'center', color: '#fff' },
  titleRed: { color: '#E50914' },
  input: { height: 52, borderWidth: 1, borderColor: '#333', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 6, paddingHorizontal: 16, marginBottom: 16, fontSize: 15 },
  button: { backgroundColor: '#E50914', height: 52, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
