import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { userApi } from "@/api/userApi";
import { ROUTES } from "@/constants/routes";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { width } = Dimensions.get("window");
const PADDING = 16;
// Full width of screen minus the padding on both sides
const FULL_CARD_WIDTH = width - PADDING * 2;

const ROLES = { ADMIN: "admin", USER: "user" };

const HomeCard = ({ item, isUnlocked, hasPassedData, onPress }: any) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

  const getCardHeight = () => {
    if (item.isCompact) return 70;
    return 100; // Consistent height for full width
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        width: "100%",
        marginBottom: 16, 
      }}
    >
      <Pressable
        onPress={() => {
          if (isUnlocked) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress(item.path);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.cardContainer,
          { height: getCardHeight(), opacity: isUnlocked ? 1 : 0.6 },
        ]}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.bgChar}>{item.char}</Text>

          <View style={styles.cardContentRow}>
            <View style={styles.iconTitleGroup}>
              {item.icon ? (
                <Ionicons name={item.icon as any} size={28} color="white" />
              ) : (
                 // Fallback icon if none provided to keep UI consistent
                <Ionicons name="book" size={26} color="white" />
              )}
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </View>

          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons
                name={
                  hasPassedData && item.char === "あ"
                    ? "checkmark-circle"
                    : "lock-closed"
                }
                size={24}
                color="white"
              />
              {hasPassedData && item.char === "あ" && (
                <Text style={styles.completedText}>COMPLETED</Text>
              )}
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const Home = () => {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const cards = useMemo(
    () => [
      {
        title: translations[language].basic_japanese,
        char: "あ",
        path: ROUTES.BASIC_INFO,
        gradient: ["#38f9d7", "#43e97b"],
        icon: "book-outline",
      },
      {
        title: translations[language].course || "Courses",
        char: "語",
        path: ROUTES.COURSE_LIST,
        gradient: ["#00f2fe","#4facfe" ],
        icon: "library-outline",
      },
      {
        title: translations[language].countings || "Countings",
        char: "数",
        path: ROUTES.COUNTINGS,
        gradient: ["#FAD961", "#F76B1C"],
        icon: "calculator-outline",
      },
      {
        title: translations[language].doa_hub || "DOA Hub",
        char: "ドア",
        path: ROUTES.DOA_HUB,
        gradient: ["#4962ff", "#1c39f7"],
        icon: "layers-outline",
      },
      {
        title: translations[language].video_feed || "Video Feed",
        char: "映",
        path: "/VideoFeed",
        gradient: ["#FF512F", "#DD2476"],
        icon: "play-circle-outline",
      },
      {
        title: translations[language].exams,
        char: "試",
        path: ROUTES.EXAMS,
        gradient: ["#1e3c72", "#2a5298"],
        icon: "document-text-outline",
      },
      {
        title: "Buy me a Matcha tea",
        char: "茶",
        path: "/AdminInfo",
        gradient: ["#91B43D", "#5C821A"],
        icon: "cafe-outline",
      },
    ],
    [language]
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) return router.replace(ROUTES.LOGIN);
        const res = await userApi.getUserData();
        setUserData(res.data);
      } catch (err) {
        router.replace(ROUTES.LOGIN);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const hasPassedData = useMemo(
    () => (userData?.level?.passed?.length ?? 0) > 0,
    [userData]
  );

  const isUnlocked = (index: number) => {
    if (userData?.role === ROLES.ADMIN) return true;
    if (index === 0) return !hasPassedData;
    // Course and Video usually unlocked
    if (index === 1 || index === 3) return true; 
    return hasPassedData;
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
      <View style={styles.header}>
        <View>
          <Text style={[typography.body1, { color: colors.text, opacity: 0.6 }]}>
            {translations[language].morning || "Good Morning"},
          </Text>
          <View style={styles.nameRow}>
            <Text style={[typography.h4, { fontWeight: "800", color: colors.text }]}>
              {language === "jp"
                ? `${userData?.name?.split(" ")[0]} さん`
                : userData?.name}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push(ROUTES.SETTINGS)}
          style={[styles.settingsBtn, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="settings-sharp" size={22} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.char}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: PADDING, paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <HomeCard
            item={item}
            isUnlocked={isUnlocked(index)}
            hasPassedData={hasPassedData}
            onPress={(path: string) => router.push(path)}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  nameRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 30,
    paddingHorizontal: 24,
    justifyContent: "center",
    overflow: "hidden",
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconTitleGroup: { flexDirection: "row", alignItems: "center", gap: 15 },
  bgChar: {
    position: "absolute",
    top: -15,
    right: 5,
    fontSize: 110,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.15)",
  },
  cardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },
  completedText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
});

export default Home;