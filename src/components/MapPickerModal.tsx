"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

// Dynamically import to avoid SSR Leaflet issues
const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
})

interface MapPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationSelect: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
}

export default function MapPickerModal({ open, onOpenChange, onLocationSelect, initialLat, initialLng }: MapPickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>
            Click anywhere on the map to drop a pin.
          </DialogDescription>
        </DialogHeader>
        
        {open && (
          <MapPicker 
            initialLat={initialLat}
            initialLng={initialLng}
            onLocationSelect={(lat, lng) => {
              onLocationSelect(lat, lng)
              onOpenChange(false)
            }} 
            onClose={() => onOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
