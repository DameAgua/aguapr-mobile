import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function PrivacyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Política de Privacidad de AguaPR</Text>

        <Text style={styles.updated}>
          Última actualización: 14 de agosto de 2026
        </Text>

        <Text style={styles.heading}>1. Información que recopilamos</Text>
        <Text style={styles.text}>
          AguaPR permite a los usuarios reportar problemas relacionados con el
          servicio de agua en Puerto Rico.
        </Text>

        <Text style={styles.text}>
          Cuando un usuario crea un reporte, AguaPR puede recopilar el tipo de
          problema, la descripción proporcionada por el usuario, el municipio
          o ubicación indicada y, cuando el usuario utiliza la función de
          ubicación, las coordenadas geográficas asociadas con el reporte.
        </Text>

        <Text style={styles.heading}>2. Uso de la ubicación</Text>
        <Text style={styles.text}>
          AguaPR solicita permiso para acceder a la ubicación del dispositivo
          mientras se utiliza la función para identificar el municipio. La
          ubicación se utiliza para identificar la zona correspondiente y para
          permitir que los reportes puedan aparecer en el mapa.
        </Text>

        <Text style={styles.text}>
          El usuario también puede proporcionar manualmente un municipio o
          ubicación sin utilizar la función de ubicación del dispositivo.
        </Text>

        <Text style={styles.heading}>3. Cómo utilizamos la información</Text>
        <Text style={styles.text}>
          La información de los reportes se utiliza para mostrar y organizar
          reportes de problemas de agua, identificar áreas afectadas y
          facilitar información comunitaria sobre posibles problemas del
          servicio de agua.
        </Text>

        <Text style={styles.heading}>4. Almacenamiento</Text>
        <Text style={styles.text}>
          Los reportes se almacenan utilizando servicios de infraestructura en
          la nube proporcionados por Supabase.
        </Text>

        <Text style={styles.heading}>5. Compartir reportes</Text>
        <Text style={styles.text}>
          AguaPR permite al usuario seleccionar medios de comunicación y
          preparar un reporte para compartirlo mediante la aplicación de correo
          electrónico del dispositivo. Esta acción es iniciada por el usuario.
        </Text>

        <Text style={styles.heading}>6. Información que no solicitamos</Text>
        <Text style={styles.text}>
          AguaPR no solicita como requisito para crear un reporte el nombre,
          número de teléfono, dirección de correo electrónico o lista de
          contactos del usuario.
        </Text>

        <Text style={styles.heading}>7. Seguridad</Text>
        <Text style={styles.text}>
          Tomamos medidas razonables para proteger la información almacenada y
          limitar el acceso no autorizado.
        </Text>

        <Text style={styles.heading}>8. Eliminación de información</Text>
        <Text style={styles.text}>
          Si deseas solicitar la eliminación de información asociada con un
          reporte, puedes comunicarte con AguaPR utilizando la información
          disponible en nuestra página de contacto.
        </Text>

        <Text style={styles.heading}>9. Cambios a esta política</Text>
        <Text style={styles.text}>
          Podemos actualizar esta Política de Privacidad cuando sea necesario
          para reflejar cambios en AguaPR, sus servicios o los requisitos
          legales aplicables. La fecha de actualización aparecerá al comienzo
          de esta página.
        </Text>

        <Text style={styles.heading}>10. Contacto</Text>
        <Text style={styles.text}>
          Para preguntas sobre privacidad, solicitudes de eliminación de
          información o preguntas sobre AguaPR, visita nuestra página de
          contacto.
        </Text>

        <Text
          style={styles.link}
          onPress={() => router.push("/contacto")}
        >
          Contactar a AguaPR
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
    marginBottom: 8,
  },
  updated: {
    color: "#6B7280",
    marginBottom: 24,
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
    marginBottom: 12,
  },
  link: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#1D4ED8",
    textDecorationLine: "underline",
  },
});
