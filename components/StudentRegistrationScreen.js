import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { httpsCallable } from "@react-native-firebase/functions";

const TARGET_OPTIONS = [
  "JEE 2027",
  "JEE 2028",
  "Class 11",
  "Class 12",
  "Dropper",
  "Other",
];

export function StudentRegistrationScreen({
  appCheckInstance,
  appCheckReady,
  appCheckError,
  functions,
  onBack,
}) {
  const [name, setName] = useState("");
  const [targetExam, setTargetExam] = useState("JEE 2027");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async () => {
    Keyboard.dismiss();
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      setError("Apna valid full name enter karein.");
      return;
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setError("Valid email address enter karein.");
      return;
    }

    if (!appCheckReady || !appCheckInstance) {
      setError(
        `Security verification ready nahi hai. ${appCheckError || "Thodi der baad retry karein."}`,
      );
      return;
    }

    if (!functions) {
      setError("Firebase connection available nahi hai.");
      return;
    }

    setBusy(true);

    try {
      // App Check must succeed before registration is submitted.
      const appCheckResult = await appCheckInstance.getToken(false);
      if (!appCheckResult?.token) {
        throw new Error("App Check token nahi mila. Dobara try karein.");
      }

      // Reuse the existing web backend registration workflow.
      const submitRegistration = httpsCallable(
        functions,
        "submitStudentRegistration",
      );

      const result = await submitRegistration({
        name: cleanName,
        targetExam,
        email: cleanEmail,
      });

      setSuccess(
        result?.data?.message ||
          "Registration request submit ho gayi. Email verify karein aur admin approval ka wait karein.",
      );
      setName("");
      setEmail("");
      setTargetExam("JEE 2027");
    } catch (err) {
      console.error("[Android] student registration failed", err);

      const code = String(err?.code || "").replace(/^functions\//, "");

      if (code === "already-exists") {
        setError("Is email se registration pehle hi submit ho chuki hai.");
      } else if (code === "resource-exhausted") {
        setError("Bahut attempts ho gaye. 15 minutes baad dobara try karein.");
      } else if (code === "failed-precondition" || code === "app-check") {
        setError(
          "Security verification fail hui. App Check configuration aur internet check karein.",
        );
      } else if (code === "unauthenticated") {
        setError(
          "Request verify nahi ho saki. Email details check karke dobara try karein.",
        );
      } else {
        setError(
          "Registration submit nahi hui. Internet aur Firebase registration service check karein.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar backgroundColor="#080d1b" barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <TouchableOpacity
              onPress={onBack}
              disabled={busy}
              style={styles.backButton}
              accessibilityRole="button"
            >
              <Text style={styles.backText}>‹ Back to login</Text>
            </TouchableOpacity>

            <View style={styles.brandMark}>
              <Text style={styles.brandText}>JI</Text>
            </View>

            <Text style={styles.eyebrow}>JEE 2027 · STUDENT PORTAL</Text>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Register karein, email verify karein aur approval ke baad apna
              access code receive karein.
            </Text>

            <Text style={styles.label}>STUDENT NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#64748b"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              maxLength={80}
              returnKeyType="next"
              editable={!busy && !success}
              style={styles.input}
              accessibilityLabel="Student name"
            />

            <Text style={styles.label}>CLASS / TARGET EXAM</Text>
            <View style={styles.options}>
              {TARGET_OPTIONS.map((option) => {
                const selected = targetExam === option;

                return (
                  <TouchableOpacity
                    key={option}
                    disabled={busy || Boolean(success)}
                    onPress={() => setTargetExam(option)}
                    style={[styles.option, selected && styles.optionSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="student@example.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              maxLength={254}
              returnKeyType="done"
              onSubmitEditing={submit}
              editable={!busy && !success}
              style={styles.input}
              accessibilityLabel="Email address"
            />

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!!success && (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>
                  Registration request submitted
                </Text>
                <Text style={styles.successText}>{success}</Text>
                <Text style={styles.successText}>
                  Inbox aur spam folder check karein. Portal access automatic
                  nahi milega; admin approval zaroori hai.
                </Text>
              </View>
            )}

            {!success && (
              <TouchableOpacity
                accessibilityRole="button"
                disabled={busy || !appCheckReady}
                onPress={submit}
                style={[
                  styles.primaryButton,
                  (busy || !appCheckReady) && styles.disabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Request registration →
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onBack}
              disabled={busy}
              style={styles.footerButton}
            >
              <Text style={styles.footerText}>
                Already registered? Back to login
              </Text>
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Text style={styles.securityTitle}>Secure registration</Text>
              <Text style={styles.securityText}>
                Firebase App Check · Email verification · Admin approval
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: "#080d1b" },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 28,
  },
  card: {
    backgroundColor: "#111a2e",
    borderColor: "#293653",
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
  },
  backButton: { alignSelf: "flex-start", marginBottom: 22, paddingVertical: 6 },
  backText: { color: "#a5b4fc", fontSize: 14, fontWeight: "700" },
  brandMark: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  brandText: { color: "#fff", fontSize: 23, fontWeight: "900" },
  eyebrow: {
    color: "#a5b4fc",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 9,
  },
  title: {
    color: "#f8fafc",
    fontSize: 27,
    fontWeight: "900",
    marginBottom: 9,
  },
  subtitle: {
    color: "#9aa8bd",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginTop: 15,
    marginBottom: 9,
  },
  input: {
    backgroundColor: "#0b1222",
    borderColor: "#344563",
    borderWidth: 1,
    borderRadius: 13,
    color: "#fff",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    backgroundColor: "#0b1222",
    borderColor: "#344563",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  optionSelected: {
    backgroundColor: "#29265f",
    borderColor: "#818cf8",
  },
  optionText: { color: "#94a3b8", fontSize: 11, fontWeight: "700" },
  optionTextSelected: { color: "#e0e7ff" },
  primaryButton: {
    backgroundColor: "#5b55e7",
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  disabled: { opacity: 0.5 },
  primaryButtonText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  errorBox: {
    backgroundColor: "#3b1825",
    borderColor: "#7f1d3d",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  errorText: { color: "#fecdd3", fontSize: 12, lineHeight: 18 },
  successBox: {
    backgroundColor: "#10352e",
    borderColor: "#216e5a",
    borderWidth: 1,
    borderRadius: 13,
    padding: 13,
    marginTop: 17,
    gap: 7,
  },
  successTitle: { color: "#a7f3d0", fontSize: 13, fontWeight: "900" },
  successText: { color: "#cbd5e1", fontSize: 12, lineHeight: 18 },
  footerButton: { alignItems: "center", paddingVertical: 17 },
  footerText: { color: "#a5b4fc", fontSize: 11, fontWeight: "800" },
  securityNote: {
    backgroundColor: "#0c2530",
    borderColor: "#19434c",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 5,
  },
  securityTitle: { color: "#99f6e4", fontSize: 11, fontWeight: "900" },
  securityText: {
    color: "#9cc9c9",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },
});
