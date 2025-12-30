import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const ballScale = useSharedValue(0);
  const ballRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Cricket ball animation
    ballScale.value = withSpring(1, { damping: 10 });
    ballRotate.value = withSequence(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      withTiming(720, { duration: 1000, easing: Easing.linear })
    );

    // Logo animation
    logoScale.value = withDelay(
      300,
      withSpring(1, {
        damping: 8,
        stiffness: 100,
      })
    );

    logoRotate.value = withDelay(
      300,
      withSequence(
        withTiming(-10, { duration: 200 }),
        withTiming(10, { duration: 200 }),
        withTiming(0, { duration: 200 })
      )
    );

    // Glow animation
    glowOpacity.value = withDelay(
      500,
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 })
      )
    );

    // Text animation
    textOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(800, withSpring(0, { damping: 12 }));

    // Navigate after animations
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: ballScale.value },
      { rotate: `${ballRotate.value}deg` },
    ],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated circles background */}
        <View style={styles.circlesContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Glow effect */}
          <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
            <View style={styles.glow} />
          </Animated.View>

          {/* Cricket ball */}
          <Animated.View style={[styles.ballContainer, ballAnimatedStyle]}>
            <View style={styles.ball}>
              <View style={styles.seam} />
              <View style={[styles.seam, styles.seam2]} />
            </View>
          </Animated.View>

          {/* Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Text style={styles.logoText}>BATLABZ</Text>
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>PAY & PLAY CRICKET</Text>
            </View>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View style={textAnimatedStyle}>
            <Text style={styles.subtitle}>🏏 Welcome!</Text>
            <Text style={styles.description}>Join UAE's premier cricket community</Text>
          </Animated.View>

          {/* Loading indicator */}
          <Animated.View style={[styles.loadingContainer, textAnimatedStyle]}>
            <View style={styles.loadingBar}>
              <View style={styles.loadingProgress} />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  circlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    left: -100,
  },
  circle2: {
    width: 400,
    height: 400,
    bottom: -150,
    right: -150,
  },
  circle3: {
    width: 200,
    height: 200,
    top: height / 2,
    right: -50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glowContainer: {
    position: 'absolute',
  },
  glow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4ade80',
    opacity: 0.2,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },
  ballContainer: {
    marginBottom: 40,
  },
  ball: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  seam: {
    position: 'absolute',
    width: 60,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    transform: [{ rotate: '20deg' }],
  },
  seam2: {
    transform: [{ rotate: '-20deg' }],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
    textShadowColor: 'rgba(74, 222, 128, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  taglineContainer: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  tagline: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 60,
    width: 200,
  },
  loadingBar: {
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '70%',
    backgroundColor: '#4ade80',
    borderRadius: 2,
  },
});