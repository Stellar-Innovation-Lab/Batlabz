import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const mainScale = useRef(new Animated.Value(0)).current;
  const ballScale = useRef(new Animated.Value(0)).current;
  const ballY = useRef(new Animated.Value(-200)).current;
  const ballRotate = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(mainScale, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }).start();
    
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ballScale, { toValue: 1.2, tension: 30, friction: 6, useNativeDriver: true }),
        Animated.spring(ballY, { toValue: 0, tension: 30, friction: 7, delay: 200, useNativeDriver: true }),
      ]),
      Animated.spring(ballY, { toValue: -40, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.spring(ballScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.spring(ballY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.timing(ballRotate, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.timing(logoOpacity, { toValue: 1, duration: 800, delay: 600, useNativeDriver: true }).start();
    
    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(ringScale, { toValue: 1.2, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(ringScale, { toValue: 0.8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    const timer = setTimeout(() => router.replace('/auth/login'), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#F8FAFC', '#FFFFFF', '#F8FAFC']} style={styles.gradient}>
        
        <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ringScale }] }]} />
        <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ringScale }] }]} />

        <Animated.View style={[styles.mainContainer, { transform: [{ scale: mainScale }] }]}>
          <Animated.View style={[styles.glow, { opacity: glowPulse }]} />

          <Animated.View style={[styles.ballContainer, { transform: [{ scale: ballScale }, { translateY: ballY }, { rotate: ballRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
            <View style={styles.ball}>
              <View style={styles.seam} />
              <View style={[styles.seam, { transform: [{ rotate: '-50deg' }] }]} />
              <View style={styles.ballShine1} />
              <View style={styles.ballShine2} />
            </View>
          </Animated.View>

          <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
            <View style={styles.logoRow}>
              <LinearGradient colors={['#10B981', '#16A34A']} style={styles.iconBg}>
                <Ionicons name="flash" size={36} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>BATLABZ</Text>
            </View>
            <LinearGradient colors={['#10B981', '#16A34A']} style={styles.badge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.badgeText}>PAY & PLAY CRICKET</Text>
            </LinearGradient>
            <Text style={styles.subtitle}>🏏 Premium Cricket Platform for UAE</Text>
          </Animated.View>

          <Animated.View style={[styles.loadingContainer, { opacity: logoOpacity }]}>
            <View style={styles.loadingBarBg}>
              <Animated.View style={[styles.loadingBar, { opacity: glowPulse }]} />
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.bottomBadge, { opacity: logoOpacity }]}>
          <Text style={styles.bottomText}>Powered by Innovation • Built for Cricket</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  ring: { position: 'absolute', borderRadius: 1000, borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.1)' },
  ring1: { width: 400, height: 400, top: height / 2 - 200, left: width / 2 - 200 },
  ring2: { width: 550, height: 550, top: height / 2 - 275, left: width / 2 - 275 },
  mainContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#10B981', shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 80 },
  ballContainer: { marginBottom: 40 },
  ball: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center', shadowColor: '#DC2626', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 20 },
  seam: { position: 'absolute', width: 80, height: 4, backgroundColor: '#fff', borderRadius: 2, transform: [{ rotate: '25deg' }] },
  ballShine1: { position: 'absolute', width: 35, height: 35, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.25)', top: 20, left: 25 },
  ballShine2: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.15)', top: 35, left: 45 },
  logoContainer: { alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBg: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  logoText: { fontSize: 56, fontWeight: '900', color: '#111827', letterSpacing: -2 },
  badge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 25, marginBottom: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  badgeText: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 3 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', fontWeight: '500' },
  loadingContainer: { marginTop: 60, alignItems: 'center' },
  loadingBarBg: { width: 240, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  loadingBar: { width: '80%', height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  bottomBadge: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  bottomText: { fontSize: 11, color: '#9CA3AF', letterSpacing: 0.5, fontWeight: '500' },
});