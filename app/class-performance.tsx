import MasteryKey from "@/components/MasteryKey";
import { ProgressBar } from "@/components/ProgressBar";
import StudentListItem, { Student } from "@/components/StudentListItem";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Strand =
  | "Letter Identification"
  | "Letter Naming"
  | "Letter Formation"
  | "Phonemic Awareness";

type StrandData = {
  strand: Strand;
  progress: number; // 0..1
  students: Student[];
};

// Load JSON data via Metro bundler
const dataJson = require("@/assets/data.json");

export default function ClassPerformanceScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    needs: boolean;
    track: boolean;
    exceeds: boolean;
  }>({
    needs: false,
    track: false,
    exceeds: false,
  });

  // Map JSON class profile into StrandData[]
  const baseData: StrandData[] = useMemo(() => {
    const strands = dataJson?.class_profile?.strands ?? [];
    return strands.map((st: any) => ({
      strand: st.strand as Strand,
      progress: Math.max(0, Math.min(1, (st.workCovered ?? 0) / 100)),
      students: (st.students ?? []).map((s: any) => ({
        id: s.studentId,
        name: s.name,
        code: s.competence,
      })),
    }));
  }, []);

  // Apply search query and competence filters
  const data: StrandData[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filterCodes: string[] = [];
    if (selectedFilters.needs) filterCodes.push("BE");
    if (selectedFilters.track) filterCodes.push("AE", "ME");
    if (selectedFilters.exceeds) filterCodes.push("EE");

    const applyFilters = (students: Student[]) => {
      let res = students;
      if (q) res = res.filter((s) => s.name.toLowerCase().includes(q));
      if (filterCodes.length > 0)
        res = res.filter((s) => filterCodes.includes(s.code));
      return res;
    };

    return baseData.map((item) => ({
      ...item,
      students: applyFilters(item.students),
    }));
  }, [baseData, query, selectedFilters]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Performance</Text>
        <View style={styles.actions}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search students"
            placeholderTextColor="#808080"
            autoCorrect={false}
            returnKeyType="search"
          />
          <Pressable
            style={styles.actionPill}
            onPress={() => setFilterVisible(true)}
          >
            <Text style={styles.actionText}>Filter</Text>
          </Pressable>
        </View>
      </View>
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalRoot}>
          <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filters</Text>
            <View style={styles.modalContent}>
              <Pressable
                style={[
                  styles.filterOption,
                  selectedFilters.needs && styles.filterOptionSelected,
                ]}
                onPress={() =>
                  setSelectedFilters((f) => ({ ...f, needs: !f.needs }))
                }
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilters.needs && styles.filterOptionTextSelected,
                  ]}
                >
                  Show Needs Support
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.filterOption,
                  selectedFilters.track && styles.filterOptionSelected,
                ]}
                onPress={() =>
                  setSelectedFilters((f) => ({ ...f, track: !f.track }))
                }
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilters.track && styles.filterOptionTextSelected,
                  ]}
                >
                  Show On Track
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.filterOption,
                  selectedFilters.exceeds && styles.filterOptionSelected,
                ]}
                onPress={() =>
                  setSelectedFilters((f) => ({ ...f, exceeds: !f.exceeds }))
                }
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilters.exceeds && styles.filterOptionTextSelected,
                  ]}
                >
                  Show Exceeds
                </Text>
              </Pressable>
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.clearButton]}
                onPress={() =>
                  setSelectedFilters({
                    needs: false,
                    track: false,
                    exceeds: false,
                  })
                }
              >
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
              <Pressable
                style={[styles.actionPill]}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.actionText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.keyContainer}>
        <MasteryKey />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.strand}
        contentContainerStyle={{ padding: 20, paddingTop: 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.strand}</Text>
            <ProgressBar progress={item.progress} />
            <View style={styles.list}>
              {item.students.map((s) => (
                <StudentListItem
                  key={s.id}
                  student={s}
                  onPress={(id) =>
                    router.push({ pathname: "/student/[id]", params: { id } })
                  }
                />
              ))}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#F8FAFC", 
    paddingTop: 20 
  },
  header: { 
    padding: 20, 
    paddingBottom: 16,
    gap: 16, 
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  actions: { 
    flexDirection: "row", 
    gap: 12, 
    alignItems: "center" 
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionPill: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#0a7ea4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 15,
  },
  keyContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 12,
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  list: { 
    marginTop: 12,
    gap: 4,
  },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    marginBottom: 16,
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  modalContent: { gap: 12 },
  filterOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  filterOptionSelected: {
    backgroundColor: "#EBF8FF",
    borderColor: "#0a7ea4",
    shadowColor: "#0a7ea4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterOptionText: { 
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  filterOptionTextSelected: { 
    color: "#0a7ea4", 
    fontWeight: "700" 
  },
  modalActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clearText: { 
    color: "#6B7280", 
    fontWeight: "600",
    fontSize: 15,
  },
});
