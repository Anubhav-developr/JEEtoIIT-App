import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
} from "react-native";

export default function AppHeader({
  title = "JEEtoIIT",
  subtitle = "STUDENT PORTAL",
  displayName = "Student",
  photoURL = "",
  onMenuPress,
  onProfilePress,
}) {
  const initials = getInitials(displayName);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
        onPress={onMenuPress}
        style={styles.menuButton}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={onProfilePress}
        style={styles.avatar}
      >
        {photoURL ? (
          <Image
            accessibilityLabel={`${displayName} profile photo`}
            source={{ uri: photoURL }}
            resizeMode="cover"
            style={styles.avatarImage}
          />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function getInitials(value) {
  const clean = String(value || "").trim();
  const name = clean.includes("@")
    ? clean.slice(0, clean.indexOf("@")).replace(/[._-]+/g, " ")
    : clean;

  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "S"
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 18,
    paddingBottom: 14,
    backgroundColor: "#080d1b",
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#172238",
    borderWidth: 1,
    borderColor: "#2b3a55",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    fontSize: 22,
    color: "#e8edf7",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 13,
  },
  subtitle: {
    color: "#a5b4fc",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: "#f8fafc",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#818cf8",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
