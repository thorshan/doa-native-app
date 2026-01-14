import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { authApi } from "@/api/authApi";
import { ROUTES } from "@/constants/routes";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const Register = () => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    // Validation with Haptics
    if (!name || !email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return Alert.alert("Missing Info", "Please fill in all fields to continue.");
    }

    try {
      setLoading(true);
      // Generate unique username on the fly
      const username = `user_${Math.random().toString(36).substring(2, 9)}`;
      const randomAvatarId = Math.floor(Math.random() * 21) + 1;
      
      const data = { name, email, password, username, randomAvatarId };
      const res = await authApi.register(data);

      
      await SecureStore.setItemAsync("token", res.data.token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      router.replace(ROUTES.OPTIONS);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Registration Failed",
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Pressable onPress={Keyboard.dismiss} style={styles.inner}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[typography.h4, { color: colors.text, fontWeight: '800', marginTop: 12 }]}>
            Create Account
          </Text>
          <Text style={[typography.body1, { color: colors.text, opacity: 0.5 }]}>
            Start your Japanese journey today
          </Text>
        </View>

        <View style={styles.form}>
          {/* Name Input */}
          <Text style={[styles.label, { color: colors.text }]}>{translations[language].name}</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
            <Ionicons name="person-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={colors.text + "50"}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          {/* Email Input */}
          <Text style={[styles.label, { color: colors.text }]}>{translations[language].email}</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
            <Ionicons name="mail-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
            <TextInput
              placeholder="example@gmail.com"
              placeholderTextColor={colors.text + "50"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          {/* Password Input */}
          <Text style={[styles.label, { color: colors.text }]}>{translations[language].password}</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.text + "50"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, { color: colors.text }]}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text + "80"} />
            </Pressable>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.inverted} />
            ) : (
              <Text style={[typography.button, { color: colors.inverted, fontSize: 18 }]}>
                {translations[language].register}
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[typography.body1, { color: colors.text, opacity: 0.6 }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push(ROUTES.LOGIN)}>
              <Text style={[typography.button, { color: colors.primary, marginLeft: 8 }]}>
                {translations[language].login}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { width: 90, height: 90 },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginLeft: 4, opacity: 0.7 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  eyeIcon: { padding: 8 },
  submitButton: {
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
});