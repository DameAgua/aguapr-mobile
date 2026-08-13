import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
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

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
  .from("reports")
  .select(
    'id, problem_type, pueblo:"Pueblo o Municipalidad", description, latitude, longitude, created_at, status'
  )
  .order("created_at", { ascending: false });
        if (error) {
          console.error("Error fetching reports:", error.message);
        } else if (data) {
          setReports(data);
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
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Cargando mapa...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 18.2208,
          longitude: -66.5901,
          latitudeDelta: 3.2,
          longitudeDelta: 3.2,
        }}
      >
        {reports
          .filter(
            (report) =>
              typeof report.latitude === "number" &&
              typeof report.longitude === "number"
          )
          .map((report) => (
            <Marker
              key={report.id.toString()}
              coordinate={{
                latitude: report.latitude!,
                longitude: report.longitude!,
              }}
              title={report.title || "Reporte de agua"}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>
                    {report.title || "Reporte de agua"}
                  </Text>

                  <Text style={styles.calloutTown}>
                    📍 {report.town || "Puerto Rico"}
                  </Text>

                  {report.description ? (
                    <Text style={styles.calloutDescription}>
                      {report.description}
                    </Text>
                  ) : null}
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🗺️ Reportes de AguaPR
        </Text>

        <Text style={styles.headerSubtitle}>
          {reports.length === 0
            ? "No hay reportes todavía"
            : `${reports.length} reporte${
                reports.length === 1 ? "" : "s"
              }`}
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
    width: 220,
    padding: 8,
  },

  calloutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 5,
  },

  calloutTown: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 5,
  },

  calloutDescription: {
    fontSize: 13,
    color: "#475569",
  },
});