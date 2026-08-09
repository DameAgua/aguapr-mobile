import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "./lib/supabase";

export default function ReportScreen() {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [pueblo, setPueblo] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Automatically fetch GPS location and detect the municipality (pueblo)
  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos permiso de ubicación para detectar tu municipio automáticamente."
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      setLatitude(lat);
      setLongitude(lng);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const detectedPueblo =
          place.city ||
          place.subregion ||
          place.district ||
          place.region ||
          "Puerto Rico";

        setPueblo(detectedPueblo);
      }
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      Alert.alert("Error", "No se pudo obtener la ubicación actual.");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Submit report to Supabase
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa un título para el reporte.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reports").insert([
        {
          title: title.trim(),
          description: description.trim(),
          pueblo: pueblo.trim() || "Puerto Rico",
          latitude: latitude,
          longitude: longitude,
        },
      ]);

      if (error) {
        console.error("Error saving report:", error.message);
        Alert.alert("Error", "No se pudo enviar el reporte. Inténtalo de nuevo.");
      } else {
        Alert.alert("¡Éxito!", "Tu reporte ha sido publicado.", [
          {
            text: "Ver Reportes",
            onPress: () => router.push("/feed"),
          },
        ]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>🚰 Reportar Problema de Agua</Text>
        <Text style={styles.headerSubtitle}>
          Informa sobre suspensiones, salideros o baja presión en tu área.
        </Text>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título del Reporte *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Sin servicio de agua hace 24 hrs"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Pueblo / Municipio Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pueblo / Municipio</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. San Juan, Ponce, Mayagüez..."
            placeholderTextColor="#94A3B8"
            value={pueblo}
            onChangeText={setPueblo}
          />
        </View>

        {/* Auto Location Button */}
        <TouchableOpacity
          style={styles.locationButton}
          activeOpacity={0.7}
          onPress={handleGetLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color="#2563EB" />
          ) : (
            <Text style={styles.locationButtonText}>
              📍 Detectar Mi Ubicación Automáticamente
            </Text>
          )}
        </TouchableOpacity>

        {pueblo ? (
          <Text style={styles.detectedText}>
            ✅ Municipio detectado: <Text style={styles.boldText}>{pueblo}</Text>
          </Text>
        ) : null}

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción / Detalles</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe la situación (calle, sector, ref. de lugar)..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          activeOpacity={0.7}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Reporte 🚀</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1D4ED8",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  textArea: {
    height: 110,
  },
  locationButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2563EB",
    marginBottom: 12,
  },
  locationButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
  detectedText: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 16,
  },
  boldText: {
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});