import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const handleTestPress = () => {
  router.push("/(tabs)/feed");
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.icon}>🚰</Text>

        <Text style={styles.title}>AguaPR</Text>

        <Text style={styles.subtitle}>
          Reporta problemas de agua{"\n"}
          en tu comunidad.
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/report")}
          >
            <Text style={styles.primaryButtonText}>
              🚰 Reportar problema de agua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={() => router.push("/map")}
          >
            <Text style={styles.secondaryButtonText}>
              🗺️ Ver mapa de reportes
            </Text>
          </TouchableOpacity>

          {/* --- Feed / Activity Button --- */}
          <TouchableOpacity
            style={styles.infoCard}
            activeOpacity={0.7}
            onPress={handleTestPress}
          >
            <View style={styles.infoCardHeader} pointerEvents="none">
              <Text style={styles.infoTitle}>Estado de reportes</Text>
              <Text style={styles.infoArrow}>→</Text>
            </View>

            <Text style={styles.infoText} pointerEvents="none">
              🟢 Ver actividad y reportes recientes cerca de ti.
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Ayudemos a nuestra comunidad 💧
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: "center",
  },
  icon: {
    fontSize: 52,
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1D4ED8",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 21,
    lineHeight: 30,
    color: "#475569",
    textAlign: "center",
    marginBottom: 32,
  },
  buttons: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  secondaryButtonText: {
    color: "#1D4ED8",
    fontSize: 18,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    borderColor: "#2563EB",
    elevation: 3,
    zIndex: 10,
  },
  infoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  infoArrow: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2563EB",
  },
  infoText: {
    fontSize: 16,
    color: "#475569",
  },
  footer: {
    marginTop: 32,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },
});