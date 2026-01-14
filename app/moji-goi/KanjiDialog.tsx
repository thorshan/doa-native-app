import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Reanimated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { KanjiData } from "@/api/kanjiApi";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const AnimatedPath = Reanimated.createAnimatedComponent(Path);

interface Props {
  visible: boolean;
  onClose: () => void;
  kanji: KanjiData | null;
}

/* ================= ANIMATED STROKE COMPONENT ================= */
const Stroke = ({ d, index, total, progress, color }: any) => {
  const [length, setLength] = useState(200); // Default path length estimate
  const startThreshold = index / total;
  const endThreshold = (index + 1) / total;

  const animatedProps = useAnimatedProps(() => {
    const localProgress = Math.max(
      0,
      Math.min(
        1,
        (progress.value - startThreshold) / (endThreshold - startThreshold)
      )
    );
    return {
      strokeDashoffset: length * (1 - localProgress),
    };
  });

  return (
    <AnimatedPath
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={length}
      animatedProps={animatedProps}
    />
  );
};

/* ================= MAIN DIALOG COMPONENT ================= */
const KanjiDialog: React.FC<Props> = ({ visible, onClose, kanji }) => {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [paths, setPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible && kanji) {
      // 1. Fade in Backdrop
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 2. Fetch & Parse SVG
      fetchSvgData(kanji.character);
    } else {
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      progress.value = 0;
    }
  }, [visible, kanji]);

  const fetchSvgData = async (char: string) => {
    try {
      setLoading(true);
      const hex = char.charCodeAt(0).toString(16).padStart(5, "0");
      const res = await fetch(
        `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`
      );
      const text = await res.text();
      const matches = text.match(/ d="([^"]+)"/g);
      if (matches) {
        const extracted = matches.map((m) => m.slice(4, -1));
        setPaths(extracted);
        runStrokeAnimation(extracted.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runStrokeAnimation = (count: number) => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: count * 500,
      easing: Easing.bezier(0.35, 0, 0.65, 1),
    });
  };

  const handleCopy = async () => {
    if (!kanji) return;
    await Clipboard.setStringAsync(kanji.character);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!kanji) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity, backgroundColor: "rgba(0,0,0,0.7)" },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View
            style={[styles.handle, { backgroundColor: colors.text + "15" }]}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Action Bar */}
            <View style={styles.headerActions}>
              <Pressable onPress={handleCopy} style={styles.iconBtn}>
                <Ionicons
                  name="copy-outline"
                  size={20}
                  color={colors.primary}
                />
              </Pressable>
              <Text style={[styles.headerLabel, { color: colors.text + "40" }]}>
                {translations[language].kanji_info}
              </Text>
              <Pressable onPress={onClose} style={styles.iconBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Visual Section */}
            <View style={styles.visualRow}>
              <View style={styles.mainCharBox}>
                <Text style={[styles.bigChar, { color: colors.text }]}>
                  {kanji.character}
                </Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.primary + "10" },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {kanji.strokes} {translations[language].strokes}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.vDivider,
                  { backgroundColor: colors.text + "05" },
                ]}
              />

              <View style={styles.strokeBox}>
                <View style={[styles.canvas, { backgroundColor: "#fff" }]}>
                  {loading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Svg viewBox="0 0 109 109" width="100" height="100">
                      {paths.map((d, i) => (
                        <Stroke
                          key={`${i}-${animKey}`}
                          d={d}
                          index={i}
                          total={paths.length}
                          progress={progress}
                          color="#333"
                        />
                      ))}
                    </Svg>
                  )}
                </View>
                <Pressable
                  onPress={() => {
                    setAnimKey((k) => k + 1);
                    runStrokeAnimation(paths.length);
                  }}
                >
                  <Text style={[styles.replayText, { color: colors.primary }]}>
                    {translations[language].replay_strokes}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Information Sections */}
            <View style={styles.infoSection}>
              <Text
                style={[styles.sectionTitle, { color: colors.text + "30" }]}
              >
                {translations[language].meaning}
              </Text>
              <Text style={[styles.meaningMain, { color: colors.text }]}>
                {kanji.meaning?.join(language === "mm" ? "၊ " : ", ")}
              </Text>
            </View>

            <View style={styles.readingGrid}>
              <View style={styles.flex1}>
                <Text
                  style={[styles.sectionTitle, { color: colors.text + "30" }]}
                >
                  ONYOMI
                </Text>
                <Text style={[styles.readingText, { color: colors.primary }]}>
                  {kanji.onyomi?.join("、") || "-"}
                </Text>
              </View>
              <View style={styles.flex1}>
                <Text
                  style={[styles.sectionTitle, { color: colors.text + "30" }]}
                >
                  KUNYOMI
                </Text>
                <Text style={[styles.readingText, { color: colors.primary }]}>
                  {kanji.kunyomi?.join("、") || "-"}
                </Text>
              </View>
            </View>

            {/* Examples */}
            {kanji.examples?.length > 0 && (
              <View style={styles.exampleSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.text + "30", marginBottom: 15 },
                  ]}
                >
                  VOCABULARY
                </Text>
                {kanji.examples.map((ex, i) => (
                  <View
                    key={i}
                    style={[
                      styles.exCard,
                      { backgroundColor: colors.text + "03" },
                    ]}
                  >
                    <View style={styles.flex1}>
                      <Text style={[styles.exWord, { color: colors.text }]}>
                        {ex.word}
                      </Text>
                      <Text
                        style={[styles.exReading, { color: colors.primary }]}
                      >
                        {ex.reading}
                      </Text>
                    </View>
                    <Text
                      style={[styles.exMeaning, { color: colors.text + "60" }]}
                    >
                      {ex.meaning}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 12,
  },
  scrollContent: { paddingHorizontal: 25 },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  visualRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  mainCharBox: { alignItems: "center", flex: 1 },
  bigChar: { fontSize: 90, fontWeight: "800" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 5,
  },
  badgeText: { fontSize: 10, fontWeight: "900" },
  vDivider: { width: 1, height: 80 },
  strokeBox: { flex: 1, alignItems: "center" },
  canvas: {
    width: 110,
    height: 110,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  replayText: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 10,
    textTransform: "uppercase",
  },
  infoSection: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  meaningMain: { fontSize: 22, fontWeight: "700" },
  readingGrid: { flexDirection: "row", gap: 20, marginBottom: 30 },
  readingText: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  exampleSection: { marginTop: 10 },
  exCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  exWord: { fontSize: 19, fontWeight: "800" },
  exReading: { fontSize: 13, fontWeight: "600" },
  exMeaning: { flex: 1.5, textAlign: "right", fontSize: 14, fontWeight: "500" },
  flex1: { flex: 1 },
});

export default KanjiDialog;
