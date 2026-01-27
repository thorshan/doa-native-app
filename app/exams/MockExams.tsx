import { examApi } from "@/api/examApi";
import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function MockExamsPage() {
  const { colors } = useTheme();
  const router = useRouter();

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      const res = await examApi.getAllExams();

      const rawData = res.data?.data;

      if (Array.isArray(rawData)) {
        const filteredExams = rawData.filter(
          (exam) => exam.examType === "Mock JLPT",
        );
        setExams(filteredExams);
      } else {
        setExams([]);
      }
    } catch (err: any) {
      console.error("Fetch Exams Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // FIXED: Changed parameter to { item } to match FlatList renderItem signature
  const renderExamCard = ({ item }: { item: any }) => (
    <Pressable
      style={[
        styles.examCard,
        { backgroundColor: colors.surface, borderColor: colors.text + "10" },
      ]}
      onPress={() => router.push(ROUTES.EXAM_SCREEN(item._id))}
    >
      <View
        style={[styles.iconCircle, { backgroundColor: colors.primary + "15" }]}
      >
        <Ionicons name="document-text" size={24} color={colors.primary} />
      </View>

      <View style={styles.examInfo}>
        <Text
          style={[styles.examTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: colors.text + "60" }]}>
            <Ionicons name="time-outline" size={14} />{" "}
            {item.durationMinutes || 0} min
          </Text>
          <Text style={[styles.statText, { color: colors.text + "60" }]}>
            <Ionicons name="help-circle-outline" size={14} />{" "}
            {item?.questions?.length || 0} Qs
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.text + "30"} />
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mock Exams
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bento Card: Exam Count Header */}
        <LinearGradient
          colors={[colors.primary, "#6366f1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bentoHeader}
        >
          <View style={styles.bentoLeft}>
            <Text style={styles.bentoLabel}>Available Exams</Text>
            {/* Dynamic count based on fetched exams */}
            <Text style={styles.bentoCount}>
              {loading ? "..." : exams.length}
            </Text>
          </View>

          <View style={styles.bentoIconArea}>
            <Ionicons name="ribbon" size={80} color="rgba(255,255,255,0.2)" />
          </View>

          <View style={styles.bentoFooter}>
            <Text style={styles.bentoFooterText}>
              Boost your JLPT score today
            </Text>
          </View>
        </LinearGradient>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ready to Start
          </Text>
          <Pressable>
            <Text style={{ color: colors.primary, fontWeight: "700" }}>
              View All
            </Text>
          </Pressable>
        </View>

        {/* Exam List */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={exams}
            keyExtractor={(item) => item._id}
            renderItem={renderExamCard}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: colors.text + "40",
                  marginTop: 40,
                }}
              >
                No exams found.
              </Text>
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  scrollContent: { padding: 20 },

  // Bento Header Style
  bentoHeader: {
    width: "100%",
    height: 180,
    borderRadius: 32,
    padding: 24,
    position: "relative",
    overflow: "hidden",
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  bentoLeft: { zIndex: 2 },
  bentoLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  bentoCount: { color: "white", fontSize: 56, fontWeight: "900", marginTop: 2 },
  bentoIconArea: {
    position: "absolute",
    right: -10,
    top: 20,
    zIndex: 1,
  },
  bentoFooter: {
    position: "absolute",
    bottom: 24,
    left: 24,
  },
  bentoFooterText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
  },

  // Exam Card Style
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 22, fontWeight: "800" },
  listContainer: { gap: 14 },
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  examInfo: { flex: 1 },
  examTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  statsRow: { flexDirection: "row", gap: 16 },
  statText: {
    fontSize: 13,
    fontWeight: "600",
    flexDirection: "row",
    alignItems: "center",
  },
});
