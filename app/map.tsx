import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { supabase } from "../lib/supabase";

interface Report {
  id: string | number;
  created_at: string;
  problem_type?: string;
  description?: string;
  town?: string;
  latitude: number;
  longitude: number;
  status?: string;
}

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select(
            'id, problem_type, town:"Pueblo o Municipalidad", description, latitude, longitude, created_at, status'
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching reports:", error.message);
        } else if (data) {
          // Sanitize coordinates to valid numbers
          const sanitizedReports: Report[] = data
            .map((item: any) => ({
              ...item,
              latitude: Number(item.latitude),
              longitude: Number(item.longitude),
            }))
            .filter(
              (item: Report) =>
                !isNaN(item.latitude) &&
                !isNaN(item.longitude) &&
                item.latitude !== 0 &&
                item.longitude !== 0
            );

          setReports(sanitizedReports);
        }
      } catch (error) {
        console.error("Unexpected map error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 18.2208,
          longitude: -66.5901,
          latitudeDelta: 1.2,
          longitudeDelta: 1.2,
        }}
      >
        {reports.map((report) => {
          const reportTitle = report.problem_type || "Reporte de agua";
          const reportTown = report.town || "Puerto Rico";

          return (
            <Marker
              key={report.id.toString()}
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
              title={reportTitle}
              pinColor="#DC2626"
              tracksViewChanges={false}
              zIndex={10}
            >
              <Callout style={styles.callout}>
                <View>
                  <Text style={styles.calloutTitle}>{reportTitle}</Text>
                  <Text style={styles.calloutTown}>📍 {reportTown}</Text>
                  {report.description ? (
                    <Text style={styles.calloutDescription}>
                      {report.description}
                    </Text>
                  ) : null}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Reportes de AguaPR</Text>
        <Text style={styles.headerSubtitle}>
          {reports.length === 0
            ? "No hay reportes todavía"
            : `${reports.length} reporte${reports.length === 1 ? "" : "s"}`}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#475569",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1D4ED8",
    textAlign: "center",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  callout: {
    width: 200,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  calloutTown: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#475569",
  },
});