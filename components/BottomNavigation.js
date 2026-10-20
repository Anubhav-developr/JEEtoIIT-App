import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ITEMS = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "study", label: "Study", icon: "◷" },
  { key: "syllabus", label: "Syllabus", icon: "✓" },
  { key: "tests", label: "Tests", icon: "▣" },
  { key: "reports", label: "Reports", icon: "↗" },
];

export default function BottomNavigation({ activeTab, onNavigate }) {
  return (
    <View style={styles.container}>
      {ITEMS.map((item) => {
        const active = activeTab === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => onNavigate(item.key)}
            style={styles.item}
          >
            <View style={[styles.iconBox, active && styles.iconBoxActive]}>
              <Text style={[styles.icon, active && styles.iconActive]}>
                {item.icon}
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={[styles.label, active && styles.labelActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#0d1525",
    borderTopWidth: 1,
    borderTopColor: "#26344e",
    paddingTop: 8,
    paddingBottom: 9,
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  iconBox: {
    width: 38,
    height: 30,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: {
    backgroundColor: "#29265f",
  },
  icon: {
    fontSize: 20,
    color: "#71809a",
  },
  iconActive: {
    color: "#c7d2fe",
  },
  label: {
    color: "#71809a",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },
  labelActive: {
    color: "#e0e7ff",
  },
});
