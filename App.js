import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from '@react-native-firebase/auth';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import {
  ReactNativeFirebaseAppCheckProvider,
  initializeAppCheck,
} from '@react-native-firebase/app-check';

import {
  SecureLoadingScreen, AccessCodeScreen, SecurityBlockedScreen, StudentDashboard,
} from './components/StudentDashboard';

const firebaseApp = getApp();
const auth = getAuth(firebaseApp);
const functions = getFunctions(firebaseApp, 'us-central1');
const db = getFirestore(firebaseApp);

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'study', label: 'Study', icon: '◷' },
  { key: 'syllabus', label: 'Syllabus', icon: '✓' },
  { key: 'tests', label: 'Tests', icon: '▣' },
  { key: 'reports', label: 'Reports', icon: '↗' },
];

const SYLLABUS_TOPICS = [
  { id: 'physics-units', subject: 'Physics', title: 'Units, dimensions & vectors' },
  { id: 'physics-kinematics', subject: 'Physics', title: 'Kinematics & laws of motion' },
  { id: 'physics-work-energy', subject: 'Physics', title: 'Work, energy & power' },
  { id: 'physics-electrostatics', subject: 'Physics', title: 'Electrostatics' },
  { id: 'physics-current-electricity', subject: 'Physics', title: 'Current electricity' },
  { id: 'chemistry-mole', subject: 'Chemistry', title: 'Mole concept & stoichiometry' },
  { id: 'chemistry-atomic', subject: 'Chemistry', title: 'Atomic structure' },
  { id: 'chemistry-bonding', subject: 'Chemistry', title: 'Chemical bonding' },
  { id: 'chemistry-equilibrium', subject: 'Chemistry', title: 'Chemical equilibrium' },
  { id: 'chemistry-organic-basics', subject: 'Chemistry', title: 'Organic chemistry basics' },
  { id: 'maths-sets', subject: 'Mathematics', title: 'Sets, relations & functions' },
  { id: 'maths-quadratic', subject: 'Mathematics', title: 'Quadratic equations' },
  { id: 'maths-trigonometry', subject: 'Mathematics', title: 'Trigonometry' },
  { id: 'maths-limits', subject: 'Mathematics', title: 'Limits & continuity' },
  { id: 'maths-differentiation', subject: 'Mathematics', title: 'Differentiation' },
];

const SUBJECT_ORDER = ['Physics', 'Chemistry', 'Mathematics'];
const SUBJECT_ACCENTS = { Physics: '#8b5cf6', Chemistry: '#14b8a6', Mathematics: '#f59e0b' };

function getDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds % 60}s`;
}

function formatCompactHours(totalSeconds = 0) {
  const hours = (Number(totalSeconds) || 0) / 3600;
  return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(hours >= 1 ? 1 : 0)}h`;
}

