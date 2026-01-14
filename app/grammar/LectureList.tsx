import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/theme/ThemeProvider";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LectureList: React.FC<LectureListProps> = ({ lectures, progressMap }) => {
  const { colors, spacing, typography } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);

  const unlockedLectureIds = useMemo(() => {
    const unlocked = new Set<string>();
    lectures.forEach((lecture, index) => {
      if (index === 0) {
        unlocked.add(lecture._id);
        return;
      }
      const prevLectureId = lectures[index - 1]?._id;
      const prevProgress = progressMap.get(prevLectureId);
      if (prevProgress?.testPassed) unlocked.add(lecture._id);
    });
    return unlocked;
  }, [lectures, progressMap]);

  const toggleExpand = (id: string, isLocked: boolean) => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === id ? null : id);
  };

  const renderSubItem = ({ title, locked, onPress, icon, type }: any) => (
    <Pressable
      key={title}
      onPress={() => !locked && onPress()}
      style={({ pressed }) => [
        styles.subItem,
        {
          backgroundColor: colors.background, // Contrast against surface
          borderColor: colors.text + "08",
          opacity: locked ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.subItemContent}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor:
                type === "speaking" ? "#4775FF20" : colors.primary + "20",
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={type === "speaking" ? "#4775FF" : colors.primary}
          />
        </View>
        <Text
          style={[styles.subItemText, { color: colors.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <Ionicons
        name={locked ? "lock-closed" : "chevron-forward"}
        size={16}
        color={colors.text + "40"}
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {lectures.map((lecture, index) => {
        const isUnlocked = unlockedLectureIds.has(lecture._id);
        const isExpanded = expanded === lecture._id;
        const isLast = index === lectures.length - 1;

        return (
          <View
            key={lecture._id}
            style={[
              styles.chapterWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + "08",
                marginBottom: isLast ? 100 : 16,
              },
            ]}
          >
            {/* Chapter Header */}
            <Pressable
              onPress={() => toggleExpand(lecture._id, !isUnlocked)}
              style={styles.chapterHeader}
            >
              <View style={styles.chapterInfo}>
                <View
                  style={[
                    styles.numberBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.chapterTitle, { color: colors.text }]}>
                  {lecture.title}
                </Text>
              </View>

              {!isUnlocked ? (
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={colors.text + "30"}
                />
              ) : (
                <View
                  style={[
                    styles.chevronCircle,
                    { backgroundColor: colors.text + "05" },
                  ]}
                >
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.text}
                  />
                </View>
              )}
            </Pressable>

            {/* Expansion Content */}
            {isExpanded && (
              <View style={styles.expandedContent}>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: colors.text + "05" },
                  ]}
                />

                {lecture.speaking && (
                  <View style={styles.section}>
                    <Text
                      style={[
                        styles.sectionLabel,
                        { color: colors.text + "50" },
                      ]}
                    >
                      COMMUNICATION
                    </Text>
                    {renderSubItem({
                      type: "speaking",
                      icon: "mic-outline",
                      title: lecture.speaking.title,
                      locked: !isUnlocked,
                      onPress: () =>
                        router.push({
                          pathname: ROUTES.GRAMMAR_SPEAKING,
                          params: { speakingId: lecture.speaking?._id },
                        }),
                    })}
                  </View>
                )}

                <View style={styles.section}>
                  <Text
                    style={[styles.sectionLabel, { color: colors.text + "50" }]}
                  >
                    GRAMMAR PATTERNS
                  </Text>
                  {lecture.grammarPatterns?.map((g: any) =>
                    renderSubItem({
                      type: "grammar",
                      icon: "book-outline",
                      title: g.title || g.structure,
                      locked: !isUnlocked,
                      onPress: () =>
                        router.push({
                          pathname: ROUTES.GRAMMAR_CHAPTER,
                          params: { lectureId: lecture._id, patternId: g._id },
                        }),
                    })
                  )}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chapterWrapper: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  chapterInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: { color: "white", fontSize: 14, fontWeight: "800" },
  chapterTitle: { fontSize: 17, fontWeight: "700", flex: 1 },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  expandedContent: { padding: 16, paddingTop: 0 },
  divider: { height: 1, marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  subItemContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subItemText: { fontSize: 15, fontWeight: "600", flex: 1 },
});

export default LectureList;
