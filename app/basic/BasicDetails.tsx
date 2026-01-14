import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GET_STARTED } from "@/constants/basic";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { width } = Dimensions.get("window");

const BasicDetails = () => {
  const { lectureId } = useLocalSearchParams<{ lectureId: string }>();
  const { colors, spacing, typography, mode } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();

  // Logic to find current, prev, and next lectures
  const allLectures = GET_STARTED.flatMap((s) => s.description);
  const currentIndex = allLectures.findIndex(
    (l) => l._id.toString() === lectureId
  );
  const lecture = allLectures[currentIndex];

  const prevLecture = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLecture =
    currentIndex < allLectures.length - 1
      ? allLectures[currentIndex + 1]
      : null;

  // Animation & Scroll Logic
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const currentY = e.nativeEvent.contentOffset.y;
        if (currentY > lastScrollY.current && currentY > 60) {
          Animated.spring(floatAnim, {
            toValue: 120,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(floatAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
        lastScrollY.current = currentY;
      },
    }
  );

  const handleNavigate = (lec: any) => {
    Haptics.selectionAsync();
    router.setParams({ lectureId: lec._id.toString() });
    // If router.setParams doesn't trigger scroll to top, use router.push:
    // router.push({ pathname: ROUTES.BASIC_DETAILS, params: { lectureId: lec._id.toString() } });
  };

  const progressWidth = scrollY.interpolate({
    inputRange: [0, 800], // Increased range for better feel
    outputRange: [0, width],
    extrapolate: "clamp",
  });

  const speakJP = (char: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(char, { language: "ja-JP", rate: 0.7 });
  };

  if (!lecture) return null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View
        style={[styles.progressTrack, { backgroundColor: colors.text + "10" }]}
      >
        <Animated.View
          style={[
            styles.progressBar,
            { width: progressWidth, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 180 }}
      >
        <Text
          style={[
            typography.h3,
            { color: colors.text, fontWeight: "800", marginBottom: 20 },
          ]}
        >
          {lecture.title}
        </Text>

        {lecture.content?.map((cont: any) => (
          <View key={cont._id} style={styles.contentBox}>
            <View style={styles.tagRow}>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{cont.tag}</Text>
              </View>
              <Text
                style={[
                  typography.subtitle1,
                  { color: colors.text, fontWeight: "700" },
                ]}
              >
                {cont.title}
              </Text>
            </View>
            <View
              style={[
                styles.descriptionCard,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={[
                  typography.body1,
                  { color: colors.text, lineHeight: 24 },
                ]}
              >
                {cont.description}
              </Text>
            </View>
          </View>
        ))}

        {/* Kana Grid Table */}
        {/* Kana Grid Table */}
        {lecture?.table?.rows?.map((row: any) => (
          <View key={row._id} style={styles.rowWrapper}>
            {row.hira.map((char: string, idx: number) => {
              const romaji = row.romaji[idx];
              const isEmpty = !char || char === "";

              return (
                <Pressable
                  key={idx}
                  onPress={() => char && speakJP(char)}
                  style={({ pressed }) => [
                    styles.dynamicKanaCard,
                    {
                      backgroundColor: isEmpty ? "transparent" : colors.surface,
                      // flex: 1 makes the card grow to fill available row space
                      flex: 1,
                      borderWidth: isEmpty ? 0 : 1,
                      borderColor: colors.text + "08",
                      transform: [{ scale: pressed && char ? 0.94 : 1 }],
                    },
                  ]}
                >
                  {!isEmpty && (
                    <>
                      <Text style={[styles.kanaText, { color: colors.text }]}>
                        {char}
                      </Text>
                      <Text
                        style={[styles.romajiText, { color: colors.primary }]}
                      >
                        {romaji}
                      </Text>
                      <View
                        style={[
                          styles.audioIndicator,
                          { backgroundColor: colors.primary + "15" },
                        ]}
                      >
                        <Ionicons
                          name="volume-low"
                          size={10}
                          color={colors.primary}
                        />
                      </View>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        {lecture?.table?.example && (
          <View style={styles.exampleSection}>
            <Text
              style={[
                typography.h6,
                { color: colors.text, fontWeight: "800", marginBottom: 16 },
              ]}
            >
              Examples
            </Text>
            {lecture.table.example.map((eg: any) => (
              <View
                key={eg._id}
                style={[styles.exampleRow, { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.kanaExample, { color: colors.text }]}>
                  {eg.hiragana}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.romajiExample, { color: colors.primary }]}>
                  {eg.romaji}
                </Text>
                <Pressable
                  onPress={() => speakJP(eg.hiragana)}
                  style={styles.miniSpeaker}
                >
                  <Ionicons
                    name="volume-medium"
                    size={18}
                    color={colors.primary}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <Animated.View
        style={[styles.navWrapper, { transform: [{ translateY: floatAnim }] }]}
      >
        <BlurView
          intensity={80}
          tint={mode === "dark" ? "dark" : "light"}
          style={styles.blurNav}
        >
          <View style={styles.navSideSection}>
            <Pressable
              disabled={!prevLecture}
              onPress={() => prevLecture && handleNavigate(prevLecture)}
              style={({ pressed }) => [
                styles.sideAction,
                { opacity: !prevLecture ? 0.2 : pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
              <Text style={[styles.navText, { color: colors.text }]}>
                {language === "jp"
                  ? "前へ"
                  : language === "mm"
                  ? "ယခင်"
                  : "Prev"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.navCenterSection}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(ROUTES.BASIC_INFO);
              }}
              style={({ pressed }) => [
                styles.homeCircle,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                },
              ]}
            >
              <Ionicons name="grid" size={22} color="white" />
            </Pressable>
          </View>

          <View style={styles.navSideSection}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                nextLecture
                  ? handleNavigate(nextLecture)
                  : router.push(ROUTES.BASIC_EXAM);
              }}
              style={({ pressed }) => [
                styles.sideAction,
                { opacity: pressed ? 0.6 : 1, justifyContent: "flex-end" },
              ]}
            >
              <Text
                style={[
                  styles.navText,
                  { color: colors.text, fontWeight: "700" },
                ]}
              >
                {nextLecture
                  ? language === "jp"
                    ? "次へ"
                    : language === "mm"
                    ? "နောက်"
                    : "Next"
                  : language === "jp"
                  ? "終了"
                  : language === "mm"
                  ? "ပြီး"
                  : "Finish"}
              </Text>
              <Ionicons
                name={nextLecture ? "chevron-forward" : "checkmark-done"}
                size={22}
                color={colors.primary}
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          </View>
        </BlurView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressTrack: { height: 4, width: "100%" },
  progressBar: { height: "100%" },
  contentBox: { marginBottom: 24 },
  tagRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  badgeText: { color: "white", fontSize: 10, fontWeight: "900" },
  descriptionCard: { padding: 16, borderRadius: 18 },
  exampleSection: { marginTop: 10 },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  kanaExample: { flex: 1, fontSize: 18, fontWeight: "600" },
  romajiExample: { marginHorizontal: 12, fontWeight: "700" },
  miniSpeaker: { padding: 4 },
  navWrapper: {
    position: "absolute",
    bottom: 34,
    left: 20,
    right: 20,
    borderRadius: 35,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  blurNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    height: 70,
  },
  navSideSection: { flex: 1, alignItems: "center" },
  navCenterSection: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  sideAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    width: "100%",
  },
  homeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  rowWrapper: {
    flexDirection: "row",
    width: '100%',
    gap: 8,            // Space between cards
    marginBottom: 8,   // Space between rows
  },
  navText: { fontSize: 15, fontWeight: "600", marginHorizontal: 4 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start", // Keeps characters aligned to the left
    gap: 10,
    marginBottom: 24,
  },
  kanaCard: {
    // Calculated for a 5-column layout with 10px gaps
    width: (width - 40 - 40) / 5,
    height: 75,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  audioDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  dynamicKanaCard: {
    height: 72,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    // iOS 26 Glassmorphism depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  kanaText: {
    fontSize: 22,
    fontWeight: "700",
  },
  romajiText: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    opacity: 0.8,
  },
  audioIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 3,
    borderRadius: 10,
  }
});

export default BasicDetails;
