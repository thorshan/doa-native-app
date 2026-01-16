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
const GAP = 16;
const CARD_WIDTH = (width - 48) / 2;

const ROLES = { ADMIN: "admin", USER: "user" };

const HomeCard = ({ item, isUnlocked, hasPassedData, onPress }: any) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

  const getCardHeight = () => {
    if (item.isCompact) return 60;
    if (item.fullWidth) return 95;
    return 120;
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        width: item.fullWidth ? "100%" : CARD_WIDTH,
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
          end={{ x: 1, y: 0.5 }}
        >
          <Text
            style={[
              styles.bgChar,
              item.isCompact
                ? { fontSize: 50, top: -5, right: 10 }
                : item.fullWidth
                ? { fontSize: 85, top: -10, right: 10 }
                : null,
            ]}
          >
            {item.char}
          </Text>

          <View style={styles.cardContentRow}>
            <View style={styles.iconTitleGroup}>
              {item.icon && (
                <Ionicons
                  name={item.icon as any}
                  size={item.isCompact ? 22 : 28}
                  color="white"
                />
              )}
              <Text
                style={[
                  styles.cardTitle,
                  item.isCompact && { fontSize: 15, fontWeight: "700" },
                ]}
              >
                {item.title}
              </Text>
            </View>
          </View>

          {/* Locked UI Overlay */}
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
        gradient: ["#43e97b", "#38f9d7"],
      },
      {
        title: translations[language].moji_goi,
        char: "語",
        path: ROUTES.MOJI_GOI,
        gradient: ["#4facfe", "#00f2fe"],
      },
      {
        title: translations[language].s_grammar,
        char: "文",
        path: ROUTES.GRAMMAR,
        gradient: ["#fa709a", "#fee140"],
      },
      {
        title: translations[language].s_reading,
        char: "読",
        path: "/Reading",
        gradient: ["#667eea", "#764ba2"],
      },
      {
        title: translations[language].s_listening,
        char: "聴",
        path: "/Listening",
        gradient: ["#f093fb", "#f5576c"],
      },
      {
        title: translations[language].s_speaking,
        char: "話",
        path: "/Speaking",
        gradient: ["#0ba360", "#3cba92"],
      },
      {
        title: translations[language].exams,
        char: "試",
        path: ROUTES.EXAMS,
        gradient: ["#1e3c72", "#2a5298"],
      },
      {
        title: translations[language].countings || "Countings",
        char: "数",
        path: ROUTES.COUNTINGS,
        gradient: ["#FAD961", "#F76B1C"],
      },
    ],
    [language]
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) return router.replace(ROUTES.AUTH);
        const res = await userApi.getUserData();
        setUserData(res.data);
      } catch (err) {
        router.replace(ROUTES.AUTH);
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

  // RESTORED ORIGINAL UNLOCK LOGIC
  const isUnlocked = (index: number) => {
    if (userData?.role === ROLES.ADMIN) return true;
    if (index === 0) return !hasPassedData;
    if (index === 1 || index === 7) return true;
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
          <Text
            style={[typography.body1, { color: colors.text, opacity: 0.6 }]}
          >
            {translations[language].morning || "Good Morning"},
          </Text>
          <View style={styles.nameRow}>
            <Text
              style={[typography.h4, { fontWeight: "800", color: colors.text }]}
            >
              {language === "jp"
                ? `${userData?.name?.split(" ")[0]} さん`
                : userData?.name}
            </Text>
            {userData?.role === ROLES.ADMIN && (
              <View
                style={[styles.adminBadge, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.adminText}>ADMIN</Text>
              </View>
            )}
          </View>
        </View>
        <Pressable
          onPress={() => router.push(ROUTES.SETTINGS)}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-sharp" size={22} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.char}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: GAP,
        }}
        renderItem={({ item, index }) => (
          <HomeCard
            item={item}
            isUnlocked={isUnlocked(index)}
            hasPassedData={hasPassedData}
            onPress={(path: string) => router.push(path)}
          />
        )}
        ListFooterComponent={
          <View style={{ gap: GAP, marginTop: 8 }}>
            <HomeCard
              item={{
                title: translations[language].video_feed || "Video Feed",
                char: "映",
                path: "/VideoFeed",
                gradient: ["#FF512F", "#DD2476"],
                fullWidth: true,
                icon: "play-circle",
              }}
              isUnlocked={true} // Video Always Unlocked
              onPress={(path: string) => router.push(path)}
            />
            <HomeCard
              item={{
                title: "Buy me a Matcha tea",
                char: "茶",
                path: "/AdminInfo",
                gradient: ["#91B43D", "#5C821A"],
                fullWidth: true,
                isCompact: true,
                icon: "cafe",
              }}
              isUnlocked={true} // Matcha Always Unlocked
              onPress={(path: string) => router.push(path)}
            />
          </View>
        }
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
  adminBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminText: { color: "white", fontSize: 10, fontWeight: "900" },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
    overflow: "hidden",
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconTitleGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  bgChar: {
    position: "absolute",
    top: -10,
    right: -10,
    fontSize: 95,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.22)",
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  completedText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
});

export default Home;
