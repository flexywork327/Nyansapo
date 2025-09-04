import MasteryKey, { COMPETENCE_COLORS } from "@/components/MasteryKey";
import { ProgressBar } from "@/components/ProgressBar";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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
      <View style={styles.header}>
        <Text style={styles.title}>{studentName}</Text>
        <Pressable style={styles.download} onPress={onDownload}>
          <Text style={styles.downloadText}>Download</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <MasteryKey />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
        {rows.map((row) => (
          <View key={row.strand} style={styles.card}>
            <View style={styles.rowHeader}>
              <Text style={styles.cardTitle}>{row.strand}</Text>
              <Text
                style={[styles.level, { color: COMPETENCE_COLORS[row.level] }]}
              >
                {row.level}
              </Text>
            </View>
            <ProgressBar progress={row.progress} />
          </View>
        ))}
        {rows.length === 0 && (
          <View style={[styles.card, { alignItems: "center" }]}>
            <Text>No data found for this student.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "800" },
  download: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  downloadText: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6E8EB",
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  level: { fontSize: 14, fontWeight: "800" },
});
