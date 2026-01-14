import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { grammarApi } from "@/api/grammarApi";
import { lessonApi } from "@/api/lessonApi";
import { ROUTES } from "@/constants/routes";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import RenderFurigana from "../components/RenderFurigana";

const { width } = Dimensions.get("window");

const ChapterDetails = () => {
  const { lectureId, patternId } = useLocalSearchParams<{
    lectureId: string;
    patternId: string;
  }>();

  const { language } = useLanguage();
  const { colors, spacing, typography } = useTheme();

  const [lecture, setLecture] = useState<any>(null);
  const [grammar, setGrammar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Animation for the floating bar
  const floatAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lectureRes, grammarRes] = await Promise.all([
          lessonApi.getLesson(lectureId),
          grammarApi.getGrammar(patternId),
        ]);
        setLecture(lectureRes.data);
        setGrammar(grammarRes.data);

        // Slide the navigation bar up once data is ready
        Animated.spring(floatAnim, {
          toValue: 0,
          tension: 20,
          friction: 8,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lectureId, patternId]);

  const handleExampleInteraction = (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Sentence Options", text, [
      {
        text: "Listen (JP)",
        onPress: () => Speech.speak(text, { language: "ja-JP", rate: 0.85 }),
      },
      {
        text: "Copy Text",
        onPress: async () => {
          await Clipboard.setStringAsync(text);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!lecture || !grammar) return null;

  /* ================= NAVIGATION LOGIC ================= */
  const getGrammarId = (g: any) => (typeof g === "string" ? g : g?._id);
  const grammarIds = lecture.grammarPatterns || [];
  const grammarIndex = grammarIds.findIndex(
    (g: any) => getGrammarId(g) === grammar._id
  );
  const isLast = grammarIndex === grammarIds.length - 1;

  let prevGrammarId =
    grammarIndex > 0 ? getGrammarId(grammarIds[grammarIndex - 1]) : null;
  let nextGrammarId = !isLast
    ? getGrammarId(grammarIds[grammarIndex + 1])
    : null;

  const handleNavigate = (gid: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace({
      pathname: ROUTES.GRAMMAR_CHAPTER,
      params: { lectureId, patternId: gid },
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backCircle}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <View style={styles.headerTitles}>
              <Text style={[styles.lectureSubtitle, { color: colors.primary }]}>
                {lecture.title}
              </Text>
              <Text style={[styles.grammarTitle, { color: colors.text }]}>
                {grammar.structure}
              </Text>
            </View>
          </View>

          {/* Grammar Info Card */}
          <View
            style={[
              styles.mainCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + "1A",
              },
            ]}
          >
            <View
              style={[styles.badge, { backgroundColor: colors.primary + "15" }]}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "800",
                  fontSize: 11,
                }}
              >
                CORE STRUCTURE
              </Text>
            </View>
            <Text style={[styles.titleText, { color: colors.text }]}>
              「 {grammar.title} 」
            </Text>
            <View style={styles.divider} />

            <RenderFurigana
              text={grammar.explanation}
              relatedKanji={grammar.relatedKanji}
              textColor={colors.text}
              furiganaColor={colors.primary}
            />

            <Text style={[styles.meaningText, { color: colors.text + "90" }]}>
              {grammar.meaning}
            </Text>
          </View>

          {/* Examples Header */}
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {translations[language].example}
            </Text>
          </View>

          {/* Example Dialogue Bubbles */}
          {grammar.examples?.map((eg: any, index: number) => (
            <View key={index} style={styles.exampleWrapper}>
              <View style={styles.chatContainer}>
                {/* User A */}
                <Pressable
                  onLongPress={() => handleExampleInteraction(eg.jp1)}
                  style={({ pressed }) => [
                    styles.bubble,
                    styles.leftBubble,
                    {
                      backgroundColor: colors.surface,
                      opacity: pressed ? 0.7 : 1,
                      borderColor: colors.text + "10",
                    },
                  ]}
                >
                  <View pointerEvents="none">
                    <RenderFurigana
                      text={eg.jp1}
                      relatedKanji={grammar.relatedKanji}
                      textColor={colors.text}
                      furiganaColor={colors.primary}
                    />
                  </View>
                  <Text style={[styles.mmText, { color: colors.text + "60" }]}>
                    {eg.mm1}
                  </Text>
                </Pressable>

                {/* User B */}
                <Pressable
                  onLongPress={() => handleExampleInteraction(eg.jp2)}
                  style={({ pressed }) => [
                    styles.bubble,
                    styles.rightBubble,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View pointerEvents="none">
                    <RenderFurigana
                      text={eg.jp2}
                      relatedKanji={grammar.relatedKanji}
                      textColor={colors.inverted}
                      furiganaColor={colors.inverted}
                    />
                  </View>
                  <Text
                    style={[styles.mmText, { color: colors.inverted + "CC" }]}
                  >
                    {eg.mm2}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Floating Glassmorphism Navigation */}
        <Animated.View
          style={[
            styles.navWrapper,
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          <BlurView
            intensity={80}
            tint={colors.background === "#000000" ? "dark" : "light"}
            style={styles.blurNav}
          >
            {/* Prev Button */}
            <View style={styles.navSideSection}>
              <Pressable
                disabled={!prevGrammarId}
                onPress={() => prevGrammarId && handleNavigate(prevGrammarId)}
                style={({ pressed }) => [
                  styles.sideAction,
                  { opacity: !prevGrammarId ? 0.2 : pressed ? 0.6 : 1 },
                ]}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
                <Text style={[styles.navText, { color: colors.text }]}>
                  {translations[language].previous}
                </Text>
              </Pressable>
            </View>

            {/* Home/Center Button */}
            <View style={styles.navCenterSection}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/grammar/Grammar");
                }}
                style={({ pressed }) => [
                  styles.homeCircle,
                  {
                    backgroundColor: colors.primary,
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  },
                ]}
              >
                <Ionicons name="grid" size={20} color="white" />
              </Pressable>
            </View>

            {/* Next/Exam Button */}
            <View style={styles.navSideSection}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!isLast && nextGrammarId) {
                    handleNavigate(nextGrammarId);
                  } else {
                    router.push({
                      pathname: "/grammar/ChapterExam",
                      params: { lectureId },
                    });
                  }
                }}
                style={({ pressed }) => [
                  styles.sideAction,
                  { opacity: pressed ? 0.6 : 1, justifyContent: "flex-end" },
                ]}
              >
                <Text
                  style={[
                    styles.navText,
                    { color: colors.text, fontWeight: "800" },
                  ]}
                >
                  {isLast
                    ? translations[language].take_test
                    : translations[language].next}
                </Text>
                <Ionicons
                  name={isLast ? "school" : "chevron-forward"}
                  size={22}
                  color={isLast ? colors.primary : colors.text}
                  style={{ marginLeft: 4 }}
                />
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default ChapterDetails;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitles: { flex: 1 },
  lectureSubtitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  grammarTitle: { fontSize: 24, fontWeight: "900" },
  mainCard: { padding: 22, borderRadius: 28, borderWidth: 1, marginBottom: 30 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  titleText: { fontSize: 20, fontWeight: "800", marginBottom: 15 },
  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.06)", marginBottom: 15 },
  meaningText: {
    fontSize: 16,
    marginTop: 15,
    lineHeight: 30,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  exampleWrapper: { marginBottom: 20 },
  chatContainer: { flex: 1, gap: 12 },
  bubble: { maxWidth: "85%", padding: 18, borderRadius: 30, borderWidth: 1 },
  leftBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  rightBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
    borderColor: "transparent",
  },
  mmText: { marginTop: 8, fontSize: 14, fontWeight: "500" },

  // Floating Navigation Styles
  navWrapper: {
    position: "absolute",
    bottom: 34,
    left: 20,
    right: 20,
    height: 70,
    zIndex: 1000,
  },
  blurNav: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 35,
    paddingHorizontal: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  navSideSection: { flex: 1 },
  sideAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: "100%",
  },
  navCenterSection: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  homeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navText: { fontSize: 13, fontWeight: "700", marginHorizontal: 4 },
});
