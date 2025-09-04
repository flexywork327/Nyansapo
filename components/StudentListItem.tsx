import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COMPETENCE_COLORS } from './MasteryKey';

export interface Student {
  id: string;
  name: string;
  code: 'BE' | 'AE' | 'ME' | 'EE';
}

export default function StudentListItem({ student, onPress }: { student: Student; onPress: (id: string) => void }) {
  const color = COMPETENCE_COLORS[student.code];
  return (
    <Pressable onPress={() => onPress(student.id)} style={({ pressed }) => [styles.container, pressed && { opacity: 0.6 }] }>
      <View style={styles.left}>
        <View style={[styles.badge, { backgroundColor: color }]} />
        <Text style={styles.name}>{student.name}</Text>
      </View>
      <Text style={[styles.code, { color }]}>{student.code}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E8EB',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 10, height: 10, borderRadius: 5 },
  name: { fontSize: 16, fontWeight: '500' },
  code: { fontSize: 14, fontWeight: '700' },
});
