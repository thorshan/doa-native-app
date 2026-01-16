import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    Dimensions,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// --- CONFIGURATION ---
const ADMIN_DETAILS = {
  name: "Myo Thu Naing",
  alias: "Thor Shan",
  kbzPhone: "09974484822",
  paypal: "https://paypal.me/thorshan",
  coffee: "https://buymeacoffee.com/yourusername",
};

const GOAL_DATA = {
  current: 12,
  target: 50,
};

export default function AdminInfo() {
  const router = useRouter();
  const { colors, typography } = useTheme();

  const progressPercent = (GOAL_DATA.current / GOAL_DATA.target) * 100;

  const handleCopyKBZ = async () => {
    await Clipboard.setStringAsync(ADMIN_DETAILS.kbzPhone);
    Alert.alert("Success", "KBZPay number copied to clipboard!");
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open link")
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          ABOUT DEVELOPER
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={["#91B43D", "#5C821A"]}
            style={styles.avatarGlow}
          />
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons name="person" size={50} color={colors.primary} />
          </View>
          <Text style={[styles.nameText, { color: colors.text }]}>
            {ADMIN_DETAILS.name}
          </Text>
          <Text style={[styles.aliasText, { color: colors.primary }]}>
            {ADMIN_DETAILS.alias}
          </Text>
        </View>

        {/* Multilingual Bio Section */}
        <View style={styles.bioContainer}>
          {/* Burmese */}
          <View style={[styles.langBlock, { borderLeftColor: "#0b9a38" }]}>
            <Text style={[styles.langTag, { color: "#0b9a38" }]}>
              မြန်မာဘာသာ
            </Text>
            <Text
              style={[styles.bioText, { color: colors.text, lineHeight: 30 }]}
            >
              ဒီ App ကို ဂျပန်စာလေ့လာသူများ{" "}
              <Text style={[styles.bold, { color: "#0b9a38" }]}>
                လုံးဝအခမဲ့
              </Text>{" "}
              သင်ယူနိုင်ဖို့နဲ့ အလုပ်အကိုင် အခွင့်အလမ်းများ တိုးတက်စေဖို့
              စေတနာ့ဝန်ထမ်း project အနေနဲ့ ဖန်တီးထားတာပါ။ သင်တို့ ဝယ်ယူပေးတဲ့
              Matcha တစ်ခွက်ချင်းစီဟာ ကျွန်တော့်အတွက် ခွန်အားတစ်ခု ဖြစ်စေပါတယ်။
            </Text>
          </View>
          {/* English */}
          <View style={[styles.langBlock, { borderLeftColor: "#0279d4" }]}>
            <Text style={[styles.langTag, { color: "#0279d4" }]}>English</Text>
            <Text style={[styles.bioText, { color: colors.text }]}>
              I created this app as a volunteer project to help learners study
              Japanese
              <Text style={[styles.bold, { color: "#0279d4" }]}>
                {" "}
                absolutely free of charge
              </Text>
              . My goal is to support your career improvement and personal
              dreams. Every cup of Matcha fuels my dedication to keeping this
              platform accessible for all.
            </Text>
          </View>

          {/* Japanese */}
          <View style={[styles.langBlock, { borderLeftColor: "#bc2b1e" }]}>
            <Text style={[styles.langTag, { color: "#bc2b1e" }]}>日本語</Text>
            <Text style={[styles.bioText, { color: colors.text }]}>
              このアプリは、皆さんが
              <Text style={[styles.bold, { color: "#bc2b1e" }]}>完全無料</Text>
              で日本語を学び、キャリアアップや夢を実現できるよう、ボランティアとして開発しました。皆さんからのサポートは、この活動を続けるための原動力となります。
            </Text>
          </View>
        </View>

        {/* Local Support (KBZPay) */}
        <View style={[styles.kbzCard, { backgroundColor: colors.surface }]}>
          <View style={styles.kbzHeader}>
            <Text style={[styles.kbzTitle, { color: colors.text }]}>
              LOCAL SUPPORT (MYANMAR)
            </Text>
            <Ionicons name="wallet-outline" size={20} color="#1060AA" />
          </View>

          <View style={styles.kbzBody}>
            <View>
              <Text
                style={[styles.kbzLabel, { color: colors.text, opacity: 0.6 }]}
              >
                KBZPay Name
              </Text>
              <Text style={[styles.kbzValue, { color: colors.text }]}>
                {ADMIN_DETAILS.name}
              </Text>
            </View>
            <View style={{ marginTop: 15 }}>
              <Text
                style={[styles.kbzLabel, { color: colors.text, opacity: 0.6 }]}
              >
                Phone / Account
              </Text>
              <View style={styles.numberRow}>
                <Text
                  style={[
                    styles.kbzValue,
                    { color: colors.text, fontSize: 18 },
                  ]}
                >
                  {ADMIN_DETAILS.kbzPhone}
                </Text>
                <Pressable onPress={handleCopyKBZ} style={styles.copyIcon}>
                  <Ionicons name="copy" size={20} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Goal Tracker */}
        <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, { color: colors.text }]}>
              Monthly Matcha Goal 🍵
            </Text>
            <Text style={{ color: colors.primary, fontWeight: "900" }}>
              {GOAL_DATA.current}/{GOAL_DATA.target}
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.goalFooter}>
            Helps cover server & hosting costs
          </Text>
        </View>

        {/* International Support Buttons */}
        <View style={styles.buttonGroup}>
          <Pressable
            style={[styles.donateBtn, { backgroundColor: "#0070BA" }]}
            onPress={() => openLink(ADMIN_DETAILS.paypal)}
          >
            <Ionicons name="logo-paypal" size={22} color="white" />
            <Text style={[styles.btnText, { color: colors.inverted }]}>
              PayPal Support
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 14, fontWeight: "800", letterSpacing: 1.5 },
  scrollContent: { paddingHorizontal: 20 },

  profileSection: { alignItems: "center", marginVertical: 30 },
  avatarGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    top: -5,
    opacity: 0.3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nameText: { fontSize: 22, fontWeight: "900", marginTop: 15 },
  aliasText: { fontSize: 16, fontWeight: "600", marginTop: 2 },

  bioContainer: { marginBottom: 30 },
  langBlock: {
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#91B43D",
    paddingLeft: 15,
  },
  langTag: {
    fontSize: 10,
    fontWeight: "900",
    color: "#5C821A",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  bioText: { fontSize: 15, lineHeight: 30, opacity: 0.8 },
  bold: { fontWeight: "800", color: "#5C821A" },

  // KBZ Card
  kbzCard: { padding: 20, borderRadius: 20, marginBottom: 20, elevation: 2 },
  kbzHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingBottom: 10,
  },
  kbzTitle: { fontSize: 11, fontWeight: "900", opacity: 0.6 },
  kbzBody: { gap: 5 },
  kbzLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  kbzValue: { fontSize: 16, fontWeight: "800" },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copyIcon: { padding: 5 },

  // Goal Tracker
  goalCard: { padding: 20, borderRadius: 20, marginBottom: 25 },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  goalTitle: { fontWeight: "700" },
  progressBg: {
    height: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#91B43D" },
  goalFooter: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 10,
    textAlign: "center",
  },

  // Buttons
  buttonGroup: { gap: 12 },
  donateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
  },
  btnText: { fontSize: 16, fontWeight: "800" },
});
