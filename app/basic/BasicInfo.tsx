import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GET_STARTED } from "@/constants/basic";
import { ROUTES } from "@/constants/routes";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { width } = Dimensions.get("window");

const BasicInfo = () => {
  const { colors, spacing, typography } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();

  // Animation Refs
  const floatAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const handleScroll = (e: any) => {
    const currentY = e.nativeEvent.contentOffset.y;
    // Hide button when scrolling down, show when scrolling up
    if (currentY > lastScrollY.current && currentY > 50) {
      Animated.spring(floatAnim, {
        toValue: 100,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.spring(floatAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
    lastScrollY.current = currentY;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Premium Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.push("/")} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {translations[language].basic_japanese}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <Text
          style={[
            typography.h4,
            { color: colors.text, fontWeight: "800", marginBottom: 8 },
          ]}
        >
          {translations[language].table_content}
        </Text>
        <Text
          style={[
            typography.body1,
            { color: colors.text, opacity: 0.5, marginBottom: 24 },
          ]}
        >
          Master the fundamentals of Japanese characters and phonetics.
        </Text>

        {GET_STARTED.map((section) => (
          <View key={section.tag} style={styles.timelineContainer}>
            {section.description.map((desc, index) => {
              const isLast = index === section.description.length - 1;
              return (
                <Pressable
                  key={desc._id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push({
                      pathname: ROUTES.BASIC_DETAILS,
                      params: { lectureId: desc._id.toString() },
                    });
                  }}
                  style={({ pressed }) => [
                    styles.lectureCard,
                    {
                      backgroundColor: colors.surface,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  {/* Timeline Visual */}
                  <View style={styles.timelineLeft}>
                    <View
                      style={[styles.dot, { backgroundColor: colors.primary }]}
                    />
                    {!isLast && (
                      <View
                        style={[
                          styles.line,
                          { backgroundColor: colors.primary + "30" },
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={[styles.indexText, { color: colors.primary }]}>
                      STEP {index + 1}
                    </Text>
                    <Text
                      style={[
                        typography.body1,
                        { color: colors.text, fontWeight: "600" },
                      ]}
                    >
                      {desc.title}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.text + "30"}
                  />
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Modern Floating Action Button */}
      <Animated.View
        style={[styles.fabWrapper, { transform: [{ translateY: floatAnim }] }]}
      >
        <Pressable
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const firstId = GET_STARTED[0].description[0]._id;
            router.push({
              pathname: ROUTES.BASIC_DETAILS,
              params: { lectureId: firstId.toString() },
            });
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Ionicons name="rocket-sharp" size={20} color="white" />
          <Text style={styles.fabText}>Start Learning</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  timelineContainer: {
    marginTop: 10,
  },
  lectureCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  timelineLeft: {
    alignItems: "center",
    width: 30,
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
  },
  line: {
    position: "absolute",
    top: 12,
    bottom: -30,
    width: 2,
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
  },
  indexText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  fabWrapper: {
    position: "absolute",
    bottom: 40,
    width: width,
    alignItems: "center",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  fabText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 12,
  },
});
