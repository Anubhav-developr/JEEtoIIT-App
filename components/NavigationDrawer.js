import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";

const MENU_ITEMS = [
  { key: "home", label: "Home", icon: "⌂", group: "LEARN" },
  { key: "study", label: "Study Timer", icon: "◷", group: "LEARN" },
  { key: "syllabus", label: "Syllabus Tracker", icon: "✓", group: "LEARN" },
  { key: "tests", label: "Tests & PYQs", icon: "▣", group: "ANALYTICS" },
  { key: "reports", label: "Study Reports", icon: "↗", group: "ANALYTICS" },
  { key: "profile", label: "My Profile", icon: "◎", group: "ACCOUNT" },
];

export default function NavigationDrawer({
  visible,
  activeTab,
  onNavigate,
  onClose,
  onSignOut,
  user,
  photoURL = "",
}) {
  const emailName = String(user?.email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();
  const displayName = user?.displayName?.trim() || emailName || "JEE 2027 Student";
  const initials = getInitials(displayName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close navigation menu"
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <View style={styles.brandMark}>
              <Text style={styles.brandText}>JI</Text>
            </View>

            <View style={styles.brandInfo}>
              <Text style={styles.brandTitle}>JEEtoIIT</Text>
              <Text style={styles.brandSubtitle}>YOUR JEE 2027 JOURNEY</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close menu"
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.studentCard}>
            <View style={styles.studentAvatar}>
              {photoURL ? (
                <Image
                  accessibilityLabel={`${displayName} profile photo`}
                  source={{ uri: photoURL }}
                  resizeMode="cover"
                  style={styles.studentAvatarImage}
                />
              ) : (
                <Text style={styles.studentAvatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.studentInfo}>
              <Text numberOfLines={1} style={styles.studentName}>
                {displayName}
              </Text>
              <Text style={styles.studentLabel}>JEE 2027 Aspirant</Text>
            </View>
          </View>

          <ScrollView
            style={styles.menuScroll}
            showsVerticalScrollIndicator={false}
          >
            {["LEARN", "ANALYTICS", "ACCOUNT"].map((group) => {
              const items = MENU_ITEMS.filter((item) => item.group === group);

              return (
                <View key={group} style={styles.menuGroup}>
                  <Text style={styles.groupLabel}>{group}</Text>

                  {items.map((item) => {
                    const selected = activeTab === item.key;

                    return (
                      <TouchableOpacity
                        key={item.key}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => onNavigate(item.key)}
                        style={[
                          styles.menuItem,
                          selected && styles.menuItemActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.menuIcon,
                            selected && styles.menuIconActive,
                          ]}
                        >
                          {item.icon}
                        </Text>

                        <Text
                          style={[
                            styles.menuLabel,
                            selected && styles.menuLabelActive,
                          ]}
                        >
                          {item.label}
                        </Text>

                        {selected && <View style={styles.activeIndicator} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <View style={styles.footerDivider} />

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                onClose();
                onSignOut();
              }}
              style={styles.signOutButton}
            >
              <Text style={styles.signOutIcon}>↪</Text>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>

            <Text style={styles.version}>JEEtoIIT • STUDENT PORTAL</Text>
          </View>
        </View>
      </View>
    </Modal>
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
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    width: "84%",
    maxWidth: 350,
    height: "100%",
    backgroundColor: "#0d1525",
    borderRightWidth: 1,
    borderRightColor: "#26344e",
    paddingTop: 42,
    paddingHorizontal: 17,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  brandInfo: {
    flex: 1,
    marginLeft: 11,
  },
  brandTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
  },
  brandSubtitle: {
    color: "#8b9ab4",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 3,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#1b2940",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#e2e8f0",
    fontSize: 25,
    lineHeight: 28,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#151f33",
    borderWidth: 1,
    borderColor: "#26344e",
    marginBottom: 24,
  },
  studentAvatar: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#312e81",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#4f46e5",
  },
  studentAvatarImage: {
    width: "100%",
    height: "100%",
  },
  studentAvatarText: {
    color: "#c7d2fe",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 11,
  },
  studentName: {
    color: "#f8fafc",
    fontWeight: "800",
    fontSize: 13,
  },
  studentLabel: {
    color: "#8290aa",
    fontSize: 11,
    marginTop: 4,
  },
  menuScroll: {
    flex: 1,
  },
  menuGroup: {
    marginBottom: 20,
  },
  groupLabel: {
    color: "#73829d",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 9,
    marginLeft: 8,
  },
  menuItem: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 13,
    marginBottom: 4,
    position: "relative",
  },
  menuItemActive: {
    backgroundColor: "#25245a",
    borderWidth: 1,
    borderColor: "#3d3a85",
  },
  menuIcon: {
    color: "#8b9ab4",
    fontSize: 20,
    width: 31,
    textAlign: "center",
  },
  menuIconActive: {
    color: "#c7d2fe",
  },
  menuLabel: {
    flex: 1,
    color: "#aab6ca",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },
  menuLabelActive: {
    color: "#fff",
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#a5b4fc",
  },
  drawerFooter: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#26344e",
    marginBottom: 12,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  signOutIcon: {
    color: "#fda4af",
    fontSize: 20,
    width: 31,
    textAlign: "center",
  },
  signOutText: {
    color: "#fda4af",
    fontWeight: "800",
    marginLeft: 8,
    fontSize: 13,
  },
  version: {
    color: "#586780",
    textAlign: "center",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 12,
  },
});
