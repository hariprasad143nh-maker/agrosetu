"use client";

import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md flex items-center justify-center text-muted-foreground">Loading Map...</div>
});

export default function LocationPicker({ 
  lat, 
  lng, 
  onChange 
}: { 
  lat: number; 
  lng: number; 
  onChange: (lat: number, lng: number) => void;
}) {
  return <LocationPickerMap lat={lat} lng={lng} onChange={onChange} />;
}
