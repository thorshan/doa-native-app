import { userApi } from "@/api/userApi";
import { AVATAR_LIST } from "@/constants/Avatars";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AvatarPicker() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  
  // Initialize with user's current avatar ID if available
  const [selectedId, setSelectedId] = useState<number>(user?.avatarId || 1);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    try {
      // Ensure we use the correct ID field from your Auth context
      await userApi.updateUser(user?._id || user?._id as string, { avatarId: selectedId });
      router.push("/Settings");
    } catch (error) {
      console.error("Failed to update avatar:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          Choose Your Avatar
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={AVATAR_LIST}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedId(item.id);
            }}
            style={[
              styles.avatarCard,
              { backgroundColor: colors.surface },
              selectedId === item.id && {
                borderColor: colors.primary,
                backgroundColor: colors.primary + "10",
              },
            ]}
          >
            <Image source={item.img} style={styles.image} resizeMode="contain" />
            {selectedId === item.id && (
              <View
                style={[styles.checkBadge, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.saveBtn, 
            { backgroundColor: colors.primary },
            loading && { opacity: 0.7 }
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Confirm Selection</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  closeBtn: { padding: 10 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  list: { 
    alignItems: "center", 
    paddingBottom: 100,
    paddingTop: 20 
  },
  avatarCard: {
    width: 100,
    height: 100,
    margin: 8,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    // Glassmorphism effect shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  image: { width: 70, height: 70 },
  checkBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#fff'
  },
  footer: {
    padding: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  saveBtn: {
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});