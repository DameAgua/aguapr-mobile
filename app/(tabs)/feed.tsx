import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { getReporterId } from "../../lib/deviceId";

// Media Outlet Directory
const MEDIA_EMAIL_OPTIONS = [
  { name: "WAPA TV (NotiCentro)", email: "noticentro@wapa.tv", url: "" },
  {
    name: "Telemundo PR (Formulario oficial)",
    email: "",
    url: "https://www.telemundopr.com/envia-tus-comentarios/",
  },
  { name: "TeleOnce (Las Noticias)", email: "lasnoticias@teleonce.com", url: "" },
  { name: "El Nuevo Día (Comunicaciones)", email: "juan.guma@gfrpr.com", url: "" },
  { name: "Primera Hora", email: "historiasph@gfrmedia.com", url: "" },
];

export interface ReportItem {
  id: string | number;
  problem_type: string;
  town?: string;
  pueblo?: string;
  description?: string;
  created_at?: string;
  status?: string;
  reporter_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export default function FeedScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [currentReporterId, setCurrentReporterId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
         const { data, error } = await supabase
        .from("reports")
        .select(
          'id, problem_type, "Pueblo o Municipalidad", description, created_at, status, reporter_id'
        )
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
    getReporterId()
      .then(setCurrentReporterId)
      .catch((error) => console.log("Error loading reporter ID:", error));

    fetchReports();
  }, []);

  useEffect(() => {
    if (currentReporterId) { console.log("ID-DIRECTO:", currentReporterId);
      console.log("AGUAPR CURRENT REPORTER ID:", currentReporterId);
    }
  }, [currentReporterId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const markAsResolved = async (report: ReportItem) => {
    if (!currentReporterId) return;

    Alert.alert(
      "Marcar como RESUELTO",
      "¿Confirmas que el problema de este reporte ya no existe?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, está resuelto",
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc(
                "mark_report_resolved",
                {
                  p_report_id: String(report.id),
                  p_reporter_id: currentReporterId,
                }
              );

              if (error) {
                Alert.alert("Error", error.message);
                return;
              }

              if (!data) {
                Alert.alert(
                  "No se pudo actualizar",
                  "Solo quien creó el reporte puede marcarlo como resuelto."
                );
                return;
              }

              setReports((current) =>
                current.map((item) =>
                  item.id === report.id
                    ? { ...item, status: "RESUELTO" }
                    : item
                )
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message || "No se pudo marcar el reporte como resuelto."
              );
            }
          },
        },
      ]
    );
  };

  const deleteReport = async (report: ReportItem) => {
    if (!currentReporterId) return;

    const createdAt = report.created_at
      ? new Date(report.created_at).getTime()
      : 0;

    const isWithin24Hours =
      createdAt > 0 &&
      Date.now() - createdAt <= 24 * 60 * 60 * 1000;

    if (!isWithin24Hours) {
      Alert.alert(
        "Ya pasó el plazo",
        "Un reporte solo puede borrarse durante las primeras 24 horas."
      );
      return;
    }

    Alert.alert(
      "Borrar reporte",
      "¿Seguro que quieres borrar este reporte? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc(
                "delete_report_within_24h",
                {
                  p_report_id: String(report.id),
                  p_reporter_id: currentReporterId,
                }
              );

              if (error) {
                Alert.alert("Error", error.message);
                return;
              }

              if (!data) {
                Alert.alert(
                  "No se pudo borrar",
                  "El reporte ya pasó las 24 horas o no pertenece a este dispositivo."
                );
                return;
              }

              setReports((current) =>
                current.filter((item) => item.id !== report.id)
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message || "No se pudo borrar el reporte."
              );
            }
          },
        },
      ]
    );
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
    setSelectedReport(reportItem);
    setMediaPickerVisible(true);
  };

  const closeMediaPicker = () => {
    setMediaPickerVisible(false);
    setSelectedReport(null);
  };

  const renderItem = ({ item }: { item: ReportItem }) => {
    const locationName = item.town || item.pueblo || "Ubicación no especificada";
    const canShare = Boolean(
      currentReporterId && item.reporter_id === currentReporterId
    );

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

        {canShare &&
        item.status !== "RESUELTO" &&
        item.created_at &&
        Date.now() - new Date(item.created_at).getTime() <=
          24 * 60 * 60 * 1000 ? (
          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/report",
                params: {
                  editId: String(item.id),
                  editProblem: item.problem_type,
                  editLocation: item.town || item.pueblo || "",
                  editDescription: item.description || "",
                  editLatitude: item.latitude ? String(item.latitude) : "",
                  editLongitude: item.longitude ? String(item.longitude) : "",
                },
              })
            }
          >
            <Text style={styles.editButtonText}>
              ✏️ Corregir el Reporte
            </Text>
          </Pressable>
        ) : null}

        {canShare && item.status !== "RESUELTO" ? (
          <Pressable
            style={styles.resolveButton}
            onPress={() => markAsResolved(item)}
          >
            <Text style={styles.resolveButtonText}>
              ✅ Marcar como RESUELTO
            </Text>
          </Pressable>
        ) : null}

        {canShare &&
        item.created_at &&
        Date.now() - new Date(item.created_at).getTime() <=
          24 * 60 * 60 * 1000 ? (
          <Pressable
            style={styles.deleteButton}
            onPress={() => deleteReport(item)}
          >
            <Text style={styles.deleteButtonText}>
              🗑️ Borrar mi reporte
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          style={[
            styles.shareButton,
            !canShare && styles.shareButtonDisabled,
          ]}
          onPress={() => canShare && handleEmailPress(item)}
          disabled={!canShare}
        >
          <Text
            style={[
              styles.shareButtonText,
              !canShare && styles.shareButtonTextDisabled,
            ]}
          >
            {canShare
              ? "✉️ Enviar a TV / Prensa"
              : "🔒 Solo quien reportó puede enviar"}
          </Text>
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

      <Modal
        visible={mediaPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMediaPicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.mediaModal}>
            <Text style={styles.mediaModalTitle}>
              Enviar reporte a Prensa 📺
            </Text>

            <Text style={styles.mediaModalSubtitle}>
              Selecciona el medio de comunicación:
            </Text>

            {MEDIA_EMAIL_OPTIONS.map((media) => (
              <Pressable
                key={media.email || media.url}
                style={styles.mediaOption}
                onPress={() => {
                  if (!selectedReport) return;

                  const reportToSend = selectedReport;
                  closeMediaPicker();

                  if (media.url) {
                    Linking.openURL(media.url).catch(() => {
                      Alert.alert(
                        "Error",
                        "No se pudo abrir el formulario oficial de Telemundo."
                      );
                    });
                    return;
                  }

                  shareReportViaEmail(
                    reportToSend,
                    media.email,
                    media.name
                  );
                }}
              >
                <Text style={styles.mediaOptionText}>
                  {media.name}
                </Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.cancelOption}
              onPress={closeMediaPicker}
            >
              <Text style={styles.cancelOptionText}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  editButton: {
    backgroundColor: "#E0ECFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  editButtonText: {
    color: "#1D4ED8",
    fontSize: 16,
    fontWeight: "800",
  },
  resolveButton: {
    backgroundColor: "#ECFDF5",
    borderColor: "#16A34A",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
  },
  resolveButtonText: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#DC2626",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 15,
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
  shareButtonDisabled: {
    backgroundColor: "#E2E8F0",
    borderColor: "#CBD5E1",
  },
  shareButtonTextDisabled: {
    color: "#64748B",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  mediaModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  mediaModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 6,
  },
  mediaModalSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  mediaOption: {
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  mediaOptionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D4ED8",
    textAlign: "center",
  },
  cancelOption: {
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelOptionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
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