import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import { getApp } from "@react-native-firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "@react-native-firebase/auth";
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";
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
} from "@react-native-firebase/firestore";
import {
  ReactNativeFirebaseAppCheckProvider,
  initializeAppCheck,
} from "@react-native-firebase/app-check";

const firebaseApp = getApp();
const auth = getAuth(firebaseApp);
const functions = getFunctions(firebaseApp, "us-central1");
const db = getFirestore(firebaseApp);

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "study", label: "Study", icon: "◷" },
  { key: "syllabus", label: "Syllabus", icon: "✓" },
  { key: "tests", label: "Tests", icon: "▣" },
  { key: "reports", label: "Reports", icon: "↗" },
];

const SYLLABUS_TOPICS = [
  {
    id: "physics-units",
    subject: "Physics",
    title: "Units, dimensions & vectors",
  },
  {
    id: "physics-kinematics",
    subject: "Physics",
    title: "Kinematics & laws of motion",
  },
  {
    id: "physics-work-energy",
    subject: "Physics",
    title: "Work, energy & power",
  },
  { id: "physics-electrostatics", subject: "Physics", title: "Electrostatics" },
  {
    id: "physics-current-electricity",
    subject: "Physics",
    title: "Current electricity",
  },
  {
    id: "chemistry-mole",
    subject: "Chemistry",
    title: "Mole concept & stoichiometry",
  },
  { id: "chemistry-atomic", subject: "Chemistry", title: "Atomic structure" },
  { id: "chemistry-bonding", subject: "Chemistry", title: "Chemical bonding" },
  {
    id: "chemistry-equilibrium",
    subject: "Chemistry",
    title: "Chemical equilibrium",
  },
  {
    id: "chemistry-organic-basics",
    subject: "Chemistry",
    title: "Organic chemistry basics",
  },
  {
    id: "maths-sets",
    subject: "Mathematics",
    title: "Sets, relations & functions",
  },
  {
    id: "maths-quadratic",
    subject: "Mathematics",
    title: "Quadratic equations",
  },
  { id: "maths-trigonometry", subject: "Mathematics", title: "Trigonometry" },
  { id: "maths-limits", subject: "Mathematics", title: "Limits & continuity" },
  {
    id: "maths-differentiation",
    subject: "Mathematics",
    title: "Differentiation",
  },
];

const SUBJECT_ORDER = ["Physics", "Chemistry", "Mathematics"];
const SUBJECT_ACCENTS = {
  Physics: "#8b5cf6",
  Chemistry: "#14b8a6",
  Mathematics: "#f59e0b",
};

function getDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
  return hours >= 10
    ? `${Math.round(hours)}h`
    : `${hours.toFixed(hours >= 1 ? 1 : 0)}h`;
}

