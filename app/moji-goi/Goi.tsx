import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { kanjiApi, KanjiData } from "@/api/kanjiApi";
import { levelApi, LevelData } from "@/api/levelApi";
import { vocabApi, VocabItem } from "@/api/vocabApi";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLUMN_COUNT = 4;
const GRID_SPACING = 12;
const ITEM_SIZE = (width - GRID_SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

const Goi = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [vocabs, setVocabs] = useState<VocabItem[]>([]);
  const [allKanjis, setAllKanjis] = useState<KanjiData[]>([]);
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeVocab, setActiveVocab] = useState<VocabItem | null>(null);
  const [quickKanji, setQuickKanji] = useState<KanjiData | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelRes, vocabRes, kanjiRes] = await Promise.all([
          levelApi.getAllLevel(),
          vocabApi.getAllVocab(),
          kanjiApi.getAllKanji(),
        ]);
        setLevels(levelRes.data);
        setVocabs(vocabRes.data);
        setAllKanjis(kanjiRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredVocabs = useMemo(() => {
    return vocabs.filter((v) => {
      const matchesSearch =
        v.word.includes(searchQuery) ||
        v.reading.includes(searchQuery) ||
        v.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel
        ? v.level?._id === selectedLevel
        : true;
      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, selectedLevel, vocabs]);

  const handleVocabPress = (vocab: VocabItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveVocab(vocab);
    Speech.speak(vocab.reading, { language: "ja-JP", rate: 0.8 });
  };

  const handleKanjiQuickView = (char: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const found = allKanjis.find((k) => k.character === char);
    if (found) setQuickKanji(found);
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header & Grid (Same as before) */}
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {translations[language].moji_goi}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.text + "10",
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.text + "40"} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={translations[language].search_placeholder_text}
            placeholderTextColor={colors.text + "40"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          <Pressable
            onPress={() => setSelectedLevel(null)}
            style={[
              styles.filterChip,
              {
                backgroundColor: !selectedLevel
                  ? colors.primary
                  : colors.surface,
                borderColor: colors.text + "1A",
              },
            ]}
          >
            <Text
              style={{
                color: !selectedLevel ? "#FFF" : colors.text,
                fontWeight: "700",
              }}
            >
              {translations[language].all}
            </Text>
          </Pressable>
          {levels.map((l) => (
            <Pressable
              key={l._id}
              onPress={() => setSelectedLevel(l._id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedLevel === l._id ? colors.primary : colors.surface,
                  borderColor: colors.text + "1A",
                },
              ]}
            >
              <Text
                style={{
                  color: selectedLevel === l._id ? "#FFF" : colors.text,
                  fontWeight: "700",
                }}
              >
                {l.code}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {filteredVocabs.map((vocab, index) => (
            <Pressable
              key={vocab._id?.$oid || index}
              onPress={() => handleVocabPress(vocab)}
              style={({ pressed }) => [
                styles.vocabCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.text + "1A",
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                },
              ]}
            >
              {vocab.word !== vocab.reading && (
                <Text style={[styles.vocabReading, { color: colors.primary }]}>
                  {vocab.reading}
                </Text>
              )}
              <Text style={[styles.vocabWord, { color: colors.text }]}>
                {vocab.word}
              </Text>
              <Text
                style={[styles.vocabMeaning, { color: colors.text + "40" }]}
                numberOfLines={1}
              >
                {vocab.meaning.split(",")[0]}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* 1. VOCAB DETAIL DRAWER (Bottom Sheet Style) */}
      <Modal
        visible={Boolean(activeVocab)}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveVocab(null)}
      >
        <View style={styles.drawerOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActiveVocab(null)}
          />
          <View
            style={[
              styles.drawerContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[
                styles.drawerHandle,
                { backgroundColor: colors.text + "10" },
              ]}
            />

            {activeVocab && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                <View style={styles.drawerHeader}>
                  <View>
                    {activeVocab.word !== activeVocab.reading && (
                      <Text
                        style={[
                          styles.modalFurigana,
                          { color: colors.primary },
                        ]}
                      >
                        {activeVocab.reading}
                      </Text>
                    )}
                    <Text
                      style={[styles.modalLargeWord, { color: colors.text }]}
                    >
                      {activeVocab.word}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => Clipboard.setStringAsync(activeVocab.word)}
                    style={styles.iconCircle}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.infoSection,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text
                    style={[styles.sectionLabel, { color: colors.text + "40" }]}
                  >
                    MEANING
                  </Text>
                  <Text
                    style={[styles.modalMeaningText, { color: colors.text }]}
                  >
                    {activeVocab.meaning}
                  </Text>
                </View>

                {/* Related Kanji Bubbles */}
                {(activeVocab.word.match(/[\u4e00-\u9faf]/g) || []).length >
                  0 && (
                  <View style={styles.infoSectionFull}>
                    <Text
                      style={[
                        styles.sectionLabel,
                        { color: colors.text + "40", marginBottom: 12 },
                      ]}
                    >
                      RELATED KANJI
                    </Text>
                    <View style={styles.kanjiRow}>
                      {(activeVocab.word.match(/[\u4e00-\u9faf]/g) || []).map(
                        (char, i) => (
                          <Pressable
                            key={i}
                            onPress={() => handleKanjiQuickView(char)}
                            style={[
                              styles.kanjiBubble,
                              { backgroundColor: colors.primary + "10" },
                            ]}
                          >
                            <Text
                              style={{
                                color: colors.primary,
                                fontSize: 20,
                                fontWeight: "bold",
                              }}
                            >
                              {char}
                            </Text>
                          </Pressable>
                        )
                      )}
                    </View>
                  </View>
                )}

                <Pressable
                  onPress={() =>
                    Speech.speak(activeVocab.reading, { language: "ja-JP" })
                  }
                  style={[
                    styles.modalAudioBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="volume-high" size={24} color="#FFF" />
                  <Text style={styles.modalAudioBtnText}>
                    Listen Pronunciation
                  </Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>

        {/* 2. KANJI QUICK VIEW DIALOG (Centered Popup) */}
        <Modal
          visible={Boolean(quickKanji)}
          transparent
          animationType="fade"
          onRequestClose={() => setQuickKanji(null)}
        >
          <View style={styles.dialogOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setQuickKanji(null)}
            />
            <View
              style={[styles.dialogCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.dialogChar, { color: colors.text }]}>
                {quickKanji?.character}
              </Text>

              <View style={styles.dialogReadingBox}>
                <Text style={styles.dialogReadingLabel}>ONYOMI</Text>
                <Text
                  style={[styles.dialogReadingVal, { color: colors.primary }]}
                >
                  {quickKanji?.onyomi.join(" ・ ") || "-"}
                </Text>

                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.text + "05",
                    marginVertical: 10,
                  }}
                />

                <Text style={styles.dialogReadingLabel}>KUNYOMI</Text>
                <Text style={[styles.dialogReadingVal, { color: colors.text }]}>
                  {quickKanji?.kunyomi.join(" ・ ") || "-"}
                </Text>
              </View>

              <Text
                style={[styles.dialogMeaning, { color: colors.text + "50" }]}
              >
                {quickKanji?.meaning.join(", ")}
              </Text>

              <Pressable
                onPress={() => setQuickKanji(null)}
                style={[
                  styles.dialogCloseBtn,
                  { backgroundColor: colors.text + "08" },
                ]}
              >
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  Got it
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topSection: { paddingBottom: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: "600" },
  filterBar: { paddingHorizontal: 20, paddingVertical: 15, gap: 10 },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
  },
  scrollContent: { paddingBottom: 40 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: GRID_SPACING / 2,
  },
  vocabCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE + 20,
    margin: GRID_SPACING / 2,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  vocabReading: { fontSize: 9, fontWeight: "800", marginBottom: 2 },
  vocabWord: { fontSize: 20, fontWeight: "600", textAlign: "center" },
  vocabMeaning: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 4,
    textAlign: "center",
  },

  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  drawerContent: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.65,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  modalFurigana: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  modalLargeWord: { fontSize: 48, fontWeight: "900" },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    width: "100%",
    padding: 20,
    borderRadius: 25,
    marginBottom: 25,
  },
  infoSectionFull: { width: "100%", marginBottom: 25 },
  sectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  modalMeaningText: { fontSize: 20, fontWeight: "600", marginTop: 8 },
  kanjiRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  kanjiBubble: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modalAudioBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 24,
    width: "100%",
    justifyContent: "center",
    gap: 10,
  },
  modalAudioBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },

  // Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogCard: {
    width: width - 80,
    borderRadius: 35,
    padding: 30,
    alignItems: "center",
  },
  dialogChar: { fontSize: 72, fontWeight: "900", marginBottom: 15 },
  dialogReadingBox: {
    width: "100%",
    backgroundColor: "#00000005",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  dialogReadingLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#bbb",
    marginBottom: 2,
  },
  dialogReadingVal: { fontSize: 17, fontWeight: "700" },
  dialogMeaning: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  dialogCloseBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
});

export default Goi;
