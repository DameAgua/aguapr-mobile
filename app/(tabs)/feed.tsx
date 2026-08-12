import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

// Media Outlet Directory
const MEDIA_EMAIL_OPTIONS = [
  { name: "WAPA TV (NotiCentro)", email: "noticentro@wapa.tv" },
  { name: "Telemundo PR (Telenoticias)", email: "telenoticias@telemundopr.com" },
  { name: "TeleOnce (Las Noticias)", email: "lasnoticias@teleonce.com" },
  { name: "El Nuevo Día / Primera Hora", email: "noticias@gfrmedia.com" },
  { name: "San Juan Star", email: "newsdesk@sanjuanstar.com" },
];

export interface ReportItem {
  id: string | number;
  problem_type: string;
  town?: string;
  pueblo?: string;
  description?: string;
  created_at?: string;
  status?: string;
}

export default function FeedScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        Alert.alert("Error de Supabase", error.message);
      } else if (data) {
        setReports(data as ReportItem[]);
      }
    } catch (err: any) {
      console.log("Error fetching feed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

const shareReportViaEmail = async (
  report: ReportItem,
  targetEmail: string,
  targetName: string
) => {
  const locationText = report.town || report.pueblo || "Puerto Rico";

  const subject = `🚨 Alerta de AguaPR: ${report.problem_type} en ${locationText}`;

  const dateFormatted = report.created_at
    ? new Date(report.created_at).toLocaleString("es-PR")
    : new Date().toLocaleString("es-PR");

  const body = `Estimado equipo de noticias,

Le escribo para reportar una situación crítica con el servicio de agua potable registrada a través de la aplicación AguaPR.

📍 Municipio / Ubicación: ${locationText}
⚠️ Problema: ${report.problem_type}
📝 Detalles: ${report.description || "Sin descripción adicional."}
📅 Fecha del reporte: ${dateFormatted}

Agradecemos su atención para darle visibilidad a esta problemática que afecta a nuestra comunidad.

Atentamente,
Comunidad de AguaPR`;

  const mailtoUrl =
    `mailto:${targetEmail}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  try {
    const canOpen = await Linking.canOpenURL(mailtoUrl);

    if (!canOpen) {
      Alert.alert(
        "Correo no disponible",
        "No se encontró una aplicación de correo configurada en tu dispositivo."
      );
      return;
    }

    await Linking.openURL(mailtoUrl);
  } catch (error) {
    console.log("Error opening email:", error);

    Alert.alert(
      "Error",
      "No se pudo abrir la aplicación de correo."
    );
  }
};

  const handleEmailPress = (reportItem: ReportItem) => {
    Alert.alert(
      "Enviar reporte a Prensa 📺",
      "Selecciona el medio de comunicación al que deseas enviar esta alerta:",
      [
        ...MEDIA_EMAIL_OPTIONS.map((media) => ({
          text: media.name,
          onPress: () =>
            shareReportViaEmail(reportItem, media.email, media.name),
        })),
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ReportItem }) => {
    const locationName = item.town || item.pueblo || "Ubicación no especificada";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.problemText}>{item.problem_type}</Text>
          <Text style={styles.statusBadge}>{item.status || "Pendiente"}</Text>
        </View>

        <Text style={styles.locationText}>📍 {locationName}</Text>

        {item.description ? (
          <Text style={styles.descriptionText}>{item.description}</Text>
        ) : null}

        {item.created_at ? (
          <Text style={styles.dateText}>
            ⏱️ {new Date(item.created_at).toLocaleString("es-PR")}
          </Text>
        ) : null}

        <Pressable
          style={styles.shareButton}
          onPress={() => handleEmailPress(item)}
        >
          <Text style={styles.shareButtonText}>✉️ Enviar a TV / Prensa</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed de Alertas 💧</Text>
        <Text style={styles.subtitle}>
          Reportes de agua registrados en tiempo real por la comunidad.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No hay reportes registrados aún.
            </Text>
          }
        />
      )}

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver al Inicio</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    marginTop: 4,
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  problemText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 8,
  },
  shareButton: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 40,
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  backButtonText: {
    color: "#1D4ED8",
    fontSize: 16,
    fontWeight: "700",
  },
});