function formatDate(millis) {
  if (!millis) return "Just now";
  const date = new Date(Number(millis));
  return Number.isNaN(date.getTime())
    ? "Recently"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function sessionTimestamp(session) {
  return Number(
    session?.endedAtMillis ||
      session?.startedAtMillis ||
      session?.createdAtMillis ||
      0,
  );
}

function errorMessage(error, fallback) {
  return error?.message || fallback;
}

// part 2

function sessionTimestamp(session) {
  return Number(
    session?.endedAtMillis ||
      session?.startedAtMillis ||
      session?.createdAtMillis ||
      0,
  );
}

function errorMessage(error, fallback) {
  return error?.message || fallback;
}

export default function App() {
  const [appCheckReady, setAppCheckReady] = useState(false);
  const [appCheckInstance, setAppCheckInstance] = useState(null);
  const [appCheckError, setAppCheckError] = useState("");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [studySessions, setStudySessions] = useState([]);
  const [syllabusState, setSyllabusState] = useState({});
  const [tests, setTests] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let active = true;

    async function initializeSecurity() {
      try {
        const provider = new ReactNativeFirebaseAppCheckProvider();
        provider.configure({
          // Debug in development; Play Integrity in release.
          // Never store a debug token in source code.
          android: { provider: __DEV__ ? "debug" : "playIntegrity" },
          apple: { provider: "debug" },
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
        console.error("[AppCheck] initialization failed", securityError);
        if (active) {
          setAppCheckError(
            errorMessage(securityError, "App Check initialize nahi hua."),
          );
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
    setDataError("");

    const markReady = () => {
      readyStreams += 1;
      if (readyStreams === 3 && mounted) setDataLoading(false);
    };
    const handleSyncError = (syncError) => {
      console.warn("[Firestore] dashboard sync failed", syncError);
      if (mounted) {
        setDataError(
          "Dashboard data abhi sync nahi ho pa raha. Internet aur access check karein.",
        );
        setDataLoading(false);
      }
    };

    // Every read remains inside the authenticated user's own document tree.
    const sessionsRef = query(
      collection(db, "users", user.uid, "studySessions"),
      orderBy("endedAtMillis", "desc"),
      limit(100),
    );
    const syllabusRef = collection(db, "users", user.uid, "syllabus");
    const testsRef = query(
      collection(db, "users", user.uid, "tests"),
      orderBy("takenAtMillis", "desc"),
      limit(100),
    );

    const unsubscribeSessions = onSnapshot(
      sessionsRef,
      (snapshot) => {
        if (mounted)
          setStudySessions(
            snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
          );
        markReady();
      },
      handleSyncError,
    );
    const unsubscribeSyllabus = onSnapshot(
      syllabusRef,
      (snapshot) => {
        if (mounted) {
          const nextState = {};
          snapshot.docs.forEach((item) => {
            nextState[item.id] = item.data();
          });
          setSyllabusState(nextState);
        }
        markReady();
      },
      handleSyncError,
    );
    const unsubscribeTests = onSnapshot(
      testsRef,
      (snapshot) => {
        if (mounted)
          setTests(
            snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
          );
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
    setError("");
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(normalized)) {
      setError("Access code exactly 5 characters ka hona chahiye.");
      return;
    }
    if (!appCheckReady || !appCheckInstance) {
      setError(
        `App Check ready nahi hai. Error: ${appCheckError || "initializing"}`,
      );
      return;
    }

    setBusy(true);
    try {
      // Preserve the existing secure sequence: force App Check token,
      // call loginWithAccessCode in us-central1, then sign in with the custom token.
      const check = await appCheckInstance.getToken(true);
      if (!check?.token) throw new Error("App Check token nahi mila.");
      const loginWithAccessCode = httpsCallable(
        functions,
        "loginWithAccessCode",
      );
      const result = await loginWithAccessCode({ code: normalized });
      const customToken = result?.data?.customToken;
      if (!customToken) throw new Error("Server se custom token nahi mila.");
      await signInWithCustomToken(auth, customToken);
      setCode("");
    } catch (loginError) {
      console.error("[Android] access-code login failed", loginError);
      setError(
        errorMessage(
          loginError,
          "Login fail hua. Internet aur access code check karein.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (logoutError) {
      Alert.alert("Sign out failed", errorMessage(logoutError, "Try again."));
    }
  };

  if (!authReady || (!appCheckReady && !appCheckError))
    return <SecureLoadingScreen />;
  if (!user) {
    return (
      <AccessCodeScreen
        appCheckError={appCheckError}
        appCheckReady={appCheckReady}
        busy={busy}
        code={code}
        error={error}
        onChangeCode={(value) =>
          setCode(
            value
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")
              .slice(0, 5),
          )
        }
        onLogin={login}
      />
    );
  }
  if (!appCheckReady)
    return <SecurityBlockedScreen error={appCheckError} onSignOut={logout} />;

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

function SecureLoadingScreen() {
  return (
    <SafeAreaView style={styles.centerPage}>
      <StatusBar backgroundColor="#080d1b" barStyle="light-content" />
      <View style={styles.loadingMark}>
        <Text style={styles.loadingMarkText}>J</Text>
      </View>
      <ActivityIndicator color="#a5b4fc" size="large" />
      <Text style={styles.loadingTitle}>Secure setup loading…</Text>
      <Text style={styles.loadingCopy}>
        App Check aur account session verify ho raha hai.
      </Text>
    </SafeAreaView>
  );
}

function AccessCodeScreen({
  appCheckError,
  appCheckReady,
  busy,
  code,
  error,
  onChangeCode,
  onLogin,
}) {
  return (
    <SafeAreaView style={styles.loginPage}>
      <StatusBar backgroundColor="#080d1b" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.loginScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginOrbOne} />
          <View style={styles.loginOrbTwo} />
          <View style={styles.loginCard}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>JI</Text>
            </View>
            <Text style={styles.eyebrow}>SAUMYA'S PORTAL</Text>
            <Text style={styles.loginTitle}>JEEtoIIT</Text>
            <Text style={styles.loginSubtitle}>
              JEE 2027 ke liye apna approved 5-character access code enter
              karein.
            </Text>
            <Text style={styles.inputLabel}>ACCESS CODE</Text>
            <TextInput
              accessibilityLabel="Five character access code"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              maxLength={5}
              onChangeText={onChangeCode}
              onSubmitEditing={onLogin}
              placeholder="A7K2Q"
              placeholderTextColor="#64748b"
              returnKeyType="done"
              style={styles.accessCodeInput}
              textAlign="center"
              value={code}
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {!!appCheckError && (
              <Text style={styles.errorText}>App Check: {appCheckError}</Text>
            )}
            <TouchableOpacity
              accessibilityRole="button"
              disabled={busy || code.length !== 5 || !appCheckReady}
              onPress={onLogin}
              style={[
                styles.primaryButton,
                (busy || code.length !== 5 || !appCheckReady) &&
                  styles.buttonDisabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Login securely</Text>
              )}
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Text style={styles.securityNoteIcon}>⌁</Text>
              <Text style={styles.securityNoteText}>
                Protected by Firebase Authentication and App Check
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SecurityBlockedScreen({ error, onSignOut }) {
  return (
    <SafeAreaView style={styles.centerPage}>
      <StatusBar backgroundColor="#080d1b" barStyle="light-content" />
      <View style={styles.securityBlockCard}>
        <Text style={styles.securityBlockIcon}>!</Text>
        <Text style={styles.securityBlockTitle}>Security check required</Text>
        <Text style={styles.securityBlockCopy}>
          {error || "App Check verify nahi ho saka."}
        </Text>
        <Text style={styles.securityBlockHint}>
          Dashboard tab tak load nahi hoga jab tak App Check ready nahi hota.
        </Text>
        <TouchableOpacity onPress={onSignOut} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({ name, onNavigate, summary }) {
  const recentSession = summary.recentSessions[0];
  const nextTopic = SYLLABUS_TOPICS.find(
    (topic) => !summary.completedTopicIds.has(topic.id),
  );

  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroOverline}>NAMASTE, {name.toUpperCase()}</Text>
        <Text style={styles.heroTitle}>
          Small focused sessions{"\n"}become a rank.
        </Text>
        <Text style={styles.heroCopy}>
          Aaj ka progress save hota hai, isliye next session choose karna easy
          rahega.
        </Text>
        <TouchableOpacity
          onPress={() => onNavigate("study")}
          style={styles.heroAction}
        >
          <Text style={styles.heroActionText}>Start today’s focus</Text>
          <Text style={styles.heroActionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Today at a glance</Text>
        <Text style={styles.sectionHeadingMeta}>{getDayKey()}</Text>
      </View>

      <View style={styles.metricGrid}>
        <MetricCard
          accent="#8b5cf6"
          label="Study time"
          value={formatDuration(summary.todaySeconds)}
        />
        <MetricCard
          accent="#14b8a6"
          label="Syllabus"
          value={`${summary.completedTopics}/${SYLLABUS_TOPICS.length}`}
        />
        <MetricCard
          accent="#f59e0b"
          label="Test average"
          value={
            summary.testAverage === null
              ? "—"
              : `${Math.round(summary.testAverage)}%`
          }
        />
      </View>

      <Text style={styles.sectionHeading}>Continue momentum</Text>

      <View style={styles.nextStepCard}>
        <View
          style={[
            styles.nextStepIcon,
            {
              backgroundColor: SUBJECT_ACCENTS[nextTopic?.subject] || "#334155",
            },
          ]}
        >
          <Text style={styles.nextStepIconText}>
            {nextTopic?.subject?.charAt(0) || "✓"}
          </Text>
        </View>
        <View style={styles.nextStepTextWrap}>
          <Text style={styles.nextStepLabel}>
            {nextTopic
              ? `NEXT • ${nextTopic.subject.toUpperCase()}`
              : "SYLLABUS COMPLETE"}
          </Text>
          <Text style={styles.nextStepTitle}>
            {nextTopic?.title || "Great work — revise completed chapters."}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onNavigate("syllabus")}
          style={styles.smallRoundButton}
        >
          <Text style={styles.smallRoundButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeading}>Quick actions</Text>
      <View style={styles.quickActionRow}>
        <QuickAction
          icon="◷"
          label="Study"
          onPress={() => onNavigate("study")}
        />
        <QuickAction
          icon="✓"
          label="Checklist"
          onPress={() => onNavigate("syllabus")}
        />
        <QuickAction
          icon="+"
          label="Score"
          onPress={() => onNavigate("tests")}
        />
      </View>

      <Text style={styles.sectionHeading}>Recent activity</Text>
      <View style={styles.activityCard}>
        {recentSession ? (
          <ActivityRow
            detail={`${recentSession.mode === "active" ? "Active" : "Passive"} session • ${formatDate(sessionTimestamp(recentSession))}`}
            icon="◷"
            title={`${formatDuration(recentSession.durationSeconds)} studied`}
          />
        ) : (
          <ActivityRow
            detail="Timer start karke first session save karein."
            icon="✦"
            title="No study session yet"
          />
        )}

        {summary.recentTests[0] ? (
          <ActivityRow
            detail={`${summary.recentTests[0].type || "Test"} • ${formatDate(summary.recentTests[0].takenAtMillis)}`}
            icon="▣"
            title={`${summary.recentTests[0].scorePercent}% in ${summary.recentTests[0].name}`}
          />
        ) : (
          <ActivityRow
            detail="Mock ya PYQ performance add karein."
            icon="▣"
            title="No test score yet"
          />
        )}
      </View>
    </>
  );
}

function StudyScreen({
  elapsedSeconds,
  mode,
  onChangeMode,
  onPause,
  onReset,
  onSave,
  onStart,
  running,
  saving,
  summary,
}) {
  const lockMode = elapsedSeconds > 0;

  return (
    <>
      <ScreenIntro
        eyebrow="FOCUS LAB"
        text="Active learning ya passive revision ka session track karein. Save hote hi report update ho jayegi."
        title="Study with intent"
      />

      <View style={styles.timerCard}>
        <View style={styles.timerCardHeader}>
          <Text style={styles.timerCardLabel}>
            {mode === "active" ? "ACTIVE LEARNING" : "PASSIVE REVISION"}
          </Text>
          <View style={[styles.livePill, running && styles.livePillActive]}>
            <View style={[styles.liveDot, running && styles.liveDotActive]} />
            <Text style={styles.livePillText}>
              {running ? "RUNNING" : "READY"}
            </Text>
          </View>
        </View>

        <Text style={styles.timerValue}>{formatTimer(elapsedSeconds)}</Text>
        <Text style={styles.timerHelper}>
          {running
            ? "Timer is accurately counting the current session."
            : "Start when you are ready to focus."}
        </Text>

        <View style={styles.modeToggle}>
          {["active", "passive"].map((item) => {
            const selected = mode === item;

            return (
              <TouchableOpacity
                disabled={lockMode}
                key={item}
                onPress={() => onChangeMode(item)}
                style={[
                  styles.modeOption,
                  selected && styles.modeOptionSelected,
                  lockMode && !selected && styles.modeOptionLocked,
                ]}
              >
                <Text
                  style={[
                    styles.modeOptionText,
                    selected && styles.modeOptionTextSelected,
                  ]}
                >
                  {item === "active" ? "Active" : "Passive"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {lockMode && (
          <Text style={styles.timerModeHint}>
            Mode is locked until you save or reset this session.
          </Text>
        )}

        <View style={styles.timerActions}>
          <TouchableOpacity
            onPress={running ? onPause : onStart}
            style={styles.timerMainButton}
          >
            <Text style={styles.timerMainButtonText}>
              {running
                ? "Pause session"
                : elapsedSeconds > 0
                  ? "Resume session"
                  : "Start focus"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={elapsedSeconds === 0 || saving}
            onPress={onReset}
            style={[
              styles.timerIconButton,
              elapsedSeconds === 0 && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.timerIconButtonText}>↺</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={elapsedSeconds === 0 || saving}
          onPress={onSave}
          style={[
            styles.saveSessionButton,
            (elapsedSeconds === 0 || saving) && styles.buttonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#bfdbfe" />
          ) : (
            <Text style={styles.saveSessionButtonText}>
              Save session to dashboard
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.twoColumnRow}>
        <MiniInsight
          label="This week"
          value={formatDuration(summary.weekSeconds)}
        />
        <MiniInsight
          label="Active focus"
          value={formatDuration(summary.activeSeconds)}
        />
      </View>

      <View style={styles.studyTipCard}>
        <Text style={styles.studyTipIcon}>✦</Text>
        <View style={styles.flex}>
          <Text style={styles.studyTipTitle}>How to use modes</Text>
          <Text style={styles.studyTipText}>
            Active = questions, recall and problem solving. Passive = lecture,
            notes or revision.
          </Text>
        </View>
      </View>
    </>
  );
}
function SyllabusScreen({ onToggleTopic, syllabusState, summary }) {
  return (
    <>
      <ScreenIntro
        eyebrow="SYLLABUS MAP"
        text="Checklist is private to your signed-in UID and syncs across your own sessions."
        title="One topic at a time"
      />

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>OVERALL COMPLETION</Text>
            <Text style={styles.progressValue}>
              {summary.completedTopics}{" "}
              <Text style={styles.progressValueMuted}>
                / {SYLLABUS_TOPICS.length}
              </Text>
            </Text>
          </View>
          <Text style={styles.progressPercent}>{summary.syllabusPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${summary.syllabusPercent}%` },
            ]}
          />
        </View>
      </View>

      {SUBJECT_ORDER.map((subject) => {
        const topics = SYLLABUS_TOPICS.filter(
          (topic) => topic.subject === subject,
        );
        const doneCount = topics.filter(
          (topic) => syllabusState[topic.id]?.done,
        ).length;

        return (
          <View key={subject} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View style={styles.subjectNameWrap}>
                <View
                  style={[
                    styles.subjectDot,
                    { backgroundColor: SUBJECT_ACCENTS[subject] },
                  ]}
                />
                <Text style={styles.subjectName}>{subject}</Text>
              </View>
              <Text style={styles.subjectCount}>
                {doneCount}/{topics.length}
              </Text>
            </View>

            {topics.map((topic) => {
              const done = Boolean(syllabusState[topic.id]?.done);

              return (
                <TouchableOpacity
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  key={topic.id}
                  onPress={() => onToggleTopic(topic)}
                  style={styles.topicRow}
                >
                  <View style={[styles.checkbox, done && styles.checkboxDone]}>
                    {done ? <Text style={styles.checkboxTick}>✓</Text> : null}
                  </View>
                  <Text
                    style={[styles.topicTitle, done && styles.topicTitleDone]}
                  >
                    {topic.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </>
  );
}

function TestsScreen({
  onChangeName,
  onChangeScore,
  onChangeType,
  onSave,
  saving,
  score,
  testName,
  tests,
  type,
}) {
  return (
    <>
      <ScreenIntro
        eyebrow="TEST LOG"
        text="Mock aur PYQ score history se trend dekhiye, sirf ek single result nahi."
        title="Make every test useful"
      />

      <View style={styles.testEntryCard}>
        <Text style={styles.formTitle}>Add test result</Text>
        <Text style={styles.inputLabel}>TEST TYPE</Text>

        <View style={styles.segmentedControl}>
          {["Mock Test", "PYQ"].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => onChangeType(option)}
              style={[
                styles.segment,
                type === option && styles.segmentSelected,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  type === option && styles.segmentTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>TEST NAME (OPTIONAL)</Text>
        <TextInput
          onChangeText={onChangeName}
          placeholder="e.g. Electrostatics mock"
          placeholderTextColor="#64748b"
          style={styles.formInput}
          value={testName}
        />

        <Text style={styles.inputLabel}>SCORE (%)</Text>
        <TextInput
          keyboardType="decimal-pad"
          maxLength={5}
          onChangeText={onChangeScore}
          placeholder="72"
          placeholderTextColor="#64748b"
          style={styles.formInput}
          value={score}
        />

        <TouchableOpacity
          disabled={saving || !score}
          onPress={onSave}
          style={[
            styles.primaryButton,
            (saving || !score) && styles.buttonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save score</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Score history</Text>
        <Text style={styles.sectionHeadingMeta}>{tests.length} saved</Text>
      </View>

      <View style={styles.historyCard}>
        {tests.length ? (
          tests.slice(0, 12).map((test) => (
            <View key={test.id} style={styles.testHistoryRow}>
              <View
                style={[
                  styles.testTypeDot,
                  test.type === "PYQ" && styles.testTypeDotPyq,
                ]}
              />
              <View style={styles.testHistoryText}>
                <Text numberOfLines={1} style={styles.testHistoryTitle}>
                  {test.name || test.type || "Test"}
                </Text>
                <Text style={styles.testHistoryMeta}>
                  {test.type || "Mock Test"} • {formatDate(test.takenAtMillis)}
                </Text>
              </View>
              <Text style={styles.testScore}>
                {Math.round(Number(test.scorePercent) || 0)}%
              </Text>
            </View>
          ))
        ) : (
          <EmptyState
            icon="▣"
            text="First mock ya PYQ score add karein — report yahin banegi."
          />
        )}
      </View>
    </>
  );
}

function ReportsScreen({ summary, tests }) {
  const maxDaySeconds = Math.max(
    ...summary.weekDays.map((day) => day.seconds),
    1,
  );
  const recentScores = tests.slice(0, 5).reverse();

  return (
    <>
      <ScreenIntro
        eyebrow="PROGRESS REPORT"
        text="Study sessions aur saved test scores ka clear, personal snapshot."
        title="See the signal"
      />

      <View style={styles.reportMetricGrid}>
        <ReportMetric
          accent="#8b5cf6"
          label="7-day study"
          value={formatCompactHours(summary.weekSeconds)}
        />
        <ReportMetric
          accent="#14b8a6"
          label="Test average"
          value={
            summary.testAverage === null
              ? "—"
              : `${Math.round(summary.testAverage)}%`
          }
        />
        <ReportMetric
          accent="#f59e0b"
          label="Best score"
          value={
            summary.bestScore === null
              ? "—"
              : `${Math.round(summary.bestScore)}%`
          }
        />
        <ReportMetric
          accent="#fb7185"
          label="Sessions"
          value={String(summary.totalSessions)}
        />
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Study time</Text>
            <Text style={styles.chartSubtext}>Last 7 days</Text>
          </View>
          <Text style={styles.chartTotal}>
            {formatDuration(summary.weekSeconds)}
          </Text>
        </View>

        <View style={styles.barChart}>
          {summary.weekDays.map((day) => (
            <View key={day.key} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(
                        7,
                        Math.round((day.seconds / maxDaySeconds) * 100),
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.reportSplitCard}>
        <View style={styles.reportSplitItem}>
          <Text style={styles.reportSplitLabel}>ACTIVE</Text>
          <Text style={styles.reportSplitValue}>
            {formatDuration(summary.activeSeconds)}
          </Text>
        </View>
        <View style={styles.reportDivider} />
        <View style={styles.reportSplitItem}>
          <Text style={styles.reportSplitLabel}>PASSIVE</Text>
          <Text style={styles.reportSplitValue}>
            {formatDuration(summary.passiveSeconds)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>Recent score trend</Text>
      <View style={styles.scoreTrendCard}>
        {recentScores.length ? (
          recentScores.map((test) => (
            <View key={test.id} style={styles.scoreTrendRow}>
              <Text numberOfLines={1} style={styles.scoreTrendName}>
                {test.type === "PYQ" ? "PYQ" : "Mock"}
              </Text>
              <View style={styles.scoreTrendTrack}>
                <View
                  style={[
                    styles.scoreTrendFill,
                    {
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(test.scorePercent) || 0),
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreTrendValue}>
                {Math.round(Number(test.scorePercent) || 0)}%
              </Text>
            </View>
          ))
        ) : (
          <EmptyState
            icon="↗"
            text="Score history save karne ke baad trend dikhega."
          />
        )}
      </View>
    </>
  );
}

function ProfileScreen({ onSignOut, user }) {
  return (
    <>
      <ScreenIntro
        eyebrow="YOUR PROFILE"
        text="Yeh app dashboard data ko authenticated Firebase UID ke under hi read aur write karta hai."
        title="Private by design"
      />

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {(user?.displayName || "S").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.profileName}>{user?.displayName || "Saumya"}</Text>
        <Text style={styles.profileRole}>JEE 2027 aspirant</Text>
        <Text selectable style={styles.uidText}>
          UID: {user?.uid}
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Security status</Text>
      <View style={styles.securityListCard}>
        <SecurityRow
          icon="✓"
          text="App Check: debug in dev, Play Integrity in release"
        />
        <SecurityRow
          icon="✓"
          text="Login callable: loginWithAccessCode in us-central1"
        />
        <SecurityRow icon="✓" text="Dashboard data: /users/{uid}/… only" />
      </View>

      <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutButtonText}>Sign out securely</Text>
      </TouchableOpacity>

      <Text style={styles.profileFootnote}>
        Sign out ke baad locally cached Firebase session bhi close ho jayega.
      </Text>
    </>
  );
}

function ScreenIntro({ eyebrow, text, title }) {
  return (
    <View style={styles.screenIntro}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.screenIntroTitle}>{title}</Text>
      <Text style={styles.screenIntroText}>{text}</Text>
    </View>
  );
}

function MetricCard({ accent, label, value }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricAccent, { backgroundColor: accent }]} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.quickAction}>
      <View style={styles.quickActionIconWrap}>
        <Text style={styles.quickActionIcon}>{icon}</Text>
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActivityRow({ detail, icon, title }) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityIconWrap}>
        <Text style={styles.activityIcon}>{icon}</Text>
      </View>
      <View style={styles.activityTextWrap}>
        <Text numberOfLines={1} style={styles.activityTitle}>
          {title}
        </Text>
        <Text style={styles.activityDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function MiniInsight({ label, value }) {
  return (
    <View style={styles.miniInsight}>
      <Text style={styles.miniInsightLabel}>{label}</Text>
      <Text style={styles.miniInsightValue}>{value}</Text>
    </View>
  );
}

function ReportMetric({ accent, label, value }) {
  return (
    <View style={styles.reportMetric}>
      <View style={[styles.reportMetricDot, { backgroundColor: accent }]} />
      <Text style={styles.reportMetricValue}>{value}</Text>
      <Text style={styles.reportMetricLabel}>{label}</Text>
    </View>
  );
}

function SecurityRow({ icon, text }) {
  return (
    <View style={styles.securityRow}>
      <View style={styles.securityRowIcon}>
        <Text style={styles.securityRowIconText}>{icon}</Text>
      </View>
      <Text style={styles.securityRowText}>{text}</Text>
    </View>
  );
}

function EmptyState({ icon, text }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}

function formatTimer(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const remaining = String(seconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${remaining}`;
}

function buildSummary(studySessions, syllabusState, tests) {
  const now = new Date();
  const todayKey = getDayKey(now);
  const sevenDaysAgo = new Date(now);

  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const sessions = [...studySessions].sort(
    (a, b) => sessionTimestamp(b) - sessionTimestamp(a),
  );

  const sumDuration = (items) =>
    items.reduce(
      (total, item) => total + (Number(item.durationSeconds) || 0),
      0,
    );

  const totalSeconds = sumDuration(sessions);

  const todaySeconds = sumDuration(
    sessions.filter((session) => session.dayKey === todayKey),
  );

  const weekSeconds = sumDuration(
    sessions.filter(
      (session) => sessionTimestamp(session) >= sevenDaysAgo.getTime(),
    ),
  );

  const activeSeconds = sumDuration(
    sessions.filter((session) => session.mode === "active"),
  );

  const passiveSeconds = sumDuration(
    sessions.filter((session) => session.mode === "passive"),
  );

  const completedTopicIds = new Set(
    Object.entries(syllabusState)
      .filter(([, value]) => Boolean(value?.done))
      .map(([id]) => id),
  );

  const completedTopics = completedTopicIds.size;

  const numericScores = tests
    .map((test) => Number(test.scorePercent))
    .filter((score) => Number.isFinite(score));

  const testAverage = numericScores.length
    ? numericScores.reduce((total, score) => total + score, 0) /
      numericScores.length
    : null;

  const bestScore = numericScores.length ? Math.max(...numericScores) : null;

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + index);

    const key = getDayKey(date);

    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: "narrow" }),
      seconds: sumDuration(
        sessions.filter((session) => session.dayKey === key),
      ),
    };
  });

  return {
    activeSeconds,
    bestScore,
    completedTopicIds,
    completedTopics,
    passiveSeconds,
    recentSessions: sessions.slice(0, 4),
    recentTests: [...tests]
      .sort(
        (a, b) => Number(b.takenAtMillis || 0) - Number(a.takenAtMillis || 0),
      )
      .slice(0, 4),
    syllabusPercent: SYLLABUS_TOPICS.length
      ? Math.round((completedTopics / SYLLABUS_TOPICS.length) * 100)
      : 0,
    testAverage,
    todaySeconds,
    totalSeconds,
    totalSessions: sessions.length,
    weekDays,
    weekSeconds,
  };
}

  nextStepLabel: { color: '#8290aa', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginBottom: 3 },
  nextStepTitle: { color: '#edf2f9', fontSize: 12, fontWeight: '700', lineHeight: 17 },
  smallRoundButton: { alignItems: 'center', backgroundColor: '#26344e', borderRadius: 14, height: 28, justifyContent: 'center', width: 28 },
  smallRoundButtonText: { color: '#dbeafe', fontSize: 16, fontWeight: '900' },
  quickActionRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickAction: { alignItems: 'center', backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 15, borderWidth: 1, flex: 1, paddingVertical: 14 },
  quickActionIconWrap: { alignItems: 'center', backgroundColor: '#202d48', borderRadius: 12, height: 34, justifyContent: 'center', width: 34 },
  quickActionIcon: { color: '#c7d2fe', fontSize: 17, fontWeight: '900' },
  quickActionLabel: { color: '#cbd5e1', fontSize: 11, fontWeight: '800', marginTop: 8 },
  activityCard: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 16, borderWidth: 1, marginBottom: 6, overflow: 'hidden' },
  activityRow: { alignItems: 'center', borderBottomColor: '#20304a', borderBottomWidth: 1, flexDirection: 'row', minHeight: 68, paddingHorizontal: 13 },
  activityIconWrap: { alignItems: 'center', backgroundColor: '#202d48', borderRadius: 12, height: 35, justifyContent: 'center', width: 35 },
  activityIcon: { color: '#a5b4fc', fontSize: 16, fontWeight: '900' },
  activityTextWrap: { flex: 1, marginLeft: 11 },
  activityTitle: { color: '#e5eaf3', fontSize: 12, fontWeight: '800' },
  activityDetail: { color: '#8290aa', fontSize: 10, marginTop: 4 },
  screenIntro: { marginBottom: 21, paddingTop: 3 },
  screenIntroTitle: { color: '#f8fafc', fontSize: 27, fontWeight: '900', letterSpacing: -0.8, marginBottom: 7 },
  screenIntroText: { color: '#9aa8bd', fontSize: 13, lineHeight: 20 },
  timerCard: { backgroundColor: '#151b35', borderColor: '#3a3e77', borderRadius: 23, borderWidth: 1, marginBottom: 15, padding: 20 },
  timerCardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  timerCardLabel: { color: '#a5b4fc', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  livePill: { alignItems: 'center', backgroundColor: '#1d2a42', borderRadius: 10, flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 5 },
  livePillActive: { backgroundColor: '#153c38' },
  liveDot: { backgroundColor: '#64748b', borderRadius: 4, height: 7, marginRight: 5, width: 7 },
  liveDotActive: { backgroundColor: '#2dd4bf' },
  livePillText: { color: '#cbd5e1', fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  timerValue: { color: '#fff', fontSize: 44, fontVariant: ['tabular-nums'], fontWeight: '900', letterSpacing: -1.7, marginTop: 26, textAlign: 'center' },
  timerHelper: { color: '#8796ae', fontSize: 12, marginTop: 5, textAlign: 'center' },
  modeToggle: { backgroundColor: '#0c1324', borderRadius: 14, flexDirection: 'row', marginTop: 23, padding: 4 },
  modeOption: { alignItems: 'center', borderRadius: 10, flex: 1, paddingVertical: 10 },
  modeOptionSelected: { backgroundColor: '#4f46e5' },
  modeOptionLocked: { opacity: 0.45 },
  modeOptionText: { color: '#90a0b8', fontSize: 12, fontWeight: '800' },
  modeOptionTextSelected: { color: '#fff' },
  timerModeHint: { color: '#71809a', fontSize: 10, marginTop: 8, textAlign: 'center' },
  timerActions: { flexDirection: 'row', gap: 10, marginTop: 17 },
  timerMainButton: { alignItems: 'center', backgroundColor: '#6366f1', borderRadius: 13, flex: 1, justifyContent: 'center', minHeight: 49 },
  timerMainButtonText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  timerIconButton: { alignItems: 'center', backgroundColor: '#26344e', borderRadius: 13, justifyContent: 'center', width: 51 },
  timerIconButtonText: { color: '#dbeafe', fontSize: 21, fontWeight: '900' },
  saveSessionButton: { alignItems: 'center', backgroundColor: '#172554', borderColor: '#334b89', borderRadius: 13, borderWidth: 1, justifyContent: 'center', marginTop: 10, minHeight: 47 },
  saveSessionButtonText: { color: '#bfdbfe', fontSize: 12, fontWeight: '900' },
  twoColumnRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  miniInsight: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 15, borderWidth: 1, flex: 1, padding: 14 },
  miniInsightLabel: { color: '#8290aa', fontSize: 10, fontWeight: '700' },
  miniInsightValue: { color: '#f8fafc', fontSize: 18, fontWeight: '900', marginTop: 6 },
  studyTipCard: { alignItems: 'flex-start', backgroundColor: '#102d2e', borderColor: '#20504f', borderRadius: 16, borderWidth: 1, flexDirection: 'row', padding: 14 },
  studyTipIcon: { color: '#5eead4', fontSize: 18, marginRight: 10 },
  studyTipTitle: { color: '#ccfbf1', fontSize: 12, fontWeight: '900', marginBottom: 4 },
  studyTipText: { color: '#94c7c1', fontSize: 11, lineHeight: 17 },
  progressCard: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 17, borderWidth: 1, marginBottom: 16, padding: 16 },
  progressHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  progressLabel: { color: '#8290aa', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  progressValue: { color: '#fff', fontSize: 27, fontWeight: '900', marginTop: 4 },
  progressValueMuted: { color: '#8290aa', fontSize: 15 },
  progressPercent: { color: '#a5b4fc', fontSize: 20, fontWeight: '900' },
  progressTrack: { backgroundColor: '#24324c', borderRadius: 5, height: 8, overflow: 'hidden' },
  progressFill: { backgroundColor: '#6366f1', borderRadius: 5, height: '100%' },
  subjectCard: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 17, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  subjectHeader: { alignItems: 'center', borderBottomColor: '#22314b', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 14 },
  subjectNameWrap: { alignItems: 'center', flexDirection: 'row' },
  subjectDot: { borderRadius: 5, height: 9, marginRight: 8, width: 9 },
  subjectName: { color: '#e9eef8', fontSize: 13, fontWeight: '900' },
  subjectCount: { color: '#8290aa', fontSize: 11, fontWeight: '700' },
  topicRow: { alignItems: 'center', borderBottomColor: '#1e2b42', borderBottomWidth: 1, flexDirection: 'row', minHeight: 52, paddingHorizontal: 15 },
  checkbox: { alignItems: 'center', borderColor: '#4c5b74', borderRadius: 7, borderWidth: 1, height: 20, justifyContent: 'center', marginRight: 11, width: 20 },
  checkboxDone: { backgroundColor: '#14b8a6', borderColor: '#2dd4bf' },
  checkboxTick: { color: '#072e2a', fontSize: 13, fontWeight: '900' },
  topicTitle: { color: '#cbd5e1', flex: 1, fontSize: 12, lineHeight: 17 },
  topicTitleDone: { color: '#71809a', textDecorationLine: 'line-through' },
  testEntryCard: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 18, borderWidth: 1, marginBottom: 23, padding: 16 },
  formTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '900', marginBottom: 16 },
  segmentedControl: { backgroundColor: '#0c1324', borderRadius: 12, flexDirection: 'row', marginBottom: 16, padding: 4 },
  segment: { alignItems: 'center', borderRadius: 9, flex: 1, paddingVertical: 9 },
  segmentSelected: { backgroundColor: '#3942b7' },
  segmentText: { color: '#8290aa', fontSize: 12, fontWeight: '800' },
  segmentTextSelected: { color: '#fff' },
  historyCard: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 17, borderWidth: 1, marginBottom: 5, overflow: 'hidden' },
  testHistoryRow: { alignItems: 'center', borderBottomColor: '#20304a', borderBottomWidth: 1, flexDirection: 'row', minHeight: 63, paddingHorizontal: 14 },
  testTypeDot: { backgroundColor: '#8b5cf6', borderRadius: 5, height: 10, marginRight: 10, width: 10 },
  testTypeDotPyq: { backgroundColor: '#14b8a6' },
  testHistoryText: { flex: 1, marginRight: 8 },
  testHistoryTitle: { color: '#e5eaf3', fontSize: 12, fontWeight: '800' },
  testHistoryMeta: { color: '#8290aa', fontSize: 10, marginTop: 4 },
  testScore: { color: '#fcd34d', fontSize: 18, fontWeight: '900' },
  reportMetricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 13 },
  reportMetric: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 15, borderWidth: 1, minHeight: 94, padding: 13, width: '48.5%' },
  reportMetricDot: { borderRadius: 3, height: 5, marginBottom: 11, width: 20 },
  reportMetricValue: { color: '#f8fafc', fontSize: 21, fontWeight: '900' },
  reportMetricLabel: { color: '#8290aa', fontSize: 10, marginTop: 7 },
  chartCard: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 18, borderWidth: 1, marginBottom: 12, padding: 16 },
  chartHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  chartTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '900' },
  chartSubtext: { color: '#8290aa', fontSize: 10, marginTop: 4 },
  chartTotal: { color: '#a5b4fc', fontSize: 16, fontWeight: '900' },
  barChart: { alignItems: 'flex-end', flexDirection: 'row', height: 137, justifyContent: 'space-between', paddingHorizontal: 2 },
  barColumn: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  barTrack: { backgroundColor: '#1f2d48', borderRadius: 5, height: 104, justifyContent: 'flex-end', overflow: 'hidden', width: 15 },
  barFill: { backgroundColor: '#706cf4', borderRadius: 5, width: '100%' },
  barLabel: { color: '#8290aa', fontSize: 9, marginTop: 8 },
  reportSplitCard: { alignItems: 'center', backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 17, borderWidth: 1, flexDirection: 'row', marginBottom: 24, padding: 16 },
  reportSplitItem: { flex: 1 },
  reportSplitLabel: { color: '#8290aa', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  reportSplitValue: { color: '#e8edf7', fontSize: 17, fontWeight: '900', marginTop: 6 },
  reportDivider: { backgroundColor: '#2a3953', height: 31, width: 1 },
  scoreTrendCard: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 17, borderWidth: 1, marginBottom: 4, padding: 14 },
  scoreTrendRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 13 },
  scoreTrendName: { color: '#cbd5e1', fontSize: 10, fontWeight: '800', width: 42 },
  scoreTrendTrack: { backgroundColor: '#25334d', borderRadius: 4, flex: 1, height: 8, overflow: 'hidden' },
  scoreTrendFill: { backgroundColor: '#f59e0b', borderRadius: 4, height: '100%' },
  scoreTrendValue: { color: '#fcd34d', fontSize: 11, fontWeight: '900', marginLeft: 9, textAlign: 'right', width: 34 },
  profileCard: { alignItems: 'center', backgroundColor: '#151b35', borderColor: '#393d77', borderRadius: 21, borderWidth: 1, marginBottom: 24, padding: 22 },
  profileAvatar: { alignItems: 'center', backgroundColor: '#5b57d6', borderRadius: 27, height: 54, justifyContent: 'center', width: 54 },
  profileAvatarText: { color: '#fff', fontSize: 21, fontWeight: '900' },
  profileName: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 11 },
  profileRole: { color: '#a5b4fc', fontSize: 12, marginTop: 4 },
  uidText: { color: '#8290aa', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 9, marginTop: 18, textAlign: 'center' },
  securityListCard: { backgroundColor: '#111a2e', borderColor: '#24324c', borderRadius: 17, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  securityRow: { alignItems: 'center', borderBottomColor: '#22314b', borderBottomWidth: 1, flexDirection: 'row', minHeight: 55, paddingHorizontal: 14 },
  securityRowIcon: { alignItems: 'center', backgroundColor: '#103a35', borderRadius: 9, height: 23, justifyContent: 'center', marginRight: 10, width: 23 },
  securityRowIconText: { color: '#5eead4', fontSize: 13, fontWeight: '900' },
  securityRowText: { color: '#cbd5e1', flex: 1, fontSize: 11, lineHeight: 16 },
  signOutButton: { alignItems: 'center', backgroundColor: '#421f2d', borderColor: '#843a4d', borderRadius: 14, borderWidth: 1, padding: 15 },
  signOutButtonText: { color: '#fecdd3', fontSize: 14, fontWeight: '900' },
  profileFootnote: { color: '#71809a', fontSize: 10, lineHeight: 15, marginHorizontal: 12, marginTop: 11, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 22 },
  emptyStateIcon: { color: '#8290aa', fontSize: 22, marginBottom: 8 },
  emptyStateText: { color: '#8290aa', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});