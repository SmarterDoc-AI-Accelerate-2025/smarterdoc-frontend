"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
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
  rating?: number;
  reviews?: number;
  img?: string;
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
        {doctors.map((doc) => {
          const isActive = activeDoctorId === doc.id;

          return (
            <Marker
              key={doc.id}
              position={{ lat: doc.lat, lng: doc.lng }}
              title={doc.name}
              onClick={() => handleMarkerClick(doc.id)}
              icon={
                isActive
                  ? {
                      url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
                      scaledSize: new google.maps.Size(45, 45),
                      anchor: new google.maps.Point(22, 45),
                    }
                  : {
                      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      scaledSize: new google.maps.Size(35, 35),
                      anchor: new google.maps.Point(17, 35),
                    }
              }
              zIndex={isActive ? 9999 : 1}
            >
              {selectedDoctorId === doc.id && (
                <InfoWindow
                  onCloseClick={() => setSelectedDoctorId(null)}
                  position={{ lat: doc.lat, lng: doc.lng }}
                >
                  <div
                    className="p-2 sm:p-3 w-[250px] sm:w-[250px]"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {/* Doctor image */}
                    <div className="flex items-center mb-2 space-x-2">
                      <div className="h-25 w-25 overflow-hidden border border-gray-200">
                        <Image
                          src={doc.img || "/doctor.png"}
                          alt={doc.name}
                          width={20}
                          height={20}
                          className="object-cover w-full h-full"
                          priority={false}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm leading-tight"
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {doc.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: "var(--text-secondary)",
                            fontWeight: 400,
                          }}
                        >
                          {doc.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center text-xs mb-1">
                      <i className="ri-star-fill text-yellow-500 mr-1 text-sm"></i>
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontWeight: 500,
                        }}
                      >
                        {doc.rating ?? "N/A"}
                      </span>
                      <span
                        className="ml-1"
                        style={{
                          color: "var(--text-secondary)",
                          fontWeight: 400,
                        }}
                      >
                        ({doc.reviews ?? 0} reviews)
                      </span>
                    </div>

                    {/* Address */}
                    <p
                      className="text-xs mt-1"
                      style={{
                        color: "var(--text-secondary)",
                        fontWeight: 400,
                      }}
                    >
                      <i className="ri-map-pin-2-line text-[#5F72BE] mr-1 text-sm"></i>
                      {doc.address}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
    </div>
  );
}
