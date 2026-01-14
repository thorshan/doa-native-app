import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutAnimation,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { examApi } from "@/api/examApi";
import { userApi } from "@/api/userApi";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import { getAvatarSource } from "@/utils/getAvatarUrl";

const AVATAR_SIZE = 120;
const LEVEL_ORDER = ["Basic", "N5", "N4", "N3", "N2", "N1", "Business"];

const Profile = () => {
  const { language } = useLanguage();
  const { colors, typography } = useTheme();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [allExams, setAllExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);

  const [showLevelModal, setShowLevelModal] = useState(false);
  const [pendingLevel, setPendingLevel] = useState("");
  const [prereqName, setPrereqName] = useState("");

  const fetchData = async () => {
    try {
      const [userRes, examRes] = await Promise.all([
        userApi.getUserData(),
        examApi.getAllExams(),
      ]);
      setUserData(userRes.data);
      setAllExams(examRes.data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const levelData = useMemo(() => {
    return {
      currentIdx: LEVEL_ORDER.indexOf(userData?.level?.current),
      passed: userData?.level?.passed ?? [],
    };
  }, [userData]);

  const handleLevelChoice = (level: string) => {
    if (level === userData?.level?.current || levelData.passed.includes(level))
      return;

    const targetIdx = LEVEL_ORDER.indexOf(level);
    // Logic: To get N4, you must test on N5.
    const pName = targetIdx > 0 ? LEVEL_ORDER[targetIdx - 1] : LEVEL_ORDER[0];

    setPendingLevel(level);
    setPrereqName(pName);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLevelModal(true);
  };

  const startTest = () => {
    const foundExam = allExams.find(
      (e) =>
        e.type === "Level" &&
        (e.title?.includes(prereqName) || e.level?.code === prereqName)
    );

    const examId = foundExam._id;
    const prereqId = foundExam?.level?.$oid || foundExam?.level;

    if (!prereqId) {
      Alert.alert(
        "Error",
        `Assessment for ${prereqName} not found in database.`
      );
      return;
    }

    setShowLevelModal(false);
    setIsEditingLevel(false);

    router.push({
      pathname: "/exams/LevelTest",
      params: {
        targetLevel: pendingLevel,
        levelId: prereqId,
        examId: examId,
      },
    });
  };

  if (loading && !refreshing)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.navHeader}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text
            style={[typography.h6, { color: colors.text, fontWeight: "700" }]}
          >
            {translations[language].profile}
          </Text>
          <View style={styles.iconBtn}>
            <Pressable onPress={() => router.push("/user/EditProfile")} style={styles.iconBtn}>
              <FontAwesome6 name="edit" size={24} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroSection}>
          <View
            style={[styles.avatarFrame, { borderColor: colors.primary + "20" }]}
          >
            <Image
              source={getAvatarSource(userData?.avatarId || 1)}
              style={styles.avatarImage}
            />
          </View>
          <Text
            style={[typography.h4, styles.userName, { color: colors.text }]}
          >
            {userData?.name}
          </Text>
          <Text
            style={[typography.body1, { color: colors.text, opacity: 0.5 }]}
          >
            @{userData?.username}
          </Text>
        </View>

        <View
          style={[
            styles.bentoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.text + "05",
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text
                style={[
                  typography.subtitle1,
                  { color: colors.text, fontWeight: "800" },
                ]}
              >
                Proficiency Goal
              </Text>
              <Text style={{ fontSize: 12, color: colors.text, opacity: 0.5 }}>
                Current: {userData?.level?.current}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                setIsEditingLevel(!isEditingLevel);
              }}
              style={[
                styles.levelBadge,
                {
                  backgroundColor: isEditingLevel
                    ? colors.text
                    : colors.primary,
                },
              ]}
            >
              <Text style={styles.levelBadgeText}>
                {isEditingLevel ? translations[language].cancel : "Level Up"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scroller}
          >
            {LEVEL_ORDER.map((lvl) => {
              const isCurrent = lvl === userData?.level?.current;
              const isPassed = levelData.passed.includes(lvl);
              return (
                <View key={lvl} style={styles.levelItem}>
                  <Pressable
                    onPress={() => isEditingLevel && handleLevelChoice(lvl)}
                    style={[
                      styles.levelCircle,
                      {
                        backgroundColor: isCurrent
                          ? colors.primary
                          : isPassed
                          ? colors.primary + "20"
                          : colors.text + "05",
                        borderWidth:
                          isEditingLevel && !isCurrent && !isPassed ? 2 : 0,
                        borderColor: colors.primary,
                        borderStyle: "dashed",
                      },
                    ]}
                  >
                    {isPassed && !isCurrent ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    ) : (
                      <Text
                        style={{
                          color: isCurrent ? "white" : colors.text,
                          fontWeight: "700",
                        }}
                      >
                        {lvl === "Business" ? "B" : lvl}
                      </Text>
                    )}
                  </Pressable>
                  <Text style={[styles.levelName, { color: colors.text }]}>
                    {lvl}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="flame" size={20} color="#FF9500" />
            <Text style={[styles.statNum, { color: colors.text }]}>
              {userData?.stats?.streak || 0}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="school" size={20} color={colors.primary} />
            <Text style={[styles.statNum, { color: colors.text }]}>
              {userData?.stats?.lessonsCompleted || 0}
            </Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>

        <Modal visible={showLevelModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalBox, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.modalHero,
                  { backgroundColor: colors.primary + "10" },
                ]}
              >
                <Ionicons
                  name="ribbon-outline"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Unlock {pendingLevel}
              </Text>
              <Text style={[styles.modalDesc, { color: colors.text }]}>
                To reach {pendingLevel}, you must pass the {prereqName}{" "}
                assessment to prove your skills.
              </Text>
              <Pressable
                style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
                onPress={startTest}
              >
                <Text style={styles.btnTextPrimary}>
                  Start {prereqName} Test
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowLevelModal(false)}
                style={styles.btnCancel}
              >
                <Text
                  style={{
                    color: colors.text,
                    opacity: 0.5,
                    fontWeight: "700",
                  }}
                >
                  Maybe Later
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  heroSection: { alignItems: "center", marginBottom: 30 },
  avatarFrame: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    padding: 8,
    marginBottom: 15,
  },
  avatarImage: { width: "100%", height: "100%", resizeMode: "contain" },
  userName: { fontWeight: "800", fontSize: 24 },
  bentoCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 35,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  levelBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14 },
  levelBadgeText: { color: "white", fontWeight: "800", fontSize: 12 },
  scroller: { flexDirection: "row" },
  levelItem: { alignItems: "center", marginRight: 22 },
  levelCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  levelName: { fontSize: 10, fontWeight: "800", opacity: 0.6 },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 15,
  },
  statCard: { flex: 1, padding: 25, borderRadius: 30, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "800", marginTop: 5 },
  statLabel: { fontSize: 12, opacity: 0.5, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 25,
  },
  modalBox: { borderRadius: 40, padding: 30, alignItems: "center" },
  modalHero: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  modalDesc: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 30,
    lineHeight: 22,
  },
  btnPrimary: {
    width: "100%",
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
  },
  btnTextPrimary: { color: "white", fontWeight: "800", fontSize: 16 },
  btnCancel: { marginTop: 20 },
});

export default Profile;
