import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(v => setDark(v === 'true'));
  }, []);

  const toggle = async (val: boolean) => {
    setDark(val);
    await AsyncStorage.setItem('darkMode', val ? 'true' : 'false');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text>Dark Mode</Text>
        <Switch value={dark} onValueChange={toggle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }
});