function formatDate(millis) {
  if (!millis) return 'Just now';
  const date = new Date(Number(millis));
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function sessionTimestamp(session) {
  return Number(session?.endedAtMillis || session?.startedAtMillis || session?.createdAtMillis || 0);
}

function errorMessage(error, fallback) {
  return error?.message || fallback;
}

export default function App() {
  const [appCheckReady, setAppCheckReady] = useState(false);
  const [appCheckInstance, setAppCheckInstance] = useState(null);
  const [appCheckError, setAppCheckError] = useState('');
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [studySessions, setStudySessions] = useState([]);
  const [syllabusState, setSyllabusState] = useState({});
  const [tests, setTests] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    let active = true;

    async function initializeSecurity() {
      try {
        const provider = new ReactNativeFirebaseAppCheckProvider();
        provider.configure({
          // Existing Android contract: debug in dev, Play Integrity in release.
          // A debug token is intentionally never stored in source.
          android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
          apple: { provider: 'debug' },
        });
        const instance = await initializeAppCheck(firebaseApp, {
          provider,
          isTokenAutoRefreshEnabled: true,
        });
        if (active) {
          setAppCheckInstance(instance);
          setAppCheckReady(true);
        }
      } catch (securityError) {
        console.error('[AppCheck] initialization failed', securityError);
        if (active) {
          setAppCheckError(errorMessage(securityError, 'App Check initialize nahi hua.'));
          setAppCheckReady(false);
        }
      }
    }

    initializeSecurity();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (active) {
        setUser(currentUser);
        setAuthReady(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid || !appCheckReady) {
      setStudySessions([]);
      setSyllabusState({});
      setTests([]);
      setDataLoading(false);
      return undefined;
    }

    let mounted = true;
    let readyStreams = 0;
    setDataLoading(true);
    setDataError('');

    const markReady = () => {
      readyStreams += 1;
      if (readyStreams === 3 && mounted) setDataLoading(false);
    };
    const handleSyncError = (syncError) => {
      console.warn('[Firestore] dashboard sync failed', syncError);
      if (mounted) {
        setDataError('Dashboard data abhi sync nahi ho pa raha. Internet aur access check karein.');
        setDataLoading(false);
      }
    };

    // Every read remains inside the authenticated user's own document tree.
    const sessionsRef = query(
      collection(db, 'users', user.uid, 'studySessions'),
      orderBy('endedAtMillis', 'desc'),
      limit(100),
    );
    const syllabusRef = collection(db, 'users', user.uid, 'syllabus');
    const testsRef = query(
      collection(db, 'users', user.uid, 'tests'),
      orderBy('takenAtMillis', 'desc'),
      limit(100),
    );

    const unsubscribeSessions = onSnapshot(
      sessionsRef,
      (snapshot) => {
        if (mounted) setStudySessions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        markReady();
      },
      handleSyncError,
    );
    const unsubscribeSyllabus = onSnapshot(
      syllabusRef,
      (snapshot) => {
        if (mounted) {
          const nextState = {};
          snapshot.docs.forEach((item) => { nextState[item.id] = item.data(); });
          setSyllabusState(nextState);
        }
        markReady();
      },
      handleSyncError,
    );
    const unsubscribeTests = onSnapshot(
      testsRef,
      (snapshot) => {
        if (mounted) setTests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        markReady();
      },
      handleSyncError,
    );

    return () => {
      mounted = false;
      unsubscribeSessions();
      unsubscribeSyllabus();
      unsubscribeTests();
    };
  }, [appCheckReady, user?.uid]);

  const login = async () => {
    Keyboard.dismiss();
    setError('');
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(normalized)) {
      setError('Access code exactly 5 characters ka hona chahiye.');
      return;
    }
    if (!appCheckReady || !appCheckInstance) {
      setError(`App Check ready nahi hai. Error: ${appCheckError || 'initializing'}`);
      return;
    }

    setBusy(true);
    try {
      // Preserve the existing secure sequence: force App Check token,
      // call loginWithAccessCode in us-central1, then sign in with the custom token.
      const check = await appCheckInstance.getToken(true);
      if (!check?.token) throw new Error('App Check token nahi mila.');
      const loginWithAccessCode = httpsCallable(functions, 'loginWithAccessCode');
      const result = await loginWithAccessCode({ code: normalized });
      const customToken = result?.data?.customToken;
      if (!customToken) throw new Error('Server se custom token nahi mila.');
      await signInWithCustomToken(auth, customToken);
      setCode('');
    } catch (loginError) {
      console.error('[Android] access-code login failed', loginError);
      setError(errorMessage(loginError, 'Login fail hua. Internet aur access code check karein.'));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (logoutError) {
      Alert.alert('Sign out failed', errorMessage(logoutError, 'Try again.'));
    }
  };

  if (!authReady || (!appCheckReady && !appCheckError)) return <SecureLoadingScreen />;
  if (!user) {
    return (
      <AccessCodeScreen
        appCheckError={appCheckError}
        appCheckReady={appCheckReady}
        busy={busy}
        code={code}
        error={error}
        onChangeCode={(value) => setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
        onLogin={login}
      />
    );
  }
  if (!appCheckReady) return <SecurityBlockedScreen error={appCheckError} onSignOut={logout} />;

  return (
    <StudentDashboard
      dataError={dataError}
      dataLoading={dataLoading}
      onSignOut={logout}
      studySessions={studySessions}
      syllabusState={syllabusState}
      tests={tests}
      user={user}
    />
  );
}

