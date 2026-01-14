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

const Login = () => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return Alert.alert("Required", "Please enter both email and password.");
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email, password });
      await SecureStore.setItemAsync("token", res.data.token);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Invalid Credentials"
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
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[typography.h4, { color: colors.text, fontWeight: '800', marginTop: 10 }]}>
            Welcome Back
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text, opacity: 0.6 }]}>
            {translations[language].email}
          </Text>
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

          <Text style={[styles.label, { color: colors.text, opacity: 0.6, marginTop: spacing.md }]}>
            {translations[language].password}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
            <TextInput
              placeholder="••••••••"
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

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.inverted} />
            ) : (
              <Text style={[typography.button, { color: colors.inverted, fontSize: 18 }]}>
                {translations[language].login}
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer Links */}
          <View style={styles.footer}>
            <Text style={[typography.body1, { color: colors.text, opacity: 0.7 }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push(ROUTES.REGISTER)}>
              <Text style={[typography.button, { color: colors.primary, marginLeft: 8 }]}>
                {translations[language].register}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: "center", padding: 24 },
  logoContainer: { 
    alignItems: "center", 
    marginBottom: 40 
  },
  logo: { 
    width: 100, 
    height: 100,
    borderRadius: 24 
  },
  form: { width: '100%' },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 4,
    // Modern shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: { padding: 8 },
  loginButton: {
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
});