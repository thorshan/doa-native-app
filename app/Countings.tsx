import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COUNTINGS } from "@/constants/countings";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Countings = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = useMemo(() => ["All", ...Object.keys(COUNTINGS)], []);

  const speak = (text: string) => {
    Speech.speak(text, { language: "ja-JP", rate: 0.85 });
  };

  const toggleExpand = (id: string, reading: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedId !== id) speak(reading);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredData = useMemo(() => {
    let flatList: any[] = [];
    if (activeTab === "All") {
      Object.values(COUNTINGS).forEach((cat: any) => {
        flatList = [...flatList, ...cat];
      });
    } else {
      flatList = (COUNTINGS as any)[activeTab] || [];
    }
    return searchQuery.trim() === ""
      ? flatList
      : flatList.filter(
          (item) =>
            item.use.includes(searchQuery) ||
            item.kanji.includes(searchQuery) ||
            item.reading.includes(searchQuery)
        );
  }, [searchQuery, activeTab]);

  const renderDetailRows = (item: any) => {
    const rows = [];
    for (let i = 1; i <= 10; i++) {
      const isIrregular = item.irregulars.includes(i.toString());
      const wordToDisplay = `${i}${item.kanji}`;

      // Check if we have a specific reading list, otherwise fallback to number + reading
      const wordToSpeak = item.readings_1_to_10
        ? item.readings_1_to_10[i - 1]
        : `${i}${item.reading}`;

      rows.push(
        <Pressable
          key={i}
          onPress={() => speak(wordToSpeak)}
          style={[styles.detailRow, { borderBottomColor: colors.text + "05" }]}
        >
          <Text style={[styles.detailNum, { color: colors.text + "40" }]}>
            {i}
          </Text>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.detailText,
                {
                  color: isIrregular ? "#FF9500" : colors.text,
                  fontWeight: isIrregular ? "800" : "500",
                },
              ]}
            >
              {wordToDisplay}
            </Text>
            {/* Optional: Show the Romaji or Hiragana below for irregulars */}
            {isIrregular && (
              <Text style={{ fontSize: 10, color: "#FF9500" }}>
                {wordToSpeak}
              </Text>
            )}
          </View>
          <Ionicons
            name="volume-medium"
            size={14}
            color={isIrregular ? "#FF9500" : colors.text + "20"}
          />
        </Pressable>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {translations[language].countings}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* SEARCH */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.text + "30"} />
        <TextInput
          placeholder={translations[language].search}
          placeholderTextColor={colors.text + "30"}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* TABS */}
      <View style={{ height: 50, marginBottom: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveTab(cat)}
              style={[
                styles.tabChip,
                {
                  backgroundColor:
                    activeTab === cat ? colors.primary : colors.surface,
                  borderColor:
                    activeTab === cat ? colors.primary : colors.text + "10",
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === cat ? "white" : colors.text + "60" },
                ]}
              >
                {cat === "All"
                  ? translations[language].all
                  : translations[language][cat] || cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: isExpanded ? colors.primary : colors.text + "10",
                },
              ]}
            >
              <Pressable
                onPress={() => toggleExpand(item.id, item.reading)}
                style={{ padding: 16 }}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.kanjiBadge,
                      { backgroundColor: colors.primary + "15" },
                    ]}
                  >
                    <Text style={[styles.kanjiText, { color: colors.primary }]}>
                      {item.kanji}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.readingText, { color: colors.text }]}>
                      {item.reading}
                    </Text>
                    <Text
                      style={[styles.useText, { color: colors.text + "60" }]}
                      numberOfLines={isExpanded ? undefined : 1}
                    >
                      {item.use}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "volume-high" : "chevron-down"}
                    size={20}
                    color={isExpanded ? colors.primary : colors.text + "20"}
                  />
                </View>
              </Pressable>
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={[styles.tableTitle, { color: colors.text }]}>
                    {language === "en"
                      ? "1 to 10 (Tap to Listen)"
                      : language === "mm"
                      ? "၁ မှ ၁၀ အထိ (နှိပ်၍ နားထောင်ပါ)"
                      : "一から十まで (押して聴く)"}
                  </Text>
                  <View style={styles.tableGrid}>{renderDetailRows(item)}</View>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginTop: 0,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  tabChip: {
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
  },
  tabText: { fontSize: 13, fontWeight: "700" },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  kanjiBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  kanjiText: { fontSize: 22, fontWeight: "900" },
  readingText: { fontSize: 17, fontWeight: "800" },
  useText: { fontSize: 13, marginTop: 2 },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    backgroundColor: "rgba(0,0,0,0.01)",
  },
  tableTitle: {
    fontSize: 11,
    fontWeight: "800",
    opacity: 0.4,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  tableGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailRow: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  detailNum: { fontSize: 12, fontWeight: "700", width: 20 },
  detailText: { fontSize: 15, flex: 1 },
});

export default Countings;
