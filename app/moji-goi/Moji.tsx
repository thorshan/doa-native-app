import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import KanjiDialog from "./KanjiDialog";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 4;
const GRID_SPACING = 12;
const ITEM_SIZE = (width - GRID_SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

const Moji = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [kanjis, setKanjis] = useState<KanjiData[]>([]);
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKanji, setActiveKanji] = useState<KanjiData | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelRes, kanjiRes] = await Promise.all([
          levelApi.getAllLevel(),
          kanjiApi.getAllKanji(),
        ]);
        setLevels(levelRes.data);
        setKanjis(kanjiRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalKanjis = kanjis ? kanjis.length : 0;

  // Filter Logic
  const filteredKanjis = useMemo(() => {
    return kanjis.filter((kanji) => {
      const matchesSearch =
        kanji.character.includes(searchQuery) ||
        kanji.meaning.some((m) =>
          m.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        kanji.onyomi.some((o) => o.includes(searchQuery)) ||
        kanji.kunyomi.some((k) => k.includes(searchQuery));

      const matchesLevel = selectedLevel
        ? kanji.level?._id === selectedLevel
        : true;

      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, selectedLevel, kanjis]);

  const handleKanjiPress = (kanji: KanjiData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveKanji(kanji);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Search Header */}
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push("/")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {translations[language].kanji_hub}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={[
            styles.kanjiCountContainer,
            { borderColor: colors.primary + "30" }, // Soft border
          ]}
        >
          <View
            style={[styles.countLabel, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.countLabelText, { color: colors.inverted }]}>
              {translations[language].total || "Kanjis"}
            </Text>
          </View>
          <View style={styles.countValue}>
            <Text style={[styles.countValueText, { color: colors.text }]}>
              {filteredKanjis.length}
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text + "60",
                  fontWeight: "400",
                }}
              >
                {" "}
                / {totalKanjis}
              </Text>
            </Text>
          </View>
        </View>

        {/* Search Bar */}
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
            autoCorrect={false}
          />
          {searchQuery !== "" && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text + "40"}
              />
            </Pressable>
          )}
        </View>

        {/* Level Filter Chips */}
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
              style={[
                styles.filterChipText,
                { color: !selectedLevel ? colors.inverted : colors.text },
              ]}
            >
              {translations[language].all}
            </Text>
          </Pressable>
          {levels.map((level) => (
            <Pressable
              key={level._id}
              onPress={() => setSelectedLevel(level._id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedLevel === level._id
                      ? colors.primary
                      : colors.surface,
                  borderColor: colors.text + "1A",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedLevel === level._id ? "#FFF" : colors.text },
                ]}
              >
                {level.code}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredKanjis.length > 0 ? (
          <View style={styles.grid}>
            {filteredKanjis.map((kanji) => (
              <Pressable
                key={kanji._id}
                onPress={() => handleKanjiPress(kanji)}
                style={({ pressed }) => [
                  styles.kanjiCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.text + "1A",
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  },
                ]}
              >
                <Text style={[styles.kanjiChar, { color: colors.text }]}>
                  {kanji.character}
                </Text>
                <Text
                  style={[styles.kanjiMeaning, { color: colors.text + "40" }]}
                  numberOfLines={1}
                >
                  {kanji.meaning[0]}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={64}
              color={colors.text + "10"}
            />
            <Text
              style={{
                color: colors.text + "40",
                marginTop: 10,
                fontWeight: "600",
              }}
            >
              {translations[language].no_data}
            </Text>
          </View>
        )}
      </ScrollView>

      <KanjiDialog
        visible={Boolean(activeKanji)}
        kanji={activeKanji}
        onClose={() => setActiveKanji(null)}
      />
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
  kanjiCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
  },
  countLabel: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  countLabelText: {
    fontSize: 14,
    fontWeight: "800",
  },
  countValue: {
    flex: 1, 
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  countValueText: {
    fontSize: 18,
    fontWeight: "900",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: "600" },
  filterBar: { paddingHorizontal: 20, paddingVertical: 15, gap: 10 },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 14, fontWeight: "700" },
  scrollContent: { paddingBottom: 40 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: GRID_SPACING / 2,
  },
  kanjiCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE + 20,
    margin: GRID_SPACING / 2,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 2,
  },
  kanjiChar: { fontSize: 26, fontWeight: "600" },
  kanjiMeaning: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  emptyState: { alignItems: "center", marginTop: 100 },
});

export default Moji;
