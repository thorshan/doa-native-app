import { userApi } from "@/api/userApi";
import { LEVEL } from "@/constants/level";
import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const Grammar = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          router.replace(ROUTES.LOGIN);
          return;
        }

        const res = await userApi.getUserData();
        setUserData(res.data);
      } catch (err) {
        console.error(err);
        router.replace(ROUTES.LOGIN);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading && userData) {
      switch (userData?.level?.current) {
        case LEVEL.n5:
          router.replace(ROUTES.GRAMMAR_N5);
          break;
        case LEVEL.n4:
          router.replace(ROUTES.GRAMMAR_N4);
          break;
        default:
          router.replace(ROUTES.GRAMMAR_N5);
      }
    }
  }, [loading, userData]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Grammar;
