import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sample data
const DUMMY_VIDEOS = [
  {
    id: '1',
    url: 'https://vidplay.io/stream/OJ4GbCRVms2EcIxqHBDyhQ',
    title: 'N5 Vocabulary: Business Japanese',
  },
  {
    id: '2',
    url: 'https://vidplay.io/stream/OJ4GbCRVms2EcIxqHBDyhQ',
    title: 'How to use Particle "WA" vs "GA"',
  },
];

const VideoItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
  const video = useRef<Video>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const toggleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaved(!isSaved);
  };

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={video}
        style={styles.fullVideo}
        source={{ uri: item.url }}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={isActive}
        onLoad={() => setLoaded(true)}
      />

      {/* Simplified Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        
        <Pressable onPress={toggleSave} style={styles.saveBtn}>
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={30} 
            color={isSaved ? "#FFD700" : "white"} 
          />
        </Pressable>
      </View>

      {!loaded && (
        <ActivityIndicator size="large" color="white" style={styles.loader} />
      )}
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

  return (
    <View style={styles.container}>
      {/* Header Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </Pressable>

      <FlatList
        data={DUMMY_VIDEOS}
        renderItem={({ item }) => (
          <VideoItem item={item} isActive={activeId === item.id} />
        )}
        keyExtractor={item => item.id}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: width,
    height: SCREEN_HEIGHT,
  },
  fullVideo: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 20,
    padding: 10,
  },
  overlay: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  saveBtn: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});