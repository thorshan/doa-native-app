import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");

// IMPORTANT: Ensure these are direct .mp4 or .m3u8 links
const DUMMY_VIDEOS = [
  {
    id: "1",
    url: "https://vidplay.io/stream/PZkiDsaHat7TCR8w_MdV5A",
    title: 'How to use Particle "WA" vs "GA"',
  },
  {
    id: "2",
    url: "https://vidplay.io/stream/pqHFPVwmRvXXusbTXnxwvA",
    title: "Aka + Midoi",
  },
  {
    id: "3",
    url: "https://vidplay.io/stream/j80Jl3rsPZCyY8JY9VZyBg",
    title: "Aka + Kiiro",
  },
  {
    id: "4",
    url: "https://vidplay.io/stream/OGvak8o_Vbn4uWzJLbn1Bw",
    title: "初めまして",
  },
];

const VideoItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Video Player
  const player = useVideoPlayer(item.url, (player) => {
    player.loop = true;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
      setIsPaused(false);
    } else {
      player.pause();
    }

    // Hide loader only when video is actually ready to render
    const subscription = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay") {
        setIsLoading(false);
      }
    });

    return () => subscription.remove();
  }, [isActive, player]);

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
      setIsPaused(true);
    } else {
      player.play();
      setIsPaused(false);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.videoContainer}>
      {/* 1. BACKGROUND VIDEO LAYER */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
      />

      {/* 2. LOADING SPINNER LAYER */}
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* 3. INTERACTION LAYER (Pause/Play) */}
      <Pressable onPress={togglePlayPause} style={styles.touchArea}>
        {isPaused && !isLoading && (
          <View style={styles.pauseOverlay}>
            <Ionicons name="play" size={30} color="rgba(255,255,255)" />
          </View>
        )}
      </Pressable>

      {/* 4. UI OVERLAY LAYER (Title & Save) */}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.textWrapper}>
          <Text style={styles.videoTitle}>{item.title}</Text>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsSaved(!isSaved);
          }}
          style={styles.saveBtn}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={30}
            color={isSaved ? "#FFD700" : "white"}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default function VideoFeed() {
  const router = useRouter();
  const [activeId, setActiveId] = useState(DUMMY_VIDEOS[0].id);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveId(viewableItems[0].item.id);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  return (
    <View style={styles.container}>
      {/* GLOBAL BACK BUTTON */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </Pressable>

      <FlatList
        data={DUMMY_VIDEOS}
        renderItem={({ item }) => (
          <VideoItem item={item} isActive={activeId === item.id} />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    width: width,
    height: SCREEN_HEIGHT,
    backgroundColor: "#111",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 2,
  },
  touchArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  pauseOverlay: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  overlay: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    zIndex: 10,
  },
  textWrapper: {
    flex: 1,
    marginRight: 20,
  },
  videoTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  saveBtn: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 30,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 25,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 25,
  },
});
