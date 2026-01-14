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

// Fixed animation wrapper for better performance
const HomeCard = ({ item, index, isUnlocked, onPress }: any) => {
  const { colors } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], width: CARD_WIDTH }}>
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
        style={[styles.cardContainer, { opacity: isUnlocked ? 1 : 0.5 }]}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Background Decorative Character */}
          <Text style={styles.bgChar}>{item.char}</Text>

          <Text style={styles.cardTitle}>{item.title}</Text>

          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={24} color="white" />
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const Home = () => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Time-based greeting logic
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    const t = translations[language];
    if (hours < 12) return t.morning || "Good Morning";
    if (hours < 17) return t.afternoon || "Good Afternoon";
    return t.evening || "Good Evening";
  }, [language]);

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
        if (!token) return router.replace("/auth/Login");
        const res = await userApi.getUserData();
        setUserData(res.data);
      } catch (err) {
        router.replace("/auth/Login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Logic: Unlock cards based on user progress (example: 2 cards always open)
  const isUnlocked = (index: number) => {
    if (index < 2) return true; // First two always open
    return (userData?.level?.passed?.length ?? 0) > 0;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View>
          <Text
            style={[typography.body1, { color: colors.text, opacity: 0.6 }]}
          >
            {greeting},
          </Text>
          <Text
            style={[typography.h4, { fontWeight: "800", color: colors.text }]}
          >
            {language === "jp"
              ? `${userData?.name?.split(" ")[0]} さん`
              : userData?.name}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push(ROUTES.SETTINGS)}
          style={({ pressed }) => [
            styles.settingsBtn,
            { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="settings-sharp" size={22} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.char}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: GAP,
        }}
        renderItem={({ item, index }) => (
          <HomeCard
            item={item}
            index={index}
            isUnlocked={isUnlocked(index)}
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
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
  },
  cardContainer: {
    height: 160,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bgChar: {
    position: "absolute",
    top: -10,
    right: -10,
    fontSize: 100,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.41)",
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },
});

export default Home;
