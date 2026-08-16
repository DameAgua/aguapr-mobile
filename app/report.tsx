import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";

export default function MapScreen() {
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
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Reportes de AguaPR</Text>
        <Text style={styles.headerSubtitle}>
          Mapa de reportes
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

  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
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
});