import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import {
  JEE_MAIN_SYLLABUS_UNITS,
  JEE_MAIN_SUBJECT_ORDER,
  JEE_MAIN_SUBJECT_ACCENTS,
  SYLLABUS_TOPICS,
  splitSyllabusTopics,
} from "./jeeMainSyllabus";

import { getApp } from "@react-native-firebase/app";

import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import AppHeader from "./AppHeader";
import NavigationDrawer from "./NavigationDrawer";
import BottomNavigation from "./BottomNavigation";
const db = getFirestore(getApp());

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "study", label: "Study", icon: "◷" },
  { key: "syllabus", label: "Syllabus", icon: "✓" },
  { key: "tests", label: "Tests", icon: "▣" },
  { key: "reports", label: "Reports", icon: "↗" },
];

const SUBJECT_ORDER = JEE_MAIN_SUBJECT_ORDER;
const SUBJECT_ACCENTS = JEE_MAIN_SUBJECT_ACCENTS;
const STUDY_ACTIVITIES = {
  active: ["Problem solving", "PYQ practice", "Mock test", "Recall practice"],
  passive: [
    "Video lecture",
    "Notes reading",
    "Formula revision",
    "Concept review",
  ],
};

const FOCUS_PRESETS = [15, 25, 45, 60, 90];

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

