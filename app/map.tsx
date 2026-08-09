import * as MailComposer from "expo-mail-composer";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
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

// Default center coordinates set to Puerto Rico
const INITIAL_REGION = {
  latitude: 18.2208,
  longitude: -66.5901,
  latitudeDelta: 1.2,
  longitudeDelta: 1.2,
};

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching map reports:", error.message);
      } else if (data) {
        // Filter reports that have valid numeric coordinates
        const validReports = data.filter(
          (r) =>
            typeof r.latitude === "number" && typeof r.longitude === "number"
        );
        setReports(validReports);
      }
    } catch (err) {
      console.error("Unexpected map error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Send email to local press directly from map marker
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
    const reportDesc = report.description || "Sin descripción proporcionada.";
    const reportDate = new Date(report.created_at).toLocaleDateString("es-PR");

    const emailSubject = `[AguaPR] Reporte de Interrupción de Agua - ${townName}`;
    const emailBody = `Estimado equipo de redacción y periodistas,\n\nLes escribo para compartir un reporte ciudadano sobre la situación del servicio de agua potable registrado en AguaPR:\n\n📍 Municipio: ${townName}\n💧 Incidencia: ${reportTitle}\n📅 Fecha: ${reportDate}\n📝 Detalles: ${reportDesc}\n\nAtentamente,\nComunidad AguaPR`;

    MailComposer.composeAsync({
      recipients: ["noticias@elnuevodia.com", "sanjuandailystar@gmail.com"],
      subject: emailSubject,
      body: emailBody,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView style={styles.map} initialRegion={INITIAL_REGION}>
        {reports.map((report) => (
          <Marker
            key={report.id.toString()}
            coordinate={{
              latitude: report.latitude!,
              longitude: report.longitude!,
            }}
            pinColor="#2563EB"
          >
            <Callout style={styles.callout} onPress={() => handleShareWithPress(report)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTown}>{report.town || "Puerto Rico"}</Text>
                <Text style={styles.calloutTitle}>{report.title || "Reporte de Agua"}</Text>
                {report.description ? (
                  <Text style={styles.calloutDesc} numberOfLines={2}>
                    {report.description}
                  </Text>
                ) : null}
                <View style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>📰 Compartir con la Prensa</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
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
    color: "#475569",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  callout: {
    width: 220,
  },
  calloutContainer: {
    padding: 6,
  },
  calloutTown: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginVertical: 2,
  },
  calloutDesc: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: "#EEF4FF",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  calloutButtonText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "600",
  },
});