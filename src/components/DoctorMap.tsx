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

// Responsive container: fixed height on mobile, full height in parent container on larger screens
const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: "300px", // ensures visible map on small screens
  borderRadius: "12px",
};

const center = { lat: 40.742, lng: -74.006 }; // default center (NYC)

export default function DoctorMap({ doctors }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-[300px] bg-gray-50 text-gray-500 text-sm rounded-xl">
        Loading map...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
        {doctors.map((doc) => (
          <Marker
            key={doc.id}
            position={{ lat: doc.lat, lng: doc.lng }}
            title={doc.name}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
