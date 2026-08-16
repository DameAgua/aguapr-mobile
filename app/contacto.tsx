import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ContactScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Contacto y Soporte — AguaPR</Text>

        <Text style={styles.intro}>
          Estamos aquí para ayudarte con preguntas, comentarios o problemas
          relacionados con AguaPR.
        </Text>

        <Text style={styles.heading}>Soporte de la aplicación</Text>
        <Text style={styles.text}>
          Si encuentras un problema al utilizar AguaPR, puedes comunicarte con
          nuestro equipo de soporte.
        </Text>

        <Text style={styles.heading}>
          Privacidad y eliminación de información
        </Text>
        <Text style={styles.text}>
          Para preguntas relacionadas con privacidad o para solicitar la
          eliminación de información asociada con un reporte, comunícate con
          nosotros.
        </Text>

        <Text style={styles.heading}>Correo electrónico</Text>
        <Text style={styles.text}>casanueva73@me.com</Text>

        <Text
          style={styles.link}
          onPress={() => router.push("/privacy")}
        >
          Ver Política de Privacidad
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#EEF4FF",
    flexGrow: 1,
  },
  card: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 16,
  },
  intro: {
    fontSize: 16,
    lineHeight: 25,
    color: "#374151",
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 25,
    color: "#374151",
  },
  link: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: "600",
    color: "#1D4ED8",
    textDecorationLine: "underline",
  },
});
