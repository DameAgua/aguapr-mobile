import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function ReportScreen() {
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [problem, setProblem] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const problems = [
    "🚱 No hay agua",
    "💧 Baja presión",
    "💦 Fuga de agua",
    "🟤 Agua sucia o descolorida",
    "🚰 Tubería rota",
    "⚠️ Otro problema",
  ];

  const getLocation = async () => {
    try {
      setLoadingLocation(true);

      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        Alert.alert(
          "Ubicación apagada",
          "La ubicación está apagada. Activa la ubicación/GPS y vuelve a intentarlo."
        );
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "AguaPR necesita permiso para identificar tu municipio."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      setLatitude(lat);
      setLongitude(lon);

      const addresses = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });

      if (addresses.length === 0) {
        setLocation("");
        Alert.alert(
          "Aviso",
          "Obtuvimos tu ubicación, pero no pudimos identificar tu municipio. Puedes escribirlo manualmente."
        );
        return;
      }

      const address = addresses[0];

      const municipio =
        address.city ||
        address.subregion ||
        address.district ||
        address.name ||
        "";

      const region = address.region || "Puerto Rico";

      if (municipio) {
        setLocation(`📍 ${municipio}, ${region}`);

        Alert.alert(
          "¡Ubicación encontrada!",
          `📍 ${municipio}, ${region}`
        );
      } else {
        setLocation("");
        Alert.alert(
          "Aviso",
          "No pudimos identificar el municipio. Puedes escribirlo manualmente."
        );
      }
    } catch (error) {
      console.log("ERROR DE UBICACIÓN:", error);

      Alert.alert(
        "Error de ubicación",
        "No pudimos identificar tu municipio. Asegúrate de tener la ubicación/GPS encendida e inténtalo nuevamente."
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const submitReport = async () => {
    if (!problem) {
      Alert.alert("Campo requerido", "Selecciona el problema del agua.");
      return;
    }

    if (!location) {
      Alert.alert(
        "Campo requerido",
        "Obtén tu municipio o escribe una ubicación."
      );
      return;
    }

    try {
      setIsSubmitting(true);

 const { data, error } = await supabase.from("reports").insert([
  {
    problem_type: problem,
    "Pueblo o Municipalidad": location, // <--- Exact column name in quotes
    description: description,
    latitude: latitude,
    longitude: longitude,
    status: "Pendiente",
  },
]);

      if (error) {
        Alert.alert(
          "Error de Supabase",
          `Mensaje: ${error.message}\nCódigo: ${error.code}\nDetalles: ${error.details || 'Ninguno'}`
        );
        return;
      }

      Alert.alert(
        "¡Reporte guardado en la nube! 💧",
        `Tu reporte ha sido enviado con éxito:\n\nProblema: ${problem}\nUbicación: ${location}`,
        [
          {
            text: "Inicio",
            onPress: () => {
              setProblem("");
              setLocation("");
              setDescription("");
              setLatitude(null);
              setLongitude(null);
              router.replace("/");
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "Error de JavaScript / Conexión",
        err?.message || JSON.stringify(err)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        <Text style={styles.icon}>🚰</Text>

        <Text style={styles.title}>Reportar problema</Text>

        <Text style={styles.subtitle}>
          Ayúdanos a identificar problemas de agua en tu comunidad.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            ¿Qué problema estás reportando?
          </Text>

          <Pressable
            style={styles.dropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.dropdownText}>
              {problem || "Selecciona un problema"}
            </Text>

            <Text style={styles.arrow}>{dropdownOpen ? "▲" : "▼"}</Text>
          </Pressable>

          {dropdownOpen && (
            <View style={styles.options}>
              {problems.map((item) => (
                <Pressable
                  key={item}
                  style={styles.option}
                  onPress={() => {
                    setProblem(item);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>Municipio</Text>

          <Pressable
            style={styles.locationButton}
            onPress={getLocation}
            disabled={loadingLocation}
          >
            <Text style={styles.locationButtonText}>
              {loadingLocation
                ? "🏘️ Identificando municipio..."
                : "📍 Obtener mi municipio"}
            </Text>
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="O escribe un municipio o dirección"
            placeholderTextColor="#94A3B8"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Descripción</Text>

          <TextInput
            style={styles.description}
            placeholder="Describe el problema..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={submitReport}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                🚰 Enviar reporte
              </Text>
            )}
          </Pressable>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },

  container: {
    padding: 24,
    paddingBottom: 60,
    alignItems: "center",
  },

  icon: {
    fontSize: 48,
    marginTop: 20,
    marginBottom: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1D4ED8",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 17,
    lineHeight: 25,
    color: "#475569",
    textAlign: "center",
    marginBottom: 24,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },

  label: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
    marginTop: 8,
  },

  dropdown: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: "#2563EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  dropdownText: {
    fontSize: 16,
    color: "#334155",
    flex: 1,
  },

  arrow: {
    fontSize: 16,
    color: "#2563EB",
  },

  options: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    overflow: "hidden",
  },

  option: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  optionText: {
    fontSize: 16,
    color: "#1E293B",
  },

  locationButton: {
    backgroundColor: "#E0ECFF",
    borderWidth: 2,
    borderColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },

  locationButtonText: {
    color: "#1D4ED8",
    fontSize: 17,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
  },

  description: {
    height: 120,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
  },

  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 24,
  },

  submitButtonDisabled: {
    backgroundColor: "#93C5FD",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  backButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },

  backButtonText: {
    color: "#1D4ED8",
    fontSize: 17,
    fontWeight: "700",
  },
});