export function SecureLoadingScreen() {
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

export function AccessCodeScreen({
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

export function SecurityBlockedScreen({ error, onSignOut }) {
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

export function StudentDashboard({
  dataError,
  dataLoading,
  onSignOut,
  studySessions,
  syllabusState,
  tests,
  user,
}) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [timerMode, setTimerMode] = useState("active");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerBaseSeconds, setTimerBaseSeconds] = useState(0);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerNow, setTimerNow] = useState(Date.now());
  const [savingSession, setSavingSession] = useState(false);
  const [testType, setTestType] = useState("Mock Test");
  const [testName, setTestName] = useState("");
  const [testScore, setTestScore] = useState("");
  const [savingTest, setSavingTest] = useState(false);
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(25);
  const [studySubject, setStudySubject] = useState("Physics");
  const [studyActivity, setStudyActivity] = useState("Problem solving");
  const [studyTopic, setStudyTopic] = useState("");
  const [timerSessionStartedAt, setTimerSessionStartedAt] = useState(null);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = setInterval(() => setTimerNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const elapsedSeconds =
    timerRunning && timerStartedAt
      ? timerBaseSeconds +
        Math.max(0, Math.floor((timerNow - timerStartedAt) / 1000))
      : timerBaseSeconds;
  const summary = useMemo(
    () => buildSummary(studySessions, syllabusState, tests),
    [studySessions, syllabusState, tests],
  );
  const studentName = user?.displayName?.trim().split(" ")[0] || "Saumya";
  const initial = studentName.charAt(0).toUpperCase() || "S";

  const startOrResumeTimer = () => {
    const now = Date.now();

    setTimerNow(now);

    // Establish the session start only once. Resuming must not
    // overwrite the original start time.
    if (!timerSessionStartedAt) {
      setTimerSessionStartedAt(now);
    }

    setTimerStartedAt(now);
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    // Freeze elapsed time when pausing.
    const now = Date.now();
    const exactElapsed = timerStartedAt
      ? timerBaseSeconds +
        Math.max(0, Math.floor((now - timerStartedAt) / 1000))
      : timerBaseSeconds;

    setTimerBaseSeconds(exactElapsed);
    setTimerNow(now);
    setTimerRunning(false);
    setTimerStartedAt(null);
  };

  const resetTimer = () => {
    if (!elapsedSeconds) return;

    Alert.alert(
      "Reset focus session?",
      "The unsaved time for this session will be discarded.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setTimerRunning(false);
            setTimerBaseSeconds(0);
            setTimerStartedAt(null);
            setTimerSessionStartedAt(null);
          },
        },
      ],
    );
  };
  const saveStudySession = async () => {
    if (!user?.uid || elapsedSeconds < 1 || savingSession) return;

    setSavingSession(true);

    const endedAtMillis = Date.now();
    const startedAtMillis =
      timerSessionStartedAt || endedAtMillis - elapsedSeconds * 1000;

    try {
      await addDoc(collection(db, "users", user.uid, "studySessions"), {
        // Existing fields — retain these for old reports.
        mode: timerMode,
        durationSeconds: elapsedSeconds,
        startedAtMillis,
        endedAtMillis,
        dayKey: getDayKey(endedAtMillis),
        createdAt: serverTimestamp(),

        // New optional fields for richer reports.
        subject: studySubject,
        activity: studyActivity,
        topic: studyTopic.trim(),
        targetDurationMinutes: focusDurationMinutes,
      });

      setTimerRunning(false);
      setTimerBaseSeconds(0);
      setTimerStartedAt(null);
      setTimerSessionStartedAt(null);
      setStudyTopic("");
      setActiveTab("home");

      Alert.alert(
        "Session saved",
        `${formatDuration(elapsedSeconds)} of ${timerMode} study saved successfully.`,
      );
    } catch (saveError) {
      Alert.alert(
        "Session could not be saved",
        errorMessage(saveError, "Please try again."),
      );
    } finally {
      setSavingSession(false);
    }
  };
  const toggleSyllabusTopic = async (topic) => {
    if (!user?.uid) return;
    const done = !Boolean(syllabusState[topic.id]?.done);
    try {
      await setDoc(
        doc(db, "users", user.uid, "syllabus", topic.id),

        {
          topicId: topic.id,
          subject: topic.subject,
          title: topic.title,
          unitId: topic.unitId,
          unitNumber: topic.unitNumber,
          unitTitle: topic.unitTitle,
          done,
          updatedAtMillis: Date.now(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (toggleError) {
      Alert.alert(
        "Checklist update nahi hua",
        errorMessage(toggleError, "Please retry."),
      );
    }
  };
  const saveTest = async () => {
    if (!user?.uid) return;
    Keyboard.dismiss();
    const score = Number(testScore);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      Alert.alert(
        "Score check karein",
        "0 se 100 ke beech percentage enter karein.",
      );
      return;
    }
    setSavingTest(true);
    const takenAtMillis = Date.now();
    try {
      await addDoc(collection(db, "users", user.uid, "tests"), {
        type: testType,
        name: testName.trim() || `${testType} • ${formatDate(takenAtMillis)}`,
        scorePercent: score,
        takenAtMillis,
        dayKey: getDayKey(takenAtMillis),
        createdAt: serverTimestamp(),
      });
      setTestName("");
      setTestScore("");
    } catch (saveError) {
      Alert.alert(
        "Test score save nahi hua",
        errorMessage(saveError, "Please retry."),
      );
    } finally {
      setSavingTest(false);
    }
  };

  const renderScreen = () => {
    if (activeTab === "study") {
      return (
        <StudyScreen
          elapsedSeconds={elapsedSeconds}
          mode={timerMode}
          onChangeMode={setTimerMode}
          onPause={pauseTimer}
          onReset={resetTimer}
          onSave={saveStudySession}
          onStart={startOrResumeTimer}
          running={timerRunning}
          saving={savingSession}
          summary={summary}
          focusDurationMinutes={focusDurationMinutes}
          onChangeFocusDuration={setFocusDurationMinutes}
          subject={studySubject}
          onChangeSubject={setStudySubject}
          activity={studyActivity}
          onChangeActivity={setStudyActivity}
          topic={studyTopic}
          onChangeTopic={setStudyTopic}
        />
      );
    }
    if (activeTab === "syllabus")
      return (
        <SyllabusScreen
          onToggleTopic={toggleSyllabusTopic}
          syllabusState={syllabusState}
          summary={summary}
        />
      );
    if (activeTab === "tests")
      return (
        <TestsScreen
          onChangeName={setTestName}
          onChangeScore={(value) =>
            setTestScore(value.replace(/[^0-9.]/g, "").slice(0, 5))
          }
          onChangeType={setTestType}
          onSave={saveTest}
          saving={savingTest}
          score={testScore}
          testName={testName}
          tests={tests}
          type={testType}
        />
      );
    if (activeTab === "reports")
      return <ReportsScreen summary={summary} tests={tests} />;
    if (activeTab === "profile")
      return <ProfileScreen onSignOut={onSignOut} user={user} />;
    return (
      <HomeScreen
        name={studentName}
        onNavigate={setActiveTab}
        summary={summary}
      />
    );
  };

  const screenLabel =
    activeTab === "profile"
      ? "Profile"
      : NAV_ITEMS.find((item) => item.key === activeTab)?.label || "Home";
  return (
    <SafeAreaView style={styles.dashboardPage}>
      <StatusBar backgroundColor="#080d1b" barStyle="light-content" />
      <AppHeader
        title={screenLabel}
        subtitle="JEE 2027 • SECURE PORTAL"
        onMenuPress={() => setDrawerVisible(true)}
        onProfilePress={() => setActiveTab("profile")}
      />

      <NavigationDrawer
        visible={drawerVisible}
        activeTab={activeTab}
        user={user}
        onClose={() => setDrawerVisible(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setDrawerVisible(false);
        }}
        onSignOut={onSignOut}
      />
      {!!dataError && (
        <View style={styles.syncWarning}>
          <Text style={styles.syncWarningText}>{dataError}</Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.dashboardScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {dataLoading ? (
          <View style={styles.syncingRow}>
            <ActivityIndicator color="#a5b4fc" size="small" />
            <Text style={styles.syncingText}>
              Personal progress sync ho raha hai…
            </Text>
          </View>
        ) : null}
        {renderScreen()}
      </ScrollView>
      <BottomNavigation activeTab={activeTab} onNavigate={setActiveTab} />
    </SafeAreaView>
  );
}

export function HomeScreen({ name, onNavigate, summary }) {
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
          Small focused sessions{`\n`}become a rank.
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

export function StudyScreen({
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
  focusDurationMinutes,
  onChangeFocusDuration,
  subject,
  onChangeSubject,
  activity,
  onChangeActivity,
  topic,
  onChangeTopic,
}) {
  const lockSession = elapsedSeconds > 0 || running;
  const targetSeconds = focusDurationMinutes * 60;
  const progress = Math.min(1, elapsedSeconds / targetSeconds);
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const targetReached = elapsedSeconds >= targetSeconds;
  const activities = STUDY_ACTIVITIES[mode];

  const handleModeChange = (nextMode) => {
    if (lockSession || nextMode === mode) return;

    onChangeMode(nextMode);
    onChangeActivity(STUDY_ACTIVITIES[nextMode][0]);
  };

  return (
    <>
      <ScreenIntro
        eyebrow="FOCUS LAB"
        title="Make every minute count"
        text="Choose your study goal, focus on one task, and save your session to track your progress."
      />

      <View style={styles.timerCard}>
        <View style={styles.timerCardHeader}>
          <View>
            <Text style={styles.timerCardLabel}>YOUR FOCUS SESSION</Text>
            <Text style={styles.timerHeaderSub}>
              {mode === "active" ? "Active learning" : "Passive revision"}
            </Text>
          </View>

          <View style={[styles.livePill, running && styles.livePillActive]}>
            <View style={[styles.liveDot, running && styles.liveDotActive]} />
            <Text style={styles.livePillText}>
              {running ? "FOCUSING" : targetReached ? "GOAL REACHED" : "READY"}
            </Text>
          </View>
        </View>

        <View style={styles.focusRingWrap}>
          <View style={styles.focusRing}>
            <View style={styles.focusRingInner}>
              <Text style={styles.timerValue}>
                {formatTimer(elapsedSeconds)}
              </Text>
              <Text style={styles.focusRingCaption}>ELAPSED</Text>
              <View style={styles.focusRingDivider} />
              <Text style={styles.focusRemaining}>
                {targetReached
                  ? "Goal completed"
                  : `${formatTimer(remainingSeconds)} left`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.goalProgressTrack}>
          <View
            style={[
              styles.goalProgressFill,
              { width: `${Math.round(progress * 100)}%` },
              targetReached && styles.goalProgressComplete,
            ]}
          />
        </View>

        <View style={styles.goalLabels}>
          <Text style={styles.goalLabel}>FOCUS GOAL</Text>
          <Text style={styles.goalPercent}>{Math.round(progress * 100)}%</Text>
        </View>

        <Text style={styles.inputLabel}>SESSION LENGTH</Text>
        <View style={styles.presetRow}>
          {FOCUS_PRESETS.map((minutes) => {
            const selected = focusDurationMinutes === minutes;

            return (
              <TouchableOpacity
                key={minutes}
                disabled={lockSession || saving}
                onPress={() => onChangeFocusDuration(minutes)}
                style={[
                  styles.presetButton,
                  selected && styles.presetButtonSelected,
                  lockSession && !selected && styles.presetButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.presetText,
                    selected && styles.presetTextSelected,
                  ]}
                >
                  {minutes}
                </Text>
                <Text
                  style={[
                    styles.presetUnit,
                    selected && styles.presetTextSelected,
                  ]}
                >
                  min
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>STUDY MODE</Text>
        <View style={styles.modeToggle}>
          {["active", "passive"].map((item) => {
            const selected = mode === item;

            return (
              <TouchableOpacity
                key={item}
                disabled={lockSession || saving}
                onPress={() => handleModeChange(item)}
                style={[
                  styles.modeOption,
                  selected && styles.modeOptionSelected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.modeOptionText,
                    selected && styles.modeOptionTextSelected,
                  ]}
                >
                  {item === "active" ? "⚡ Active study" : "📖 Passive study"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>SUBJECT</Text>
        <View style={styles.selectionRow}>
          {SUBJECT_ORDER.map((item) => {
            const selected = subject === item;

            return (
              <TouchableOpacity
                key={item}
                disabled={lockSession || saving}
                onPress={() => onChangeSubject(item)}
                style={[
                  styles.subjectSelectButton,
                  selected && {
                    borderColor: SUBJECT_ACCENTS[item],
                    backgroundColor: `${SUBJECT_ACCENTS[item]}20`,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <View
                  style={[
                    styles.subjectSelectDot,
                    { backgroundColor: SUBJECT_ACCENTS[item] },
                  ]}
                />
                <Text
                  style={[
                    styles.subjectSelectText,
                    selected && styles.subjectSelectTextSelected,
                  ]}
                >
                  {item === "Mathematics" ? "Maths" : item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>WHAT ARE YOU WORKING ON?</Text>
        <View style={styles.activityGrid}>
          {activities.map((item) => {
            const selected = activity === item;

            return (
              <TouchableOpacity
                key={item}
                disabled={lockSession || saving}
                onPress={() => onChangeActivity(item)}
                style={[
                  styles.activityOption,
                  selected && styles.activityOptionSelected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.activityOptionText,
                    selected && styles.activityOptionTextSelected,
                  ]}
                >
                  {selected ? "✓  " : ""}
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>TOPIC (OPTIONAL)</Text>
        <TextInput
          value={topic}
          onChangeText={onChangeTopic}
          editable={!lockSession && !saving}
          placeholder="e.g. Laws of motion"
          placeholderTextColor="#64748b"
          maxLength={120}
          style={styles.topicInput}
          returnKeyType="done"
          accessibilityLabel="Study topic"
        />

        {lockSession && (
          <Text style={styles.timerModeHint}>
            Session settings are locked while a session is in progress. Save or
            reset to start a different session.
          </Text>
        )}

        {targetReached && (
          <View style={styles.goalReachedBox}>
            <Text style={styles.goalReachedTitle}>🎯 Focus goal reached</Text>
            <Text style={styles.goalReachedCopy}>
              Great work! You can keep studying, pause, or save this session.
            </Text>
          </View>
        )}

        <View style={styles.timerActions}>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={saving}
            onPress={running ? onPause : onStart}
            style={[styles.timerMainButton, saving && styles.buttonDisabled]}
          >
            <Text style={styles.timerMainButtonText}>
              {running
                ? "Ⅱ   Pause session"
                : elapsedSeconds > 0
                  ? "▶   Resume focus"
                  : "▶   Start focus"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            disabled={elapsedSeconds === 0 || saving}
            onPress={onReset}
            style={[
              styles.timerIconButton,
              (elapsedSeconds === 0 || saving) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.timerIconButtonText}>↺</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={elapsedSeconds < 1 || saving}
          onPress={onSave}
          style={[
            styles.saveSessionButton,
            (elapsedSeconds < 1 || saving) && styles.buttonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#bfdbfe" />
          ) : (
            <Text style={styles.saveSessionButtonText}>
              Save study session →
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeading}>Your study insights</Text>

      <View style={styles.twoColumnRow}>
        <MiniInsight
          label="Today"
          value={formatDuration(summary.todaySeconds)}
        />
        <MiniInsight
          label="This week"
          value={formatDuration(summary.weekSeconds)}
        />
      </View>

      <View style={styles.twoColumnRow}>
        <MiniInsight
          label="Active learning"
          value={formatDuration(summary.activeSeconds)}
        />
        <MiniInsight
          label="Passive revision"
          value={formatDuration(summary.passiveSeconds)}
        />
      </View>

      <View style={styles.studyTipCard}>
        <Text style={styles.studyTipIcon}>✦</Text>
        <View style={styles.flex}>
          <Text style={styles.studyTipTitle}>Study smart, not just long</Text>
          <Text style={styles.studyTipText}>
            Active: solve questions, attempt PYQs and practise recall. Passive:
            understand concepts, read notes and revise formulas. Both count
            towards your study time.
          </Text>
        </View>
      </View>
    </>
  );
}

export function SyllabusScreen({ onToggleTopic, syllabusState, summary }) {
  const [expandedUnits, setExpandedUnits] = useState({});

  const toggleUnitExpansion = (unitId) => {
    setExpandedUnits((current) => ({
      ...current,
      [unitId]: !current[unitId],
    }));
  };

  return (
    <>
      <ScreenIntro
        eyebrow="JEE MAIN SYLLABUS"
        title="Complete the syllabus"
        text="Subject-wise units and topic checklists. Tap a unit to expand its topics and tick off your progress."
      />

      <View style={styles.syllabusNotice}>
        <Text style={styles.syllabusNoticeTitle}>Syllabus reference</Text>
        <Text style={styles.syllabusNoticeText}>
          Based on the syllabus document you provided, which references the 2026
          syllabus for 2027 preparation. Check the official NTA site for any
          2027 update.
        </Text>
        <Text
          accessibilityRole="link"
          onPress={() =>
            Alert.alert(
              "Official NTA syllabus",
              "Open the official JEE Main syllabus page in your browser:\nhttps://jeemain.nta.nic.in/document/syllabus-2026/",
              [
                { text: "OK" },
                {
                  text: "Copy link",
                  onPress: () =>
                    Alert.alert(
                      "Official syllabus URL",
                      "https://jeemain.nta.nic.in/document/syllabus-2026/",
                    ),
                },
              ],
            )
          }
          style={styles.syllabusNoticeLink}
        >
          NTA syllabus reference ↗
        </Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>TOPICS COMPLETED</Text>
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
        const units = JEE_MAIN_SYLLABUS_UNITS.filter(
          (unit) => unit.subject === subject,
        );

        const subjectTopics = SYLLABUS_TOPICS.filter(
          (topic) => topic.subject === subject,
        );

        const completedCount = subjectTopics.filter((topic) =>
          Boolean(syllabusState[topic.id]?.done),
        ).length;

        const subjectPercent = subjectTopics.length
          ? Math.round((completedCount / subjectTopics.length) * 100)
          : 0;

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
                {completedCount}/{subjectTopics.length}
              </Text>
            </View>

            <View style={styles.subjectProgressTrack}>
              <View
                style={[
                  styles.subjectProgressFill,
                  {
                    width: `${subjectPercent}%`,
                    backgroundColor: SUBJECT_ACCENTS[subject],
                  },
                ]}
              />
            </View>

            {units.map((unit) => {
              const topics = SYLLABUS_TOPICS.filter(
                (topic) => topic.unitId === unit.id,
              );

              const unitDone = topics.filter((topic) =>
                Boolean(syllabusState[topic.id]?.done),
              ).length;

              const expanded = Boolean(expandedUnits[unit.id]);

              return (
                <View key={unit.id} style={styles.syllabusUnit}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    onPress={() => toggleUnitExpansion(unit.id)}
                    style={styles.syllabusUnitHeader}
                  >
                    <View style={styles.syllabusUnitText}>
                      <Text style={styles.syllabusUnitEyebrow}>
                        UNIT {String(unit.unit).padStart(2, "0")}
                      </Text>
                      <Text style={styles.syllabusUnitTitle}>{unit.title}</Text>
                      <Text style={styles.syllabusUnitMeta}>
                        {unitDone}/{topics.length} topics complete
                      </Text>
                    </View>

                    <View style={styles.syllabusUnitRight}>
                      {unitDone === topics.length && (
                        <Text style={styles.syllabusUnitComplete}>✓</Text>
                      )}
                      <Text style={styles.syllabusUnitChevron}>
                        {expanded ? "−" : "+"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {expanded && (
                    <View style={styles.subtopicList}>
                      {topics.map((topic, index) => {
                        const done = Boolean(syllabusState[topic.id]?.done);

                        return (
                          <TouchableOpacity
                            key={topic.id}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: done }}
                            onPress={() => onToggleTopic(topic)}
                            style={styles.subtopicRow}
                          >
                            <View
                              style={[
                                styles.checkbox,
                                done && styles.checkboxDone,
                              ]}
                            >
                              {done && (
                                <Text style={styles.checkboxTick}>✓</Text>
                              )}
                            </View>

                            <Text
                              style={[
                                styles.subtopicIndex,
                                done && styles.topicTitleDone,
                              ]}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </Text>

                            <Text
                              style={[
                                styles.subtopicTitle,
                                done && styles.topicTitleDone,
                              ]}
                            >
                              {topic.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </>
  );
}

export function TestsScreen({
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


function AnalyticsLineChart({ title, subtitle, data, color, formatValue }) {
  const width = 320;
  const height = 178;
  const left = 34;
  const right = 308;
  const top = 14;
  const bottom = 140;
  const plotWidth = right - left;
  const plotHeight = bottom - top;
  const safeData = Array.isArray(data) ? data : [];
  const maxValue = Math.max(1, ...safeData.map((point) => Number(point.value) || 0));
  const yMax = maxValue <= 4
    ? Math.max(1, Math.ceil(maxValue * 2) / 2)
    : Math.min(100, Math.ceil(maxValue / 20) * 20);
  const points = safeData.map((point, index) => {
    const value = Math.max(0, Number(point.value) || 0);
    return {
      ...point,
      value,
      x: left + (safeData.length <= 1 ? plotWidth / 2 : (index * plotWidth) / (safeData.length - 1)),
      y: bottom - (value / yMax) * plotHeight,
    };
  });
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`
    : "";

  return (
    <View style={styles.analyticsChartCard}>
      <Text style={styles.analyticsChartTitle}>{title}</Text>
      <Text style={styles.analyticsChartSubtitle}>{subtitle}</Text>
      {points.length ? (
        <>
          <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {[0, 1, 2, 3, 4].map((tick) => {
              const fraction = tick / 4;
              const y = bottom - fraction * plotHeight;
              return (
                <React.Fragment key={tick}>
                  <Line
                    x1={left}
                    y1={y}
                    x2={right}
                    y2={y}
                    stroke="#26344e"
                    strokeWidth={1}
                    strokeDasharray={tick === 0 ? undefined : "3 4"}
                  />
                  <SvgText
                    x={left - 7}
                    y={y + 3}
                    fill="#8290aa"
                    fontSize={8}
                    textAnchor="end"
                  >
                    {formatValue ? formatValue((fraction * yMax) / 1) : String(Math.round(fraction * yMax))}
                  </SvgText>
                </React.Fragment>
              );
            })}
            {areaPath ? <Path d={areaPath} fill={color} opacity={0.14} /> : null}
            {linePath ? (
              <Path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {points.map((point, index) => (
              <React.Fragment key={`${point.label}-${index}`}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill="#111a2e"
                  stroke={color}
                  strokeWidth={2}
                />
                <SvgText
                  x={point.x}
                  y={bottom + 19}
                  fill="#8290aa"
                  fontSize={9}
                  textAnchor="middle"
                >
                  {String(point.label).slice(0, 3)}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
          <View style={styles.analyticsChartFoot}>
            <View style={[styles.analyticsChartLegendDot, { backgroundColor: color }]} />
            <Text style={styles.analyticsChartLegendText}>
              Latest: {formatValue ? formatValue(points[points.length - 1].value) : points[points.length - 1].value}
            </Text>
          </View>
        </>
      ) : (
        <EmptyState icon="↗" text="Data save hone ke baad line graph yahan dikhega." />
      )}
    </View>
  );
}

function DonutPieChart({ title, subtitle, data, emptyText }) {
  const size = 150;
  const center = size / 2;
  const radius = 48;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  const visibleData = (Array.isArray(data) ? data : []).filter(
    (item) => Number(item.value) > 0,
  );
  const total = visibleData.reduce((sum, item) => sum + Number(item.value || 0), 0);
  let accumulatedFraction = 0;
  const segments = visibleData.map((item) => {
    const fraction = total ? Number(item.value || 0) / total : 0;
    const segment = {
      ...item,
      fraction,
      dashLength: circumference * fraction,
      dashOffset: -circumference * accumulatedFraction,
      percent: total ? Math.round(fraction * 100) : 0,
    };
    accumulatedFraction += fraction;
    return segment;
  });

  return (
    <View style={styles.analyticsChartCard}>
      <Text style={styles.analyticsChartTitle}>{title}</Text>
      <Text style={styles.analyticsChartSubtitle}>{subtitle}</Text>
      {total > 0 ? (
        <View style={styles.donutLayout}>
          <View style={styles.donutChartWrap}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#26344e"
                strokeWidth={strokeWidth}
              />
              {segments.map((segment) => (
                <Circle
                  key={segment.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${segment.dashLength} ${Math.max(0, circumference - segment.dashLength)}`}
                  strokeDashoffset={segment.dashOffset}
                  strokeLinecap="butt"
                  rotation={-90}
                  originX={center}
                  originY={center}
                />
              ))}
              <SvgText
                x={center}
                y={center - 2}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize={12}
                fontWeight="700"
              >
                {formatCompactHours(total)}
              </SvgText>
              <SvgText
                x={center}
                y={center + 13}
                textAnchor="middle"
                fill="#8290aa"
                fontSize={8}
              >
                TOTAL TIME
              </SvgText>
            </Svg>
          </View>
          <View style={styles.donutLegend}>
            {segments.map((segment) => (
              <View key={segment.label} style={styles.donutLegendRow}>
                <View style={[styles.donutLegendDot, { backgroundColor: segment.color }]} />
                <View style={styles.donutLegendCopy}>
                  <Text numberOfLines={2} style={styles.donutLegendLabel}>{segment.label}</Text>
                  <Text style={styles.donutLegendDuration}>{formatDuration(segment.value)}</Text>
                </View>
                <Text style={styles.donutLegendPercent}>{segment.percent}%</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <EmptyState icon="◷" text={emptyText} />
      )}
    </View>
  );
}

export function ReportsScreen({ summary, tests }) {
  const maxDaySeconds = Math.max(
    ...summary.weekDays.map((day) => day.seconds),
    1,
  );
  const goalMinutes = summary.dailyGoalMinutes || 240;
  const goalSeconds = goalMinutes * 60;
  const goalPercent = Math.min(
    100,
    Math.round((summary.todaySeconds / Math.max(goalSeconds, 1)) * 100),
  );
  const subjectRows = (summary.subjectBreakdown || []).filter(
    (row) => row.seconds > 0,
  );
  const activityRows = (summary.activityBreakdown || []).filter(
    (row) => row.seconds > 0,
  );
  const maxSubjectSeconds = Math.max(1, ...subjectRows.map((row) => row.seconds));
  const maxActivitySeconds = Math.max(1, ...activityRows.map((row) => row.seconds));
  const recentScores = [...tests]
    .sort((a, b) => Number(a.takenAtMillis || 0) - Number(b.takenAtMillis || 0))
    .slice(-5);
  const studyModePie = [
    { label: "Active learning", value: summary.weekActiveSeconds || 0, color: "#8b5cf6" },
    { label: "Passive revision", value: summary.weekPassiveSeconds || 0, color: "#14b8a6" },
  ];
  const subjectPie = subjectRows.map((row, index) => ({
    label: row.subject,
    value: row.seconds,
    color: SUBJECT_ACCENTS[row.subject] || ["#818cf8", "#f59e0b", "#fb7185"][index % 3],
  }));

  return (
    <>
      <ScreenIntro
        eyebrow="PROGRESS REPORT"
        title="Study analytics"
        text="Understand your consistency, study balance and where your time is going."
      />

      <View style={styles.goalCard}>
        <View style={styles.goalCardHeader}>
          <View style={styles.goalCardTitleWrap}>
            <Text style={styles.goalCardEyebrow}>TODAY'S STUDY GOAL</Text>
            <Text style={styles.goalCardTitle}>
              {formatDuration(summary.todaySeconds)}{" "}
              <Text style={styles.goalCardMuted}>/ {goalMinutes / 60}h</Text>
            </Text>
          </View>
          <View style={styles.goalBadge}>
            <Text style={styles.goalBadgeText}>{goalPercent}%</Text>
          </View>
        </View>
        <View style={styles.goalTrack}>
          <View
            style={[
              styles.goalFill,
              { width: `${goalPercent}%` },
              goalPercent >= 100 && styles.goalFillComplete,
            ]}
          />
        </View>
        <Text style={styles.goalFootnote}>
          {goalPercent >= 100
            ? "Daily goal reached. Great consistency!"
            : `${formatDuration(Math.max(0, goalSeconds - summary.todaySeconds))} left to reach today's goal.`}
        </Text>
      </View>

      <View style={styles.reportMetricGrid}>
        <ReportMetric accent="#8b5cf6" label="7-day study" value={formatCompactHours(summary.weekSeconds)} />
        <ReportMetric
          accent="#14b8a6"
          label="Test average"
          value={summary.testAverage === null ? "—" : `${Math.round(summary.testAverage)}%`}
        />
        <ReportMetric
          accent="#f59e0b"
          label="Best score"
          value={summary.bestScore === null ? "—" : `${Math.round(summary.bestScore)}%`}
        />
        <ReportMetric accent="#fb7185" label="Sessions" value={String(summary.totalSessions)} />
      </View>

      <AnalyticsLineChart
        title="Study time trend"
        subtitle="Daily study hours · last 7 days"
        data={summary.weekDays.map((day) => ({
          label: day.label,
          value: day.seconds / 3600,
        }))}
        color="#a5b4fc"
        formatValue={(value) => `${Number(value).toFixed(1)}h`}
      />

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Study time</Text>
            <Text style={styles.chartSubtext}>Last 7 days · bar view</Text>
          </View>
          <Text style={styles.chartTotal}>{formatDuration(summary.weekSeconds)}</Text>
        </View>
        <View style={styles.barChart}>
          {summary.weekDays.map((day) => (
            <View key={day.key} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${Math.max(7, Math.round((day.seconds / maxDaySeconds) * 100))}%` },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <DonutPieChart
        title="Study mode split"
        subtitle="Active learning vs passive revision · last 7 days"
        data={studyModePie}
        emptyText="Save a study session this week to see the active/passive split."
      />

      <DonutPieChart
        title="Subject time split"
        subtitle="How your study time was distributed · last 7 days"
        data={subjectPie}
        emptyText="Save a session with a subject selected to see this chart."
      />

      <View style={styles.reportSplitCard}>
        <View style={styles.reportSplitItem}>
          <Text style={styles.reportSplitLabel}>ACTIVE LEARNING · ALL TIME</Text>
          <Text style={styles.reportSplitValue}>{formatDuration(summary.activeSeconds)}</Text>
          <Text style={styles.breakdownPercent}>
            {summary.totalSeconds
              ? Math.round((summary.activeSeconds / summary.totalSeconds) * 100)
              : 0}% of tracked time
          </Text>
        </View>
        <View style={styles.reportDivider} />
        <View style={styles.reportSplitItem}>
          <Text style={styles.reportSplitLabel}>PASSIVE REVISION · ALL TIME</Text>
          <Text style={styles.reportSplitValue}>{formatDuration(summary.passiveSeconds)}</Text>
          <Text style={styles.breakdownPercent}>
            {summary.totalSeconds
              ? Math.round((summary.passiveSeconds / summary.totalSeconds) * 100)
              : 0}% of tracked time
          </Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>Time by subject · last 7 days</Text>
      <View style={styles.breakdownCard}>
        {subjectRows.length ? (
          subjectRows.map((row) => (
            <View key={row.subject} style={styles.breakdownRow}>
              <View style={styles.breakdownTopline}>
                <View style={styles.breakdownLabelWrap}>
                  <View style={[styles.breakdownDot, { backgroundColor: SUBJECT_ACCENTS[row.subject] || "#818cf8" }]} />
                  <Text style={styles.breakdownName}>{row.subject}</Text>
                </View>
                <Text style={styles.breakdownValue}>{formatDuration(row.seconds)}</Text>
              </View>
              <View style={styles.breakdownTrack}>
                <View
                  style={[
                    styles.breakdownFill,
                    {
                      width: `${Math.round((row.seconds / maxSubjectSeconds) * 100)}%`,
                      backgroundColor: SUBJECT_ACCENTS[row.subject] || "#818cf8",
                    },
                  ]}
                />
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="◷"
            text="New saved sessions with a subject selected will appear here. Older sessions still count in overall totals."
          />
        )}
      </View>

      <Text style={styles.sectionHeading}>Time by activity · last 7 days</Text>
      <View style={styles.breakdownCard}>
        {activityRows.length ? (
          activityRows.slice(0, 8).map((row) => (
            <View key={`${row.mode}::${row.activity}`} style={styles.breakdownRow}>
              <View style={styles.breakdownTopline}>
                <View style={styles.breakdownLabelWrap}>
                  <View style={[styles.breakdownDot, { backgroundColor: row.mode === "active" ? "#8b5cf6" : "#14b8a6" }]} />
                  <Text style={styles.breakdownName}>{row.activity}</Text>
                </View>
                <Text style={styles.breakdownValue}>{formatDuration(row.seconds)}</Text>
              </View>
              <View style={styles.breakdownTrack}>
                <View
                  style={[
                    styles.breakdownFill,
                    {
                      width: `${Math.round((row.seconds / maxActivitySeconds) * 100)}%`,
                      backgroundColor: row.mode === "active" ? "#8b5cf6" : "#14b8a6",
                    },
                  ]}
                />
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="✦"
            text="Select a study activity in the timer; new saved sessions will populate this chart."
          />
        )}
      </View>

      <AnalyticsLineChart
        title="Test score trend"
        subtitle="Latest 5 saved tests · percentage"
        data={recentScores.map((test, index) => ({
          label: `T${index + 1}`,
          value: Math.max(0, Math.min(100, Number(test.scorePercent) || 0)),
        }))}
        color="#f59e0b"
        formatValue={(value) => `${Math.round(value)}%`}
      />

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
                    { width: `${Math.min(100, Math.max(0, Number(test.scorePercent) || 0))}%` },
                  ]}
                />
              </View>
              <Text style={styles.scoreTrendValue}>{Math.round(Number(test.scorePercent) || 0)}%</Text>
            </View>
          ))
        ) : (
          <EmptyState icon="↗" text="Score history save karne ke baad trend dikhega." />
        )}
      </View>
    </>
  );
}

export function ProfileScreen({ onSignOut, user }) {
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

export function ScreenIntro({ eyebrow, text, title }) {
  return (
    <View style={styles.screenIntro}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.screenIntroTitle}>{title}</Text>
      <Text style={styles.screenIntroText}>{text}</Text>
    </View>
  );
}
export function MetricCard({ accent, label, value }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricAccent, { backgroundColor: accent }]} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
export function QuickAction({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.quickAction}>
      <View style={styles.quickActionIconWrap}>
        <Text style={styles.quickActionIcon}>{icon}</Text>
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}
export function ActivityRow({ detail, icon, title }) {
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
export function MiniInsight({ label, value }) {
  return (
    <View style={styles.miniInsight}>
      <Text style={styles.miniInsightLabel}>{label}</Text>
      <Text style={styles.miniInsightValue}>{value}</Text>
    </View>
  );
}
export function ReportMetric({ accent, label, value }) {
  return (
    <View style={styles.reportMetric}>
      <View style={[styles.reportMetricDot, { backgroundColor: accent }]} />
      <Text style={styles.reportMetricValue}>{value}</Text>
      <Text style={styles.reportMetricLabel}>{label}</Text>
    </View>
  );
}
export function SecurityRow({ icon, text }) {
  return (
    <View style={styles.securityRow}>
      <View style={styles.securityRowIcon}>
        <Text style={styles.securityRowIconText}>{icon}</Text>
      </View>
      <Text style={styles.securityRowText}>{text}</Text>
    </View>
  );
}
export function EmptyState({ icon, text }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}
function formatTimer(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
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

  const durationOf = (session) =>
    Math.max(0, Number(session.durationSeconds) || 0);

  const sessionDayKey = (session) =>
    session.dayKey || getDayKey(sessionTimestamp(session));

  const todaySessions = sessions.filter(
    (session) => sessionDayKey(session) === todayKey,
  );

  const weekSessions = sessions.filter(
    (session) => sessionTimestamp(session) >= sevenDaysAgo.getTime(),
  );

  const totalSeconds = sessions.reduce(
    (total, session) => total + durationOf(session),
    0,
  );

  const todaySeconds = todaySessions.reduce(
    (total, session) => total + durationOf(session),
    0,
  );

  const weekSeconds = weekSessions.reduce(
    (total, session) => total + durationOf(session),
    0,
  );

  const weekActiveSeconds = weekSessions
    .filter((session) => session.mode === "active")
    .reduce((total, session) => total + durationOf(session), 0);

  const weekPassiveSeconds = weekSessions
    .filter((session) => session.mode === "passive")
    .reduce((total, session) => total + durationOf(session), 0);

  const activeSeconds = sessions
    .filter((session) => session.mode === "active")
    .reduce((total, session) => total + durationOf(session), 0);

  const passiveSeconds = sessions
    .filter((session) => session.mode === "passive")
    .reduce((total, session) => total + durationOf(session), 0);

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
      label: date.toLocaleDateString(undefined, {
        weekday: "narrow",
      }),
      seconds: weekSessions
        .filter((session) => sessionDayKey(session) === key)
        .reduce((total, session) => total + durationOf(session), 0),
    };
  });

  // New optional metadata only; older sessions remain included in totals.
  const subjectTotals = {};
  const activityTotals = {};

  weekSessions.forEach((session) => {
    const seconds = durationOf(session);
    const subject = String(session.subject || "").trim();
    const activity = String(session.activity || "").trim();

    if (subject) {
      subjectTotals[subject] = (subjectTotals[subject] || 0) + seconds;
    }

    if (activity) {
      const key = `${session.mode || "unknown"}::${activity}`;

      if (!activityTotals[key]) {
        activityTotals[key] = {
          activity,
          mode: session.mode || "unknown",
          seconds: 0,
        };
      }

      activityTotals[key].seconds += seconds;
    }
  });

  const subjectBreakdown = Object.entries(subjectTotals)
    .map(([subject, seconds]) => ({ subject, seconds }))
    .sort((a, b) => b.seconds - a.seconds);

  const activityBreakdown = Object.values(activityTotals).sort(
    (a, b) => b.seconds - a.seconds,
  );

  const recentTests = [...tests]
    .sort((a, b) => Number(b.takenAtMillis || 0) - Number(a.takenAtMillis || 0))
    .slice(0, 4);

  return {
    activeSeconds,
    activityBreakdown,
    bestScore,
    completedTopicIds,
    completedTopics,
    dailyGoalMinutes: 240,
    passiveSeconds,
    recentSessions: sessions.slice(0, 4),
    recentTests,
    subjectBreakdown,
    syllabusPercent: Math.round(
      (completedTopics / Math.max(SYLLABUS_TOPICS.length, 1)) * 100,
    ),
    testAverage,
    todaySeconds,
    totalSeconds,
    totalSessions: sessions.length,
    weekActiveSeconds,
    weekDays,
    weekPassiveSeconds,
    weekSeconds,
  };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerPage: {
    flex: 1,
    backgroundColor: "#080d1b",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loginPage: { flex: 1, backgroundColor: "#080d1b" },
  loginScroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    overflow: "hidden",
  },
  loginOrbOne: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "#312e81",
    opacity: 0.44,
    top: -82,
    left: -116,
  },
  loginOrbTwo: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#0f766e",
    opacity: 0.22,
    bottom: -82,
    right: -100,
  },
  loginCard: {
    backgroundColor: "#111a2e",
    borderColor: "#26344e",
    borderRadius: 28,
    borderWidth: 1,
    padding: 25,
    width: "100%",
    maxWidth: 470,
    alignSelf: "center",
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#6366f1",
    borderRadius: 18,
    height: 58,
    justifyContent: "center",
    marginBottom: 21,
    shadowColor: "#818cf8",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    width: 58,
  },
  brandMarkText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -1,
  },
  eyebrow: {
    color: "#a5b4fc",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.9,
    marginBottom: 7,
  },
  loginTitle: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.1,
    marginBottom: 8,
  },
  loginSubtitle: {
    color: "#a7b4c9",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 27,
  },
  inputLabel: {
    color: "#8290aa",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },
  accessCodeInput: {
    backgroundColor: "#080d1b",
    borderColor: "#384660",
    borderRadius: 15,
    borderWidth: 1,
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 8,
    marginBottom: 14,
    padding: 16,
  },
  formInput: {
    backgroundColor: "#0b1425",
    borderColor: "#2b3a55",
    borderRadius: 13,
    borderWidth: 1,
    color: "#f8fafc",
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  errorText: {
    color: "#fda4af",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#6366f1",
    borderRadius: 15,
    justifyContent: "center",
    minHeight: 53,
    paddingHorizontal: 18,
  },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  buttonDisabled: { opacity: 0.42 },
  securityNote: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 17,
  },
  securityNoteIcon: { color: "#67e8f9", fontSize: 16, marginRight: 6 },
  securityNoteText: { color: "#71809a", fontSize: 11 },
  loadingMark: {
    alignItems: "center",
    backgroundColor: "#3730a3",
    borderRadius: 22,
    height: 68,
    justifyContent: "center",
    marginBottom: 23,
    width: 68,
  },
  loadingMarkText: { color: "#fff", fontSize: 27, fontWeight: "900" },
  loadingTitle: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 17,
  },
  loadingCopy: {
    color: "#71809a",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },
  securityBlockCard: {
    backgroundColor: "#111a2e",
    borderColor: "#5f2535",
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 450,
    padding: 25,
    width: "100%",
  },
  securityBlockIcon: {
    alignItems: "center",
    backgroundColor: "#7f1d1d",
    borderRadius: 18,
    color: "#fecdd3",
    fontSize: 25,
    fontWeight: "900",
    height: 52,
    lineHeight: 52,
    marginBottom: 17,
    textAlign: "center",
    width: 52,
  },
  securityBlockTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
  },
  securityBlockCopy: { color: "#fda4af", fontSize: 13, lineHeight: 20 },
  securityBlockHint: {
    color: "#93a4bd",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#26344e",
    borderRadius: 13,
    marginTop: 20,
    padding: 14,
  },
  secondaryButtonText: { color: "#e2e8f0", fontSize: 14, fontWeight: "800" },
  dashboardPage: { flex: 1, backgroundColor: "#080d1b" },
  dashboardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 14,
  },
  dashboardKicker: {
    color: "#73829d",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.35,
    marginBottom: 3,
  },
  dashboardTitle: {
    color: "#f8fafc",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  avatarButton: {
    alignItems: "center",
    backgroundColor: "#202d48",
    borderColor: "#384660",
    borderRadius: 18,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatarButtonActive: { backgroundColor: "#4f46e5", borderColor: "#818cf8" },
  avatarText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  syncWarning: {
    backgroundColor: "#54252c",
    borderColor: "#8f3e4e",
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 2,
    padding: 11,
  },
  syncWarningText: { color: "#fecdd3", fontSize: 12, lineHeight: 17 },
  dashboardScroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  syncingRow: {
    alignItems: "center",
    backgroundColor: "#111a2e",
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 13,
    padding: 10,
  },
  syncingText: { color: "#a5b4fc", fontSize: 12, marginLeft: 9 },
  bottomNavigation: {
    backgroundColor: "#0d1525",
    borderColor: "#22314b",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 9,
    paddingTop: 9,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    maxWidth: 78,
    paddingHorizontal: 2,
  },
  navIcon: { color: "#71809a", fontSize: 18, height: 22, textAlign: "center" },
  navIconActive: { color: "#a5b4fc" },
  navLabel: { color: "#71809a", fontSize: 9, fontWeight: "700", marginTop: 3 },
  navLabelActive: { color: "#dbeafe" },
  heroCard: {
    backgroundColor: "#262170",
    borderColor: "#5750c8",
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 23,
    overflow: "hidden",
    padding: 23,
  },
  heroGlow: {
    backgroundColor: "#7c3aed",
    borderRadius: 110,
    height: 220,
    opacity: 0.27,
    position: "absolute",
    right: -72,
    top: -107,
    width: 220,
  },
  heroOverline: {
    color: "#c7d2fe",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 9,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 34,
    marginBottom: 11,
    maxWidth: "88%",
  },
  heroCopy: {
    color: "#d5dcff",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: "88%",
  },
  heroAction: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroActionText: { color: "#27216c", fontSize: 13, fontWeight: "900" },
  heroActionArrow: {
    color: "#27216c",
    fontSize: 17,
    fontWeight: "900",
    marginLeft: 13,
  },
  sectionHeading: {
    color: "#e8edf7",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
    marginBottom: 12,
    marginTop: 3,
  },
  sectionHeadingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionHeadingMeta: { color: "#71809a", fontSize: 10, marginBottom: 12 },
  metricGrid: { flexDirection: "row", gap: 9, marginBottom: 25 },
  metricCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 91,
    overflow: "hidden",
    padding: 13,
  },
  metricAccent: {
    borderRadius: 2,
    height: 3,
    left: 13,
    position: "absolute",
    top: 0,
    width: 26,
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginTop: 9,
  },
  metricLabel: { color: "#8290aa", fontSize: 10, lineHeight: 14, marginTop: 8 },
  nextStepCard: {
    alignItems: "center",
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 23,
    padding: 13,
  },
  nextStepIcon: {
    alignItems: "center",
    borderRadius: 13,
    height: 39,
    justifyContent: "center",
    width: 39,
  },
  nextStepIconText: { color: "#fff", fontSize: 17, fontWeight: "900" },
  nextStepTextWrap: { flex: 1, marginHorizontal: 11 },
  nextStepLabel: {
    color: "#8290aa",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  nextStepTitle: {
    color: "#edf2f9",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  smallRoundButton: {
    alignItems: "center",
    backgroundColor: "#26344e",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  smallRoundButtonText: { color: "#dbeafe", fontSize: 16, fontWeight: "900" },
  quickActionRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  quickAction: {
    alignItems: "center",
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  quickActionIconWrap: {
    alignItems: "center",
    backgroundColor: "#202d48",
    borderRadius: 12,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  quickActionIcon: { color: "#c7d2fe", fontSize: 17, fontWeight: "900" },
  quickActionLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8,
  },
  activityCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 6,
    overflow: "hidden",
  },
  activityRow: {
    alignItems: "center",
    borderBottomColor: "#20304a",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 13,
  },
  activityIconWrap: {
    alignItems: "center",
    backgroundColor: "#202d48",
    borderRadius: 12,
    height: 35,
    justifyContent: "center",
    width: 35,
  },
  activityIcon: { color: "#a5b4fc", fontSize: 16, fontWeight: "900" },
  activityTextWrap: { flex: 1, marginLeft: 11 },
  activityTitle: { color: "#e5eaf3", fontSize: 12, fontWeight: "800" },
  activityDetail: { color: "#8290aa", fontSize: 10, marginTop: 4 },
  screenIntro: { marginBottom: 21, paddingTop: 3 },
  screenIntroTitle: {
    color: "#f8fafc",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 7,
  },
  screenIntroText: { color: "#9aa8bd", fontSize: 13, lineHeight: 20 },
  timerCard: {
    backgroundColor: "#151b35",
    borderColor: "#3a3e77",
    borderRadius: 23,
    borderWidth: 1,
    marginBottom: 15,
    padding: 20,
  },
  timerCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timerCardLabel: {
    color: "#a5b4fc",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  livePill: {
    alignItems: "center",
    backgroundColor: "#1d2a42",
    borderRadius: 10,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  livePillActive: { backgroundColor: "#153c38" },
  liveDot: {
    backgroundColor: "#64748b",
    borderRadius: 4,
    height: 7,
    marginRight: 5,
    width: 7,
  },
  liveDotActive: { backgroundColor: "#2dd4bf" },
  livePillText: {
    color: "#cbd5e1",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  timerValue: {
    color: "#ffffff",
    fontSize: 36,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    letterSpacing: -1.4,
    textAlign: "center",
  },
  timerHelper: {
    color: "#8796ae",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  modeToggle: {
    backgroundColor: "#0c1324",
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 23,
    padding: 4,
  },
  modeOption: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 10,
  },
  modeOptionSelected: { backgroundColor: "#4f46e5" },
  modeOptionLocked: { opacity: 0.45 },
  modeOptionText: { color: "#90a0b8", fontSize: 12, fontWeight: "800" },
  modeOptionTextSelected: { color: "#fff" },
  timerModeHint: {
    color: "#71809a",
    fontSize: 10,
    marginTop: 8,
    textAlign: "center",
  },
  timerActions: { flexDirection: "row", gap: 10, marginTop: 17 },
  timerMainButton: {
    alignItems: "center",
    backgroundColor: "#6366f1",
    borderRadius: 13,
    flex: 1,
    justifyContent: "center",
    minHeight: 49,
  },
  timerMainButtonText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  timerIconButton: {
    alignItems: "center",
    backgroundColor: "#26344e",
    borderRadius: 13,
    justifyContent: "center",
    width: 51,
  },
  timerIconButtonText: { color: "#dbeafe", fontSize: 21, fontWeight: "900" },
  saveSessionButton: {
    alignItems: "center",
    backgroundColor: "#172554",
    borderColor: "#334b89",
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 47,
  },
  saveSessionButtonText: { color: "#bfdbfe", fontSize: 12, fontWeight: "900" },
  twoColumnRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  miniInsight: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  miniInsightLabel: { color: "#8290aa", fontSize: 10, fontWeight: "700" },
  miniInsightValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6,
  },
  studyTipCard: {
    alignItems: "flex-start",
    backgroundColor: "#102d2e",
    borderColor: "#20504f",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    padding: 14,
  },
  studyTipIcon: { color: "#5eead4", fontSize: 18, marginRight: 10 },
  studyTipTitle: {
    color: "#ccfbf1",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },
  studyTipText: { color: "#94c7c1", fontSize: 11, lineHeight: 17 },
  timerHeaderSub: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
  },
  focusRingWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  focusRing: {
    width: 226,
    height: 226,
    borderRadius: 113,
    borderWidth: 10,
    borderColor: "#484a91",
    backgroundColor: "#10172c",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  focusRingInner: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 8,
  },
  focusRingCaption: {
    color: "#9ca9c2",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginTop: 2,
  },
  focusRingDivider: {
    width: 50,
    height: 1,
    backgroundColor: "#354361",
    marginVertical: 12,
  },
  focusRemaining: {
    color: "#c7d2fe",
    fontSize: 12,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  goalProgressTrack: {
    height: 7,
    width: "100%",
    backgroundColor: "#29334d",
    borderRadius: 8,
    overflow: "hidden",
  },
  goalProgressFill: {
    height: "100%",
    backgroundColor: "#a5b4fc",
    borderRadius: 8,
  },
  goalProgressComplete: {
    backgroundColor: "#2dd4bf",
  },
  goalLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  goalLabel: {
    color: "#8290aa",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  goalPercent: {
    color: "#e0e7ff",
    fontSize: 11,
    fontWeight: "900",
  },
  presetRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 18,
  },
  presetButton: {
    minWidth: 0,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#303d59",
    backgroundColor: "#0c1324",
  },
  presetButtonSelected: {
    backgroundColor: "#3730a3",
    borderColor: "#818cf8",
  },
  presetButtonDisabled: {
    opacity: 0.55,
  },
  presetText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "900",
  },
  presetUnit: {
    color: "#8290aa",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  selectionRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 17,
  },
  subjectSelectButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#303d59",
    backgroundColor: "#0c1324",
  },
  subjectSelectDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  subjectSelectText: {
    color: "#aab6ca",
    fontSize: 10,
    fontWeight: "800",
  },
  subjectSelectTextSelected: {
    color: "#ffffff",
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  activityOption: {
    width: "48%",
    flexGrow: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#303d59",
    backgroundColor: "#0c1324",
  },
  activityOptionSelected: {
    backgroundColor: "#29265f",
    borderColor: "#818cf8",
  },
  activityOptionText: {
    color: "#9aa8bd",
    fontSize: 11,
    fontWeight: "700",
  },
  activityOptionTextSelected: {
    color: "#e0e7ff",
  },
  topicInput: {
    backgroundColor: "#0b1425",
    borderColor: "#303d59",
    borderRadius: 12,
    borderWidth: 1,
    color: "#f8fafc",
    fontSize: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 5,
  },
  goalReachedBox: {
    backgroundColor: "#10352e",
    borderColor: "#216e5a",
    borderWidth: 1,
    borderRadius: 13,
    padding: 13,
    marginTop: 16,
  },
  goalReachedTitle: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "900",
  },
  goalReachedCopy: {
    color: "#b7ded5",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  progressCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  progressLabel: {
    color: "#8290aa",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  progressValue: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 4,
  },
  progressValueMuted: { color: "#8290aa", fontSize: 15 },
  progressPercent: { color: "#a5b4fc", fontSize: 20, fontWeight: "900" },
  progressTrack: {
    backgroundColor: "#24324c",
    borderRadius: 5,
    height: 8,
    overflow: "hidden",
  },
  progressFill: { backgroundColor: "#6366f1", borderRadius: 5, height: "100%" },
  subjectCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  subjectHeader: {
    alignItems: "center",
    borderBottomColor: "#22314b",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  subjectNameWrap: { alignItems: "center", flexDirection: "row" },
  subjectDot: { borderRadius: 5, height: 9, marginRight: 8, width: 9 },
  subjectName: { color: "#e9eef8", fontSize: 13, fontWeight: "900" },
  subjectCount: { color: "#8290aa", fontSize: 11, fontWeight: "700" },
  topicRow: {
    alignItems: "center",
    borderBottomColor: "#1e2b42",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 15,
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#4c5b74",
    borderRadius: 7,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    marginRight: 11,
    width: 20,
  },
  checkboxDone: { backgroundColor: "#14b8a6", borderColor: "#2dd4bf" },
  checkboxTick: { color: "#072e2a", fontSize: 13, fontWeight: "900" },
  topicTitle: { color: "#cbd5e1", flex: 1, fontSize: 12, lineHeight: 17 },
  topicTitleDone: { color: "#71809a", textDecorationLine: "line-through" },
  testEntryCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 23,
    padding: 16,
  },
  formTitle: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 16,
  },
  segmentedControl: {
    backgroundColor: "#0c1324",
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 16,
    padding: 4,
  },
  segment: {
    alignItems: "center",
    borderRadius: 9,
    flex: 1,
    paddingVertical: 9,
  },
  segmentSelected: { backgroundColor: "#3942b7" },
  segmentText: { color: "#8290aa", fontSize: 12, fontWeight: "800" },
  segmentTextSelected: { color: "#fff" },
  historyCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 5,
    overflow: "hidden",
  },
  testHistoryRow: {
    alignItems: "center",
    borderBottomColor: "#20304a",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 63,
    paddingHorizontal: 14,
  },
  testTypeDot: {
    backgroundColor: "#8b5cf6",
    borderRadius: 5,
    height: 10,
    marginRight: 10,
    width: 10,
  },
  testTypeDotPyq: { backgroundColor: "#14b8a6" },
  testHistoryText: { flex: 1, marginRight: 8 },
  testHistoryTitle: { color: "#e5eaf3", fontSize: 12, fontWeight: "800" },
  testHistoryMeta: { color: "#8290aa", fontSize: 10, marginTop: 4 },
  testScore: { color: "#fcd34d", fontSize: 18, fontWeight: "900" },
  reportMetricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 13,
  },
  reportMetric: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 15,
    borderWidth: 1,
    minHeight: 94,
    padding: 13,
    width: "48.5%",
  },
  reportMetricDot: { borderRadius: 3, height: 5, marginBottom: 11, width: 20 },
  reportMetricValue: { color: "#f8fafc", fontSize: 21, fontWeight: "900" },
  reportMetricLabel: { color: "#8290aa", fontSize: 10, marginTop: 7 },
  chartCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  chartHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  chartTitle: { color: "#f1f5f9", fontSize: 15, fontWeight: "900" },
  chartSubtext: { color: "#8290aa", fontSize: 10, marginTop: 4 },
  chartTotal: { color: "#a5b4fc", fontSize: 16, fontWeight: "900" },
  barChart: {
    alignItems: "flex-end",
    flexDirection: "row",
    height: 137,
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  barTrack: {
    backgroundColor: "#1f2d48",
    borderRadius: 5,
    height: 104,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 15,
  },
  barFill: { backgroundColor: "#706cf4", borderRadius: 5, width: "100%" },
  barLabel: { color: "#8290aa", fontSize: 9, marginTop: 8 },
  reportSplitCard: {
    alignItems: "center",
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 24,
    padding: 16,
  },
  reportSplitItem: { flex: 1 },
  reportSplitLabel: {
    color: "#8290aa",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  reportSplitValue: {
    color: "#e8edf7",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 6,
  },
  reportDivider: { backgroundColor: "#2a3953", height: 31, width: 1 },
  scoreTrendCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 4,
    padding: 14,
  },
  scoreTrendRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 13,
  },
  scoreTrendName: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "800",
    width: 42,
  },
  scoreTrendTrack: {
    backgroundColor: "#25334d",
    borderRadius: 4,
    flex: 1,
    height: 8,
    overflow: "hidden",
  },
  scoreTrendFill: {
    backgroundColor: "#f59e0b",
    borderRadius: 4,
    height: "100%",
  },
  scoreTrendValue: {
    color: "#fcd34d",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 9,
    textAlign: "right",
    width: 34,
  },

  goalCard: {
    backgroundColor: "#151b35",
    borderColor: "#3a3e77",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 13,
    padding: 16,
  },
  goalCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  goalCardTitleWrap: { flex: 1, paddingRight: 8 },
  goalCardEyebrow: {
    color: "#a5b4fc",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 7,
  },
  goalCardTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "900",
  },
  goalCardMuted: {
    color: "#8b9bb5",
    fontSize: 13,
    fontWeight: "700",
  },
  goalBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29265f",
    borderColor: "#5a56a9",
    borderWidth: 1,
    borderRadius: 15,
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  goalBadgeText: {
    color: "#e0e7ff",
    fontSize: 15,
    fontWeight: "900",
  },
  goalTrack: {
    height: 9,
    backgroundColor: "#27324b",
    borderRadius: 8,
    overflow: "hidden",
  },
  goalFill: {
    height: "100%",
    backgroundColor: "#818cf8",
    borderRadius: 8,
  },
  goalFillComplete: {
    backgroundColor: "#2dd4bf",
  },
  goalFootnote: {
    color: "#9aa8bd",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 9,
  },
  breakdownCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 17,
    padding: 15,
  },
  breakdownRow: {
    marginBottom: 15,
  },
  breakdownTopline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breakdownLabelWrap: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    paddingRight: 8,
  },
  breakdownDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  breakdownName: {
    color: "#dbe4f2",
    fontSize: 11,
    fontWeight: "800",
    flex: 1,
  },
  breakdownValue: {
    color: "#f1f5f9",
    fontSize: 11,
    fontWeight: "900",
  },
  breakdownTrack: {
    height: 7,
    backgroundColor: "#25334d",
    borderRadius: 5,
    overflow: "hidden",
  },
  breakdownFill: {
    height: "100%",
    borderRadius: 5,
  },
  breakdownPercent: {
    color: "#7f8da6",
    fontSize: 9,
    marginTop: 5,
  },

  analyticsChartCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 15,
    padding: 15,
  },
  analyticsChartTitle: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "900",
  },
  analyticsChartSubtitle: {
    color: "#8290aa",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
    marginBottom: 10,
  },
  analyticsChartFoot: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 2,
  },
  analyticsChartLegendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },
  analyticsChartLegendText: {
    color: "#aab7cb",
    fontSize: 10,
    fontWeight: "800",
  },
  donutLayout: {
    alignItems: "center",
    flexDirection: "row",
  },
  donutChartWrap: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  donutLegend: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 8,
  },
  donutLegendRow: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 7,
  },
  donutLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },
  donutLegendCopy: {
    flex: 1,
    minWidth: 0,
  },
  donutLegendLabel: {
    color: "#dbe4f2",
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14,
  },
  donutLegendDuration: {
    color: "#8290aa",
    fontSize: 9,
    marginTop: 2,
  },
  donutLegendPercent: {
    color: "#e2e8f0",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: "#151b35",
    borderColor: "#393d77",
    borderRadius: 21,
    borderWidth: 1,
    marginBottom: 24,
    padding: 22,
  },
  profileAvatar: {
    alignItems: "center",
    backgroundColor: "#5b57d6",
    borderRadius: 27,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  profileAvatarText: { color: "#fff", fontSize: 21, fontWeight: "900" },
  profileName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 11,
  },
  profileRole: { color: "#a5b4fc", fontSize: 12, marginTop: 4 },
  uidText: {
    color: "#8290aa",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 9,
    marginTop: 18,
    textAlign: "center",
  },
  securityListCard: {
    backgroundColor: "#111a2e",
    borderColor: "#24324c",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
  },
  securityRow: {
    alignItems: "center",
    borderBottomColor: "#22314b",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 55,
    paddingHorizontal: 14,
  },
  securityRowIcon: {
    alignItems: "center",
    backgroundColor: "#103a35",
    borderRadius: 9,
    height: 23,
    justifyContent: "center",
    marginRight: 10,
    width: 23,
  },
  securityRowIconText: { color: "#5eead4", fontSize: 13, fontWeight: "900" },
  securityRowText: { color: "#cbd5e1", flex: 1, fontSize: 11, lineHeight: 16 },
  signOutButton: {
    alignItems: "center",
    backgroundColor: "#421f2d",
    borderColor: "#843a4d",
    borderRadius: 14,
    borderWidth: 1,
    padding: 15,
  },
  signOutButtonText: { color: "#fecdd3", fontSize: 14, fontWeight: "900" },
  profileFootnote: {
    color: "#71809a",
    fontSize: 10,
    lineHeight: 15,
    marginHorizontal: 12,
    marginTop: 11,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  emptyStateIcon: { color: "#8290aa", fontSize: 22, marginBottom: 8 },
  emptyStateText: {
    color: "#8290aa",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  syllabusNotice: {
    backgroundColor: "#11263a",
    borderColor: "#25445f",
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    marginBottom: 17,
  },
  syllabusNoticeTitle: {
    color: "#bae6fd",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
  },
  syllabusNoticeText: {
    color: "#b6c7da",
    fontSize: 11,
    lineHeight: 17,
  },
  syllabusNoticeLink: {
    color: "#a5b4fc",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 9,
  },
  subjectProgressTrack: {
    height: 4,
    backgroundColor: "#24324c",
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 5,
    overflow: "hidden",
  },
  subjectProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  syllabusUnit: {
    borderTopWidth: 1,
    borderTopColor: "#22314b",
  },
  syllabusUnitHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 72,
  },
  syllabusUnitText: {
    flex: 1,
    paddingRight: 9,
  },
  syllabusUnitEyebrow: {
    color: "#8f9fba",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  syllabusUnitTitle: {
    color: "#e8edf7",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  syllabusUnitMeta: {
    color: "#8493ad",
    fontSize: 10,
    marginTop: 5,
  },
  syllabusUnitRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  syllabusUnitComplete: {
    color: "#5eead4",
    fontSize: 16,
    fontWeight: "900",
  },
  syllabusUnitChevron: {
    color: "#c7d2fe",
    fontSize: 22,
    fontWeight: "700",
    width: 22,
    textAlign: "center",
  },
  subtopicList: {
    backgroundColor: "#0b1322",
    paddingLeft: 13,
    paddingRight: 12,
    paddingBottom: 5,
  },
  subtopicRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "#1d2a40",
  },
  subtopicIndex: {
    color: "#71809a",
    fontSize: 9,
    fontWeight: "800",
    width: 25,
    marginLeft: 9,
  },
  subtopicTitle: {
    color: "#cbd5e1",
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
