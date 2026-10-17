import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Keyboard, SafeAreaView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth, onAuthStateChanged, signInWithCustomToken, signOut,
} from '@react-native-firebase/auth';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import {
  ReactNativeFirebaseAppCheckProvider, initializeAppCheck,
} from '@react-native-firebase/app-check';

const auth = getAuth();
const functions = getFunctions(getApp(), 'us-central1');

export default function App() {
  const [appCheckReady, setAppCheckReady] = useState(false);
  const [appCheckInstance, setAppCheckInstance] = useState(null);
  const [appCheckError, setAppCheckError] = useState('');
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function initializeSecurity() {
      try {
        const provider = new ReactNativeFirebaseAppCheckProvider();
        provider.configure({
          android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
          apple: { provider: 'debug' },
        });
        const instance = await initializeAppCheck(getApp(), {
          provider,
          isTokenAutoRefreshEnabled: true,
        });
        if (active) {
          setAppCheckInstance(instance);
          setAppCheckReady(true);
        }
      } catch (e) {
        console.error('[AppCheck] initialization failed', e);
        if (active) {
          setAppCheckError(e?.message || 'App Check initialize nahi hua.');
          setAppCheckReady(false);
        }
      }
    }
    initializeSecurity();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const login = async () => {
    Keyboard.dismiss();
    setError('');
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(normalized)) {
      setError('Access code exactly 5 characters ka hona chahiye.');
      return;
    }
    if (!appCheckReady) {
      setError('App Check ready nahi hai. Error: ' + (appCheckError || 'initializing'));
      return;
    }
    setBusy(true);
    try {
      const check = await appCheckInstance.getToken(true);
      if (!check?.token) throw new Error('App Check token nahi mila.');
      const loginWithAccessCode = httpsCallable(functions, 'loginWithAccessCode');
      const result = await loginWithAccessCode({ code: normalized });
      const customToken = result?.data?.customToken;
      if (!customToken) throw new Error('Server se custom token nahi mila.');
      await signInWithCustomToken(auth, customToken);
      setCode('');
    } catch (e) {
      console.error('[Android] access-code login failed', e);
      setError(e?.message || 'Login fail hua. Internet aur access code check karein.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try { await signOut(auth); }
    catch (e) { Alert.alert('Sign out failed', e?.message || 'Try again.'); }
  };

  if (!authReady || (!appCheckReady && !appCheckError)) {
    return <SafeAreaView style={styles.center}><StatusBar barStyle="light-content" /><ActivityIndicator size="large" color="#818cf8" /><Text style={styles.muted}>Secure setup loading…</Text></SafeAreaView>;
  }

  if (user) {
    return (
      <SafeAreaView style={styles.page}>
        <StatusBar barStyle="light-content" />
        <View style={styles.card}>
          <Text style={styles.eyebrow}>JEE 2027 • ANDROID</Text>
          <Text style={styles.title}>Welcome back, Saumya!</Text>
          <Text style={styles.body}>Login successful. Agle stage mein existing syllabus, study timer aur mock-test data connect karenge.</Text>
          <Text style={styles.small}>Firebase UID: {user.uid}</Text>
          <TouchableOpacity style={styles.buttonSecondary} onPress={logout}><Text style={styles.buttonText}>Sign out</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="light-content" />
      <View style={styles.card}>
        <View style={styles.logo}><Text style={styles.logoText}>SJ</Text></View>
        <Text style={styles.eyebrow}>SAUMYA'S PORTAL</Text>
        <Text style={styles.title}>JEE 2027</Text>
        <Text style={styles.body}>Apna approved 5-character access code enter karein.</Text>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
          placeholder="A7K2Q"
          placeholderTextColor="#64748b"
          maxLength={5}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
          textAlign="center"
          accessibilityLabel="Five character access code"
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!appCheckError && <Text style={styles.error}>App Check: {appCheckError}</Text>}
        <TouchableOpacity style={[styles.button, (busy || code.length !== 5 || !appCheckReady) && styles.disabled]} disabled={busy || code.length !== 5 || !appCheckReady} onPress={login}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login securely</Text>}
        </TouchableOpacity>
        <Text style={styles.footnote}>Protected by Firebase Authentication and App Check.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#080d1b', justifyContent: 'center', padding: 22 },
  center: { flex: 1, backgroundColor: '#080d1b', alignItems: 'center', justifyContent: 'center', gap: 14 },
  card: { width: '100%', maxWidth: 460, alignSelf: 'center', padding: 25, borderRadius: 26, backgroundColor: '#111a2e', borderWidth: 1, borderColor: '#27334c' },
  logo: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 20 },
  eyebrow: { color: '#a5b4fc', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 10 },
  body: { color: '#a7b4c9', fontSize: 14, lineHeight: 21, marginBottom: 18 },
  input: { borderRadius: 15, borderWidth: 1, borderColor: '#384660', backgroundColor: '#080d1b', color: '#fff', padding: 16, fontSize: 24, fontWeight: '800', letterSpacing: 8, marginBottom: 14 },
  button: { borderRadius: 15, backgroundColor: '#4f46e5', padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonSecondary: { borderRadius: 15, backgroundColor: '#26344e', padding: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  disabled: { opacity: 0.45 },
  error: { color: '#fda4af', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  footnote: { color: '#64748b', textAlign: 'center', fontSize: 11, marginTop: 16 },
  muted: { color: '#94a3b8', marginTop: 12 },
  small: { color: '#64748b', fontSize: 10, marginTop: 8 },
});
