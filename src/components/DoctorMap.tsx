"use client";
import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface Doctor {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  doctors: Doctor[];
}

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

const center = { lat: 40.742, lng: -74.006 }; // default center (NYC)

export default function DoctorMap({ doctors }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
      {doctors.map((doc) => (
        <Marker key={doc.id} position={{ lat: doc.lat, lng: doc.lng }} title={doc.name} />
      ))}
    </GoogleMap>
  );
}
