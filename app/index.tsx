import { Redirect } from 'expo-router';
import React from 'react';

// Redirect root URL to the login screen so the app starts on the login page.
export default function Index() {
  return <Redirect href="/welcome" />;
}
