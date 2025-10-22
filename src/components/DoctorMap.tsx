"use client";
import React, { useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

interface Doctor {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  specialty?: string;
}

interface Props {
  doctors: Doctor[];
  activeDoctorId?: number | null;
  onDoctorSelect?: (id: number) => void;
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: "300px",
  borderRadius: "12px",
};

const defaultCenter = { lat: 40.742, lng: -74.006 };

export default function DoctorMap({
  doctors,
  activeDoctorId,
  onDoctorSelect,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  const handleMarkerClick = useCallback(
    (id: number) => {
      setSelectedDoctorId(id);
      if (onDoctorSelect) onDoctorSelect(id);
    },
    [onDoctorSelect]
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-[300px] bg-gray-50 text-gray-500 text-sm rounded-xl">
        Loading map...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={
          activeDoctorId
            ? {
                lat:
                  doctors.find((d) => d.id === activeDoctorId)?.lat ??
                  defaultCenter.lat,
                lng:
                  doctors.find((d) => d.id === activeDoctorId)?.lng ??
                  defaultCenter.lng,
              }
            : defaultCenter
        }
        zoom={11}
      >
        {doctors.map((doc) => (
          <Marker
            key={doc.id}
            position={{ lat: doc.lat, lng: doc.lng }}
            title={doc.name}
            onClick={() => handleMarkerClick(doc.id)}
            icon={
              activeDoctorId === doc.id
                ? {
                    url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
                    scaledSize: new google.maps.Size(40, 40),
                  }
                : undefined
            }
          >
            {selectedDoctorId === doc.id && (
              <InfoWindow onCloseClick={() => setSelectedDoctorId(null)}>
                <div className="text-sm">
                  <p className="font-semibold text-[#433C50]">{doc.name}</p>
                  <p className="text-gray-500 text-xs">{doc.specialty}</p>
                  <p className="text-gray-400 text-xs">{doc.address}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
}
