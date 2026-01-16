import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import particleData from "@/assets/data/particles.json";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { width, height } = Dimensions.get("window");

interface Particle {
  id: string;
  particle: string;
  romaji: string;
  level: string;
  category: string;
  meaning_en: string;
  meaning_mm: string;
  usage: string;
  example_jp: string; // Format: "私[わたし]は学生[がくせい]です"
  example_mm: string;
}

const ParticlesScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Particle | null>(null);

  const levels = ["N5", "N4", "N3", "N2", "N1"];

  // Helper to render Furigana from [brackets]
  const renderFurigana = (text: string, color: string, mainSize: number) => {
    const parts = text.split(/(\[.*?\])/g);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
      if (parts[i + 1] && parts[i + 1].startsWith("[")) {
        const kanji = parts[i];
        const reading = parts[i + 1].replace(/[\[\]]/g, "");
        elements.push(
          <View key={i} style={styles.furiganaWrapper}>
            <Text style={[styles.furiganaText, { color: color + "90" }]}>
              {reading}
            </Text>
            <Text
              style={[
                styles.kanjiMainText,
                { color: color, fontSize: mainSize },
              ]}
            >
              {kanji}
            </Text>
          </View>
        );
        i++; // skip the reading part
      } else if (!parts[i].startsWith("[")) {
        elements.push(
          <Text
            key={i}
            style={[
              styles.kanjiMainText,
              { color: color, fontSize: mainSize, marginTop: 12 },
            ]}
          >
            {parts[i]}
          </Text>
        );
      }
    }
    return <View style={styles.furiganaRow}>{elements}</View>;
  };

  const filteredParticles = useMemo(() => {
    return (particleData as Particle[]).filter((item) => {
      const matchesSearch =
        item.particle.includes(search) ||
        item.romaji.includes(search.toLowerCase());
      const matchesLevel = selectedLevel ? item.level === selectedLevel : true;
      return matchesSearch && matchesLevel;
    });
  }, [search, selectedLevel]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === "mm" ? "ဝိဘတ်များ" : "Particles"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search & Filter Section */}
      <View style={styles.topSection}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary + "20",
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.text + "40"} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search..."
            placeholderTextColor={colors.text + "40"}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
        >
          {levels.map((lvl) => (
            <Pressable
              key={lvl}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedLevel(selectedLevel === lvl ? null : lvl);
              }}
              style={[
                styles.levelChip,
                {
                  backgroundColor:
                    selectedLevel === lvl ? colors.primary : colors.surface,
                  borderColor: colors.primary + "30",
                },
              ]}
            >
              <Text
                style={[
                  styles.levelChipText,
                  { color: selectedLevel === lvl ? "#FFF" : colors.text },
                ]}
              >
                {lvl}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Particle List */}
      <FlatList
        data={filteredParticles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.listRow}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedItem(item);
            }}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary + "15",
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardParticle, { color: colors.primary }]}>
                {item.particle}
              </Text>
              <View
                style={[
                  styles.miniBadge,
                  { backgroundColor: getLevelColor(item.level) },
                ]}
              >
                <Text style={styles.miniBadgeText}>{item.level}</Text>
              </View>
            </View>
            <Text style={[styles.cardRomaji, { color: colors.text + "60" }]}>
              {item.romaji}
            </Text>
          </Pressable>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedItem} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHandle} />
            {selectedItem && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text
                    style={[
                      styles.modalParticleText,
                      { color: colors.primary },
                    ]}
                  >
                    {selectedItem.particle}
                  </Text>
                  <Text
                    style={[
                      styles.modalLevelText,
                      { color: getLevelColor(selectedItem.level) },
                    ]}
                  >
                    {selectedItem.level}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>MEANING</Text>
                  <Text style={[styles.meaningLarge, { color: colors.text }]}>
                    {language === "mm"
                      ? selectedItem.meaning_mm
                      : selectedItem.meaning_en}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>EXAMPLE SENTENCE</Text>
                  <View style={styles.exampleBox}>
                    {renderFurigana(selectedItem.example_jp, colors.text, 22)}
                    <Text
                      style={[
                        styles.exampleTranslation,
                        { color: colors.primary },
                      ]}
                    >
                      {selectedItem.example_mm}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setSelectedItem(null)}
                  style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getLevelColor = (l: string) => {
  const map: any = {
    N5: "#4CAF50",
    N4: "#2196F3",
    N3: "#FF9800",
    N2: "#E91E63",
    N1: "#9C27B0",
  };
  return map[l] || "#666";
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "900", marginLeft: 15 },
  topSection: { paddingHorizontal: 20, marginBottom: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    marginBottom: 12,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  filterBar: { flexDirection: "row" },
  levelChip: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 30,
    marginRight: 8,
    borderWidth: 1,
  },
  levelChipText: { fontWeight: "800", fontSize: 13 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  listRow: { justifyContent: "space-between" },
  card: {
    width: (width - 48) / 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardParticle: { fontSize: 18, fontWeight: "bold" },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  miniBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  cardRomaji: { fontSize: 14, marginTop: 4, fontWeight: "600" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: height * 0.6,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#DDD",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 20,
  },
  modalParticleText: { fontSize: 32, fontWeight: "600" },
  modalLevelText: { fontSize: 20, fontWeight: "800" },
  section: { marginBottom: 25 },
  label: {
    fontSize: 11,
    fontWeight: "900",
    color: "#AAA",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  meaningLarge: { fontSize: 22, fontWeight: "800" },
  exampleBox: { marginTop: 10 },
  furiganaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  furiganaWrapper: { alignItems: "center", marginRight: 2 },
  furiganaText: { fontSize: 10, fontWeight: "bold" },
  kanjiMainText: { fontWeight: "500" },
  exampleTranslation: { fontSize: 16, marginTop: 12, fontWeight: "600" },
  closeBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  closeBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});

export default ParticlesScreen;
