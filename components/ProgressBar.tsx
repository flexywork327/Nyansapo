import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface ProgressBarProps {
  label?: string;
  progress: number; // 0 - 1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ label, progress, color = '#0a7ea4', height = 10, style }) => {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.track, { height }]}> 
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.percent}>{Math.round(pct * 100)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  track: { backgroundColor: '#E6E8EB', borderRadius: 9999, overflow: 'hidden' },
  fill: { height: '100%' },
  percent: { fontSize: 12, color: '#687076' },
});

export default ProgressBar;
