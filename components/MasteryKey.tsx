import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const COMPETENCE_COLORS: Record<string, string> = {
  BE: '#EF4444', // Beginning
  AE: '#F59E0B', // Approaching
  ME: '#10B981', // Meeting
  EE: '#3B82F6', // Exceeding
};

const LABELS: Record<string, string> = {
  BE: 'Beginning (BE)',
  AE: 'Approaching (AE)',
  ME: 'Meeting (ME)',
  EE: 'Exceeding (EE)',
};

export default function MasteryKey() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mastery Key</Text>
      <View style={styles.row}>
        {Object.keys(COMPETENCE_COLORS).map((k) => (
          <View key={k} style={styles.item}>
            <View style={[styles.swatch, { backgroundColor: COMPETENCE_COLORS[k] }]} />
            <Text style={styles.text}>{LABELS[k]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E6E8EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  title: { fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  text: { fontSize: 12, color: '#11181C' },
});
