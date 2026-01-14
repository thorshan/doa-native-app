import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { userApi } from "@/api/userApi";
import { ROUTES } from "@/constants/routes";
import { translations } from "@/constants/translations";
import { useAuth } from "@/contexts/AuthContext";
import { Language, useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import { getAvatarSource } from "@/utils/getAvatarUrl";

const Settings = () => {
  const { colors, mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const router = useRouter();

  // Dynamic Version from app.json
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sheetContent, setSheetContent] = useState<
    "theme" | "lang" | "logout" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const snapPoints = useMemo(() => ["40%", "55%"], []);

  const fetchUserData = async () => {
    try {
      const res = await userApi.getUserData();
      setUserData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const openSheet = (type: "theme" | "lang" | "logout") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSheetContent(type);
    bottomSheetRef.current?.expand();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    []
  );

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header with Centered Title */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/")} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {translations[language].account_settings}
        </Text>
        <View style={{ width: 40 }} />
        {/* Placeholder to balance the flex center */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUserData}
            tintColor={colors.primary}
          />
        }
      >
        <View>
          {/* Profile Card */}
          <Pressable
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + "1A",
              },
            ]}
            onPress={() => router.push(ROUTES.PROFILE)}
          >
            <Image
              source={getAvatarSource(userData?.avatarId || userData?.image)}
              style={styles.avatar}
            />
            <View style={styles.profileText}>
              <Text
                style={[styles.profileName, { color: colors.text }]}
                numberOfLines={1}
              >
                {userData?.name || "Student"}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.primary }]}>
                {userData?.email}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text + "20"}
            />
          </Pressable>

          {/* Preference Section */}
          <Text style={[styles.sectionLabel, { color: colors.text + "40" }]}>
            {translations[language].preferences}
          </Text>
          <View
            style={[
              styles.group,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + "1A",
              },
            ]}
          >
            <SettingRow
              label={translations[language].theme}
              value={mode.charAt(0).toUpperCase() + mode.slice(1)}
              onPress={() => openSheet("theme")}
              icon="moon-outline"
              colors={colors}
            />
            <View
              style={[styles.divider, { backgroundColor: colors.text + "05" }]}
            />
            <SettingRow
              label={translations[language].language}
              value={
                language === "en"
                  ? "English"
                  : language === "mm"
                  ? "မြန်မာ"
                  : "日本語"
              }
              onPress={() => openSheet("lang")}
              icon="language-outline"
              colors={colors}
            />
          </View>

          {/* About Section */}
          <Text style={[styles.sectionLabel, { color: colors.text + "40" }]}>
            {translations[language].about_app}
          </Text>
          <View
            style={[
              styles.group,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + "1A",
              },
            ]}
          >
            <SettingRow
              label={translations[language].app_version}
              value={appVersion}
              icon="cube-outline"
              colors={colors}
            />
            <View
              style={[styles.divider, { backgroundColor: colors.text + "05" }]}
            />
            <SettingRow
              label={translations[language].user_manual}
              onPress={() => router.navigate("https://doa-jp.netlify.app")}
              icon="bookmarks-outline"
              colors={colors}
            />
            <SettingRow
              label={translations[language].about}
              onPress={() => router.navigate("https://doa-jp.netlify.app")}
              icon="information-circle-outline"
              colors={colors}
            />
            <SettingRow
              label={translations[language].support}
              onPress={() => router.navigate("https://doa-jp.netlify.app")}
              icon="help"
              colors={colors}
            />
            <SettingRow
              label={translations[language].contact}
              onPress={() => router.navigate("https://doa-jp.netlify.app")}
              icon="at-outline"
              colors={colors}
            />
            <SettingRow
              label={translations[language].clear_cache}
              onPress={() =>
                Alert.alert("Cache", "Cache cleared successfully!")
              }
              icon="trash-outline"
              colors={colors}
            />
          </View>
        </View>

        {/* Logout at the bottom */}
        <View style={styles.bottomSection}>
          <View
            style={[
              styles.group,
              {
                backgroundColor: colors.surface,
                marginBottom: 0,
                borderColor: colors.error + "5A",
              },
            ]}
          >
            <SettingRow
              label={translations[language].logout}
              isDestructive
              onPress={() => openSheet("logout")}
              icon="log-out-outline"
              colors={colors}
            />
          </View>
          <Text style={[styles.footerLegal, { color: colors.text + "50" }]}>
            {translations[language].made_with_love} • &copy;ドア
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sheet UI */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.text + "20" }}
      >
        <BottomSheetView style={styles.sheetContent}>
          {sheetContent === "theme" && (
            <ThemeSelector
              current={mode}
              onSelect={(m) => {
                setMode(m);
                bottomSheetRef.current?.close();
              }}
              colors={colors}
            />
          )}
          {sheetContent === "lang" && (
            <LanguageSelector
              current={language}
              onSelect={(l) => {
                setLanguage(l);
                bottomSheetRef.current?.close();
              }}
              colors={colors}
            />
          )}
          {sheetContent === "logout" && (
            <View style={styles.logoutContent}>
              <View style={styles.logoutIconCircle}>
                <Ionicons name="alert-circle" size={40} color="#FF3B30" />
              </View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {translations[language].confirm_logout}
              </Text>
              <Pressable style={styles.destructiveBtn} onPress={() => logout()}>
                <Text style={styles.destructiveText}>
                  {translations[language].logout}
                </Text>
              </Pressable>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const SettingRow = ({
  label,
  value,
  onPress,
  isDestructive,
  icon,
  colors,
}: any) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
  >
    <View style={styles.rowLeft}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isDestructive ? "#FF3B3010" : colors.text + "05" },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDestructive ? "#FF3B30" : colors.text}
        />
      </View>
      <Text
        style={[
          styles.rowLabel,
          { color: isDestructive ? "#FF3B30" : colors.text },
        ]}
      >
        {label}
      </Text>
    </View>
    {value && (
      <Text style={[styles.rowValue, { color: colors.primary }]}>{value}</Text>
    )}
  </Pressable>
);

