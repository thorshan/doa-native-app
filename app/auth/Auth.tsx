import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";

const AuthScreen = () => {
  const { colors, typography } = useTheme();
  const { signIn, isLoading } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      // Trigger Haptic feedback on press
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // This calls the signIn function from our AuthContext
      await signIn();
      
      // Note: Navigation is handled inside AuthContext's handleBackendAuth
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Auth flow failed", err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[typography.h4, { color: colors.text, fontWeight: '800', marginTop: 20 }]}>
            Doa App
          </Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.6 }]}>
            Sign in to start your journey
          </Text>
        </View>

        {/* Auth Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
            style={[
              styles.googleButton, 
              { backgroundColor: colors.surface, borderColor: colors.text + "20" }
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#EA4335" style={styles.icon} />
                <Text style={[typography.button, { color: colors.text, fontSize: 16 }]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: colors.text, opacity: 0.5 }]}>
            Secure and passwordless authentication
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { 
    flex: 1, 
    justifyContent: "space-between", 
    padding: 24,
    paddingVertical: 80 
  },
  logoContainer: { 
    alignItems: "center", 
    marginTop: 40 
  },
  logo: { 
    width: 120, 
    height: 120,
    borderRadius: 30 
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center"
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center'
  },
  googleButton: {
    flexDirection: "row",
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    // Using your existing shadow style
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: { marginRight: 12 },
  footerText: {
    fontSize: 12,
    marginTop: 20,
    textAlign: "center",
  },
});