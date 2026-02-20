import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(50)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 40, friction: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(logoY, { toValue: 0, tension: 50, friction: 12, delay: 200, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.5, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    const timer = setTimeout(() => router.replace('/auth/login'), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#4A90E2', '#357ABD', '#2A5F8F']} style={styles.gradient}>
        <Animated.View style={[styles.glowBg, { opacity: glowPulse }]} />
        
        <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconContainer}>
            <LinearGradient colors={['#FFFFFF', '#E0F2F7']} style={styles.iconBg}>
              <Ionicons name="flash" size={48} color="#4A90E2" />
            </LinearGradient>
          </View>
          
          <Animated.View style={{ transform: [{ translateY: logoY }] }}>
            <Text style={styles.logo}>BATLABZ</Text>
            <View style={styles.tagline}>
              <Text style={styles.taglineText}>PAY & PLAY CRICKET</Text>
            </View>
            <Text style={styles.subtitle}>Premium Cricket Platform</Text>
          </Animated.View>

          <View style={styles.loadingBar}>
            <Animated.View style={[styles.loadingProgress, { opacity: glowPulse }]} />
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  glowBg: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.1)', top: height / 3, left: width / 2 - 150 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconContainer: { marginBottom: 40 },
  iconBg: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', shadowColor: '#fff', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  logo: { fontSize: 48, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: -1, marginBottom: 16 },
  tagline: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 16, alignSelf: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  taglineText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: '500' },
  loadingBar: { width: 200, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden', marginTop: 60 },
  loadingProgress: { width: '75%', height: '100%', backgroundColor: '#fff', borderRadius: 2 },
});