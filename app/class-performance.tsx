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
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
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
  safe: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
  header: { padding: 16, gap: 12, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800" },
  actions: { flexDirection: "row", gap: 10, alignItems: "center" },
  searchInput: {
    flex: 1,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E6E8EB",
    backgroundColor: "#F7F8F9",
  },
  actionPill: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  actionText: { color: "#fff", fontWeight: "600" },
  keyContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6E8EB",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  list: { marginTop: 8 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  modalContent: { gap: 8 },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6E8EB",
    backgroundColor: "#F9FAFB",
  },
  filterOptionSelected: {
    backgroundColor: "#E6F6FB",
    borderColor: "#0a7ea4",
  },
  filterOptionText: { color: "#111" },
  filterOptionTextSelected: { color: "#0a7ea4", fontWeight: "700" },
  modalActions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F3F5",
  },
  clearText: { color: "#334155", fontWeight: "600" },
});