const ThemeSelector = ({ current, onSelect, colors }: any) => (
  <View style={styles.selectorContainer}>
    <Text style={[styles.sheetTitle, { color: colors.text }]}>Appearance</Text>
    {["light", "dark", "system"].map((m) => (
      <Pressable
        key={m}
        onPress={() => onSelect(m)}
        style={[
          styles.selectorItem,
          {
            backgroundColor:
              current === m ? colors.primary + "10" : colors.text + "05",
          },
        ]}
      >
        <Text
          style={[
            styles.selectorText,
            {
              color: current === m ? colors.primary : colors.text,
              fontWeight: current === m ? "700" : "500",
            },
          ]}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </Text>
        {current === m && (
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        )}
      </Pressable>
    ))}
  </View>
);

const LanguageSelector = ({ current, onSelect, colors }: any) => {
  const languages: { id: Language; label: string; flag: string }[] = [
    { id: "en", label: "English", flag: "🇺🇸" },
    { id: "mm", label: "မြန်မာ", flag: "🇲🇲" },
    { id: "jp", label: "日本語", flag: "🇯🇵" },
  ];
  return (
    <View style={styles.selectorContainer}>
      <Text style={[styles.sheetTitle, { color: colors.text }]}>
        Select Language
      </Text>
      {languages.map((lang) => (
        <Pressable
          key={lang.id}
          onPress={() => onSelect(lang.id)}
          style={[
            styles.selectorItem,
            {
              backgroundColor:
                current === lang.id
                  ? colors.primary + "10"
                  : colors.text + "05",
            },
          ]}
        >
          <View style={styles.rowLeft}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>{lang.flag}</Text>
            <Text
              style={[
                styles.selectorText,
                {
                  color: current === lang.id ? colors.primary : colors.text,
                  fontWeight: current === lang.id ? "700" : "500",
                },
              ]}
            >
              {lang.label}
            </Text>
          </View>
          {current === lang.id && (
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={colors.primary}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    padding: 18,
    borderRadius: 28,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
  },
  profileText: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 20, fontWeight: "800" },
  profileEmail: { fontSize: 14, marginTop: 2 },
  sectionLabel: {
    marginHorizontal: 24,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 1,
  },
  group: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowLabel: { fontSize: 16, fontWeight: "600" },
  rowValue: { fontSize: 14, fontWeight: "700" },
  divider: { height: 1, marginHorizontal: 18 },
  bottomSection: { marginTop: 20 },
  footerLegal: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 15,
    letterSpacing: 1.5,
  },
  sheetContent: { padding: 24, paddingBottom: 40 },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  selectorContainer: { width: "100%" },
  selectorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
  },
  selectorText: { fontSize: 16 },
  logoutContent: { alignItems: "center" },
  logoutIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B3010",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  destructiveBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 18,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  destructiveText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});
