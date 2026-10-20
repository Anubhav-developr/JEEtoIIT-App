import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ProfileScreen({ user, onSignOut }) {
  const name = user?.displayName || "JEE 2027 Student";
  const email = user?.email || "Email not available";

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {String(name).charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>Your JEEtoIIT account</Text>

      <View style={styles.card}>
        <Text style={styles.label}>STUDENT</Text>
        <Text style={styles.value}>{name}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>EMAIL</Text>
        <Text style={styles.value}>{email}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>PREPARATION GOAL</Text>
        <Text style={styles.value}>JEE 2027</Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={onSignOut}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: "#312e81",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  avatarText: {
    color: "#e0e7ff",
    fontSize: 30,
    fontWeight: "900",
  },
  title: {
    color: "#f8fafc",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 17,
  },
  subtitle: {
    color: "#8b9ab4",
    marginTop: 5,
    marginBottom: 25,
  },
  card: {
    width: "100%",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#111a2e",
    borderWidth: 1,
    borderColor: "#26344e",
  },
  label: {
    color: "#8290aa",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 7,
  },
  value: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#26344e",
    marginVertical: 17,
  },
  button: {
    width: "100%",
    padding: 15,
    marginTop: 18,
    borderRadius: 13,
    backgroundColor: "#38212e",
    alignItems: "center",
  },
  buttonText: {
    color: "#fda4af",
    fontSize: 14,
    fontWeight: "900",
  },
});
