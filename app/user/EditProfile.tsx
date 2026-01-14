import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { userApi } from "@/api/userApi";
import { ROUTES } from "@/constants/routes";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import { getAvatarSource } from "@/utils/getAvatarUrl";

/* ================= STABLE INPUT COMPONENT ================= */
const ProfileInput = memo(
  ({ label, value, onChange, placeholder, autoCap = "none", colors }: any) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text + "50" }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text + "20"}
        autoCapitalize={autoCap}
        autoCorrect={false}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: colors.text + "08",
          },
        ]}
      />
    </View>
  )
);
ProfileInput.displayName = "ProfileInput";

/* ================= MAIN COMPONENT ================= */
const EditProfile: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userApi.getUserData();
        const data = res.data;
        setUserData(data);
        setFormData({
          name: data.name ?? "",
          username: data.username ?? "",
        });
      } catch (err: any) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError("");

      // We only update name and username here.
      // Avatar selection is handled separately in the AvatarPicker screen.
      await userApi.updateUser(userData?._id, {
        ...formData,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      setError(err?.message ?? "Update failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === "mm" ? "ပရိုဖိုင်ပြင်ရန်" : "Edit Profile"}
        </Text>
        <Pressable
          onPress={handleSubmit}
          disabled={saving}
          style={styles.saveBtn}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveBtnText, { color: colors.primary }]}>
              {translations[language].save}
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section - Now navigates to your Picker */}
          <View style={styles.avatarSection}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(ROUTES.AVATAR_SELECT);
              }}
              style={styles.avatarWrapper}
            >
              <View
                style={[
                  styles.avatarFrame,
                  {
                    borderColor: colors.primary + "30",
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Image
                  source={getAvatarSource(
                    userData?.avatarId || userData?.image
                  )}
                  style={styles.avatarImage}
                />
                <View
                  style={[
                    styles.editBadge,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.background,
                    },
                  ]}
                >
                  <Ionicons name="pencil" size={14} color="white" />
                </View>
              </View>
            </Pressable>
            <Text style={[styles.changeText, { color: colors.primary }]}>
              {language === "mm" ? "ပုံပြောင်းရန်" : "Change Character"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <ProfileInput
              label={translations[language].name}
              value={formData.name}
              placeholder="Your name"
              onChange={(v: string) => setFormData((p) => ({ ...p, name: v }))}
              colors={colors}
            />

            <ProfileInput
              label={language === "en" ? "Username" : language === "jp" ? "ウザー名前" : "အသုံးပြုသူအမည်"}
              value={formData.username}
              placeholder="@username"
              onChange={(v: string) =>
                setFormData((p) => ({ ...p, username: v }))
              }
              colors={colors}
            />
          </View>

          {error ? (
            <View style={[styles.errorCard, { backgroundColor: "#FF3B3010" }]}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <Text
                style={{ color: "#FF3B30", fontWeight: "600", marginLeft: 8 }}
              >
                {error}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ================= STYLES ================= */
const AVATAR_SIZE = 120;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  saveBtn: { paddingHorizontal: 12, height: 44, justifyContent: "center" },
  saveBtnText: { fontWeight: "800", fontSize: 16 },
  scrollContent: { padding: 24 },
  avatarSection: { alignItems: "center", marginBottom: 35 },
  avatarWrapper: { marginBottom: 12 },
  avatarFrame: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  editBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  changeText: { fontSize: 14, fontWeight: "700" },
  formSection: { gap: 24 },
  inputGroup: { gap: 10 },
  label: {
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    height: 58,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
  },
  errorCard: {
    marginTop: 30,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default EditProfile;
