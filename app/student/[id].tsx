import MasteryKey, { COMPETENCE_COLORS } from "@/components/MasteryKey";
import { ProgressBar } from "@/components/ProgressBar";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STRANDS = [
  "Letter Identification",
  "Letter Naming",
  "Letter Formation",
  "Phonemic Awareness",
] as const;

type Strand = (typeof STRANDS)[number];

// Load JSON data via Metro bundler
// The JSON has shape { students: [{ id, name, strands: { letterIdentification: { competence, progress }, ... } }] }
const dataJson = require("@/assets/data.json");

export default function StudentPerformanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedStrand, setSelectedStrand] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  const student = useMemo(() => {
    const list = dataJson?.students ?? [];
    return list.find((s: any) => s.id === id);
  }, [id]);

  const rows = useMemo(() => {
    const s = student;
    if (!s)
      return [] as {
        strand: Strand;
        level: "BE" | "AE" | "ME" | "EE";
        progress: number;
      }[];
    const map: Record<
      Strand,
      { level: "BE" | "AE" | "ME" | "EE"; progress: number }
    > = {
      "Letter Identification": {
        level: s.strands.letterIdentification.competence,
        progress: Math.max(
          0,
          Math.min(1, (s.strands.letterIdentification.progress ?? 0) / 100)
        ),
      },
      "Letter Naming": {
        level: s.strands.letterNaming.competence,
        progress: Math.max(
          0,
          Math.min(1, (s.strands.letterNaming.progress ?? 0) / 100)
        ),
      },
      "Letter Formation": {
        level: s.strands.letterFormation.competence,
        progress: Math.max(
          0,
          Math.min(1, (s.strands.letterFormation.progress ?? 0) / 100)
        ),
      },
      "Phonemic Awareness": {
        level: s.strands.phonemicAwareness.competence,
        progress: Math.max(
          0,
          Math.min(1, (s.strands.phonemicAwareness.progress ?? 0) / 100)
        ),
      },
    };
    return STRANDS.map((k) => ({ strand: k, ...map[k] }));
  }, [student]);

  const studentName = student?.name ?? `Student ${id}`;

  // Calculate overall performance metrics
  const overallStats = useMemo(() => {
    if (!student) return { average: 0, totalStrands: 0, masteredStrands: 0 };

    const totalProgress = rows.reduce((sum, row) => sum + row.progress, 0);
    const average = rows.length > 0 ? totalProgress / rows.length : 0;
    const masteredStrands = rows.filter((row) => row.level === "EE").length;

    return {
      average: Math.round(average * 100),
      totalStrands: rows.length,
      masteredStrands,
    };
  }, [student, rows]);

  const getPerformanceLevel = (average: number) => {
    if (average >= 85)
      return { level: "Excellent", color: "#10B981", bgColor: "#ECFDF5" };
    if (average >= 70)
      return { level: "Good", color: "#F59E0B", bgColor: "#FFFBEB" };
    if (average >= 50)
      return { level: "Developing", color: "#EF4444", bgColor: "#FEF2F2" };
    return { level: "Beginning", color: "#6B7280", bgColor: "#F9FAFB" };
  };

  const performanceLevel = getPerformanceLevel(overallStats.average);

  const onDownload = async () => {
    try {
      // Dynamically import to avoid breaking web if not supported
      const Print = await import("expo-print");
      const Sharing = await import("expo-sharing");

      const dateStr = new Date().toLocaleString();
      const rowsHtml = rows
        .map(
          (r) => `
          <tr>
            <td style="padding:8px;border:1px solid #e5e7eb;">${r.strand}</td>
            <td style="padding:8px;border:1px solid #e5e7eb; font-weight:700;">${
              r.level
            }</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${Math.round(
              r.progress * 100
            )}%</td>
          </tr>`
        )
        .join("");

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif; padding: 16px; color: #111827; }
              h1 { font-size: 20px; margin: 0 0 6px; }
              h2 { font-size: 14px; margin: 0 0 12px; color:#6b7280; }
              table { border-collapse: collapse; width: 100%; }
              th { text-align: left; padding: 8px; background:#f9fafb; border:1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <h1>${studentName}</h1>
            <h2>Generated: ${dateStr}</h2>
            <table>
              <thead>
                <tr>
                  <th>Strand</th>
                  <th>Level</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({ html });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `${studentName} - Performance Report`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Saved PDF", `File has been generated at:\n${uri}`);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Download failed", e?.message ?? "Unable to generate PDF");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={["#0a7ea4", "#0a7ea4"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{studentName}</Text>
            <Text style={styles.subtitle}>Performance Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.download} onPress={onDownload}>
            <Text style={styles.downloadText}>📊 Export</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Performance Overview Cards */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>

          <View style={styles.statsContainer}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: performanceLevel.bgColor },
              ]}
            >
              <Text
                style={[styles.statValue, { color: performanceLevel.color }]}
              >
                {overallStats.average}%
              </Text>
              <Text style={styles.statLabel}>Overall Progress</Text>
              <Text
                style={[
                  styles.performanceLevel,
                  { color: performanceLevel.color },
                ]}
              >
                {performanceLevel.level}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: "#10B981" }]}>
                {overallStats.masteredStrands}
              </Text>
              <Text style={styles.statLabel}>Mastered Strands</Text>
              <Text style={styles.statSubtext}>
                out of {overallStats.totalStrands}
              </Text>
            </View>
          </View>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "overview" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("overview")}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "overview" && styles.toggleTextActive,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "detailed" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("detailed")}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "detailed" && styles.toggleTextActive,
              ]}
            >
              Detailed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mastery Key */}
        <View style={styles.masteryKeyContainer}>
          <MasteryKey />
        </View>

        {/* Strands Performance */}
        <View style={styles.strandsSection}>
          <Text style={styles.sectionTitle}>Learning Strands</Text>

          {rows.map((row, index) => (
            <TouchableOpacity
              key={row.strand}
              style={[
                styles.enhancedCard,
                selectedStrand === row.strand && styles.selectedCard,
              ]}
              onPress={() =>
                setSelectedStrand(
                  selectedStrand === row.strand ? null : row.strand
                )
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.strandInfo}>
                  <Text style={styles.cardTitle}>{row.strand}</Text>
                  <Text style={styles.progressText}>
                    {Math.round(row.progress * 100)}% Complete
                  </Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text
                    style={[
                      styles.levelText,
                      { color: COMPETENCE_COLORS[row.level] },
                    ]}
                  >
                    {row.level}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <ProgressBar progress={row.progress} />
              </View>

              {viewMode === "detailed" && (
                <View style={styles.detailedInfo}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Competence Level:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: COMPETENCE_COLORS[row.level] },
                      ]}
                    >
                      {row.level === "BE"
                        ? "Below Expectations"
                        : row.level === "AE"
                        ? "Approaching Expectations"
                        : row.level === "ME"
                        ? "Meeting Expectations"
                        : "Exceeding Expectations"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Progress Status:</Text>
                    <Text style={styles.detailValue}>
                      {row.progress >= 0.8
                        ? "Near Mastery"
                        : row.progress >= 0.6
                        ? "Good Progress"
                        : row.progress >= 0.4
                        ? "Developing"
                        : "Beginning"}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {rows.length === 0 && (
            <View
              style={[
                styles.enhancedCard,
                { alignItems: "center", padding: 32 },
              ]}
            >
              <Text style={styles.noDataText}>
                📚 No performance data available
              </Text>
              <Text style={styles.noDataSubtext}>
                Data will appear here once assessments are completed
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerGradient: {
    paddingTop: 20,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  download: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  downloadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  overviewSection: {
    padding: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
  performanceLevel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  toggleTextActive: {
    color: "#1f2937",
  },
  masteryKeyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  strandsSection: {
    padding: 20,
    paddingTop: 8,
  },
  enhancedCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#667eea",
    shadowOpacity: 0.15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  strandInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  levelBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressContainer: {
    marginBottom: 12,
  },
  detailedInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
