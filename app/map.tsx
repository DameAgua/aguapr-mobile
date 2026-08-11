import * as MailComposer from "expo-mail-composer";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "./lib/supabase";

interface Report {
  id: string | number;
  created_at: string;
  title?: string;
  description?: string;
  town?: string;
  latitude?: number;
  longitude?: number;
}

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching reports:", error.message);
        } else if (data) {
          setReports(data);
        }
      } catch (err) {
        console.error("Unexpected map error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleShareWithPress = async (report: Report) => {
    const isAvailable = await MailComposer.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert(
        "Correo no configurado",
        "Tu dispositivo no tiene una aplicación de correo disponible."
      );
      return;
    }

    const townName = report.town || "Puerto Rico";
    const reportTitle = report.title || "Problema de Agua";
    const reportDesc =
      report.description || "Sin descripción proporcionada.";
    const reportDate = new Date(report.created_at).toLocaleDateString("es-PR");

    await MailComposer.composeAsync({
      recipients: [
        "noticias@elnuevodia.com",
        "sanjuandailystar@gmail.com",
      ],
      subject: `[AguaPR] Reporte de Interrupción de Agua - ${townName}`,
      body: `Estimado equipo de redacción y periodistas,

Les escribo para compartir un reporte ciudadano sobre la situación del servicio de agua potable registrado en AguaPR:

📍 Municipio: ${townName}
💧 Incidencia: ${reportTitle}
📅 Fecha: ${reportDate}
📝 Detalles: ${reportDesc}

Atentamente,
Comunidad AguaPR`,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🗺️ Reportes de Agua</Text>
        <Text style={styles.subtitle}>
          Reportes ciudadanos de interrupciones y problemas de agua en Puerto
          Rico.
        </Text>

        {reports.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No hay reportes disponibles.
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id.toString()} style={styles.card}>
              <Text style={styles.town}>
                📍 {report.town || "Puerto Rico"}
              </Text>

              <Text style={styles.reportTitle}>
                {report.title || "Reporte de Agua"}
              </Text>

              {report.description ? (
                <Text style={styles.description}>
                  {report.description}
                </Text>
              ) : null}

              <Text style={styles.date}>
                {new Date(report.created_at).toLocaleDateString("es-PR")}
              </Text>

              <Pressable
                style={styles.button}
                onPress={() => handleShareWithPress(report)}
              >
                <Text style={styles.buttonText}>
                  📰 Compartir con la Prensa
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
  },
  loadingText: {
    marginTop: 10,
  },
  content: {
    padding: 20,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  town: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  description: {
    marginTop: 6,
    color: "#475569",
  },
  date: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B",
  },
  button: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
  },
  buttonText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  empty: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
  },
});
