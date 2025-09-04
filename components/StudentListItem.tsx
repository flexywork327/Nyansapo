import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMPETENCE_COLORS } from './MasteryKey';

export interface Student {
  id: string;
  name: string;
  code: 'BE' | 'AE' | 'ME' | 'EE';
}

export default function StudentListItem({ student, onPress }: { student: Student; onPress: (id: string) => void }) {
  const color = COMPETENCE_COLORS[student.code];
  return (
    <Pressable onPress={() => onPress(student.id)} style={({ pressed }) => [styles.container, pressed && styles.pressed] }>
      <View style={styles.left}>
        <View style={[styles.badge, { backgroundColor: color }]} />
        <Text style={styles.name}>{student.name}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.code, { color }]}>{student.code}</Text>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={styles.arrow} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 2,
  },
  pressed: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.98 }],
  },
  left: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: { 
    width: 12, 
    height: 12, 
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  name: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  code: { 
    fontSize: 13, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrow: {
    marginLeft: 4,
  },
});
