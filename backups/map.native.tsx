import { StyleSheet, Text, View } from "react-native";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Mapa de reportes</Text>
      <Text style={styles.text}>
        Aquí aparecerá el mapa de reportes de AguaPR.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
  },
});