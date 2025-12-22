import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Path, G, Ellipse } from 'react-native-svg';
import { COLORS } from './theme';

const { width, height } = Dimensions.get('window');

// Cricket Ball Background Pattern
export const CricketBallPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="ballGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={COLORS.cricketRed} stopOpacity={opacity * 2} />
          <Stop offset="100%" stopColor={COLORS.cricketRed} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {/* Scattered cricket balls */}
      <Circle cx={width * 0.1} cy={height * 0.15} r={30} fill="url(#ballGrad)" />
      <Circle cx={width * 0.85} cy={height * 0.25} r={25} fill="url(#ballGrad)" />
      <Circle cx={width * 0.2} cy={height * 0.6} r={35} fill="url(#ballGrad)" />
      <Circle cx={width * 0.9} cy={height * 0.7} r={28} fill="url(#ballGrad)" />
      <Circle cx={width * 0.5} cy={height * 0.85} r={32} fill="url(#ballGrad)" />
    </Svg>
  </View>
);

// Stadium Lights Effect
export const StadiumLights = ({ intensity = 0.15 }: { intensity?: number }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="light1" cx="0%" cy="0%" r="80%">
          <Stop offset="0%" stopColor={COLORS.gold} stopOpacity={intensity} />
          <Stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="light2" cx="100%" cy="0%" r="80%">
          <Stop offset="0%" stopColor={COLORS.primary} stopOpacity={intensity * 0.8} />
          <Stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="light3" cx="50%" cy="100%" r="60%">
          <Stop offset="0%" stopColor={COLORS.secondary} stopOpacity={intensity * 0.5} />
          <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={0} cy={0} rx={width * 0.8} ry={height * 0.4} fill="url(#light1)" />
      <Ellipse cx={width} cy={0} rx={width * 0.7} ry={height * 0.35} fill="url(#light2)" />
      <Ellipse cx={width / 2} cy={height} rx={width * 0.6} ry={height * 0.3} fill="url(#light3)" />
    </Svg>
  </View>
);

// Cricket Stumps Icon
export const CricketStumps = ({ size = 100, opacity = 0.1 }: { size?: number; opacity?: number }) => (
  <Svg width={size} height={size * 1.5} viewBox="0 0 100 150" opacity={opacity}>
    {/* Three stumps */}
    <Path d="M25 10 L25 140 L30 140 L30 10 Z" fill={COLORS.stumps} />
    <Path d="M47 10 L47 140 L52 140 L52 10 Z" fill={COLORS.stumps} />
    <Path d="M70 10 L70 140 L75 140 L75 10 Z" fill={COLORS.stumps} />
    {/* Bails */}
    <Path d="M23 8 L32 8 L32 12 L23 12 Z" fill={COLORS.stumps} />
    <Path d="M45 8 L54 8 L54 12 L45 12 Z" fill={COLORS.stumps} />
    <Path d="M68 8 L77 8 L77 12 L68 12 Z" fill={COLORS.stumps} />
  </Svg>
);

// Cricket Bat Icon
export const CricketBat = ({ size = 80, opacity = 0.08 }: { size?: number; opacity?: number }) => (
  <Svg width={size} height={size * 2} viewBox="0 0 60 120" opacity={opacity}>
    {/* Bat handle */}
    <Path d="M26 0 L34 0 L34 40 L26 40 Z" fill={COLORS.cricketBrown} />
    {/* Handle grip */}
    <Path d="M24 0 L36 0 L36 8 L24 8 Z" fill={COLORS.secondary} />
    <Path d="M24 12 L36 12 L36 20 L24 20 Z" fill={COLORS.secondary} />
    {/* Bat blade */}
    <Path d="M15 40 L45 40 L48 50 L48 110 C48 115 45 118 40 118 L20 118 C15 118 12 115 12 110 L12 50 Z" fill={COLORS.stumps} />
    {/* Blade edge highlight */}
    <Path d="M18 45 L42 45 L44 52 L44 105 C44 108 42 110 40 110 L20 110 C18 110 16 108 16 105 L16 52 Z" fill={COLORS.gold} opacity={0.3} />
  </Svg>
);

// Pitch Pattern Background
export const PitchPattern = ({ opacity = 0.05 }: { opacity?: number }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="pitchGrad" cx="50%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={COLORS.pitchGreen} stopOpacity={opacity * 1.5} />
          <Stop offset="100%" stopColor={COLORS.pitchGreen} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {/* Central pitch glow */}
      <Ellipse cx={width / 2} cy={height * 0.3} rx={width * 0.4} ry={height * 0.25} fill="url(#pitchGrad)" />
      {/* Pitch lines */}
      <Path
        d={`M${width * 0.35} ${height * 0.2} L${width * 0.65} ${height * 0.2}`}
        stroke={COLORS.pitchGreen}
        strokeWidth={2}
        opacity={opacity * 3}
      />
      <Path
        d={`M${width * 0.35} ${height * 0.4} L${width * 0.65} ${height * 0.4}`}
        stroke={COLORS.pitchGreen}
        strokeWidth={2}
        opacity={opacity * 3}
      />
    </Svg>
  </View>
);

// Full Premium Background
export const PremiumBackground = ({ variant = 'default' }: { variant?: 'default' | 'match' | 'ground' | 'wallet' }) => {
  const getColors = () => {
    switch (variant) {
      case 'match':
        return { primary: COLORS.cricketRed, secondary: COLORS.gold };
      case 'ground':
        return { primary: COLORS.pitchGreen, secondary: COLORS.primary };
      case 'wallet':
        return { primary: COLORS.gold, secondary: COLORS.secondary };
      default:
        return { primary: COLORS.primary, secondary: COLORS.gold };
    }
  };

  const colors = getColors();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.background }]} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="bgGrad1" cx="20%" cy="10%" r="60%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.15} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="bgGrad2" cx="80%" cy="90%" r="50%">
            <Stop offset="0%" stopColor={colors.secondary} stopOpacity={0.1} />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.02} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width * 0.2} cy={height * 0.1} rx={width * 0.6} ry={height * 0.3} fill="url(#bgGrad1)" />
        <Ellipse cx={width * 0.8} cy={height * 0.9} rx={width * 0.5} ry={height * 0.25} fill="url(#bgGrad2)" />
        <Circle cx={width / 2} cy={height / 2} r={width * 0.4} fill="url(#centerGlow)" />
      </Svg>
    </View>
  );
};

// Animated Glow Ring (for highlights)
export const GlowRing = ({ size = 200, color = COLORS.primary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Defs>
      <RadialGradient id="glowRing" cx="50%" cy="50%" r="50%">
        <Stop offset="70%" stopColor={color} stopOpacity={0} />
        <Stop offset="85%" stopColor={color} stopOpacity={0.3} />
        <Stop offset="100%" stopColor={color} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={100} cy={100} r={95} fill="url(#glowRing)" />
  </Svg>
);

const styles = StyleSheet.create({});
