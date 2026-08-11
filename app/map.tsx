"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapaInteractivo() {
  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden">
      <MapContainer
        center={[18.2208, -66.5901]}
        zoom={9}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[18.4655, -66.1057]} icon={icon}>
          <Popup>
            <strong>San Juan</strong>
            <br />
            Reporte de ejemplo
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
