import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Leaflet default icon fix for Vite/React
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map par click karke marker move karne ke liye helper component
function MapEvents({ setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
}

const MapSelector = ({ onLocationSelect, onClose }) => {
  // Default position: Delhi (Agar GPS fail ho jaye toh yahan se shuru hoga)
  const [position, setPosition] = useState({ lat: 28.6139, lng: 77.2090 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Browser Geolocation API to detect current GPS location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (error) => {
          console.warn("GPS Access Denied or Error:", error.message);
          setLoading(false); // Fallback to default (Delhi)
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Select Delivery Location</h3>
          <p className="text-[10px] text-stone-500">Drag pin or click to adjust</p>
        </div>
        <button 
          onClick={onClose} 
          type="button"
          className="h-7 w-7 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition"
        >
          ✕
        </button>
      </div>
      
      <div className="h-64 w-full rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <p className="text-xs text-stone-500 font-medium">Locating you...</p>
            </div>
          </div>
        ) : (
          <MapContainer 
            center={position} 
            zoom={15} 
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker 
              position={position} 
              draggable={true} 
              eventHandlers={{
                dragend: (e) => setPosition(e.target.getLatLng())
              }} 
            />
            <MapEvents setPosition={setPosition} />
          </MapContainer>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button 
          type="button"
          onClick={() => onLocationSelect(position)}
          className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition shadow-sm active:scale-[0.98]"
        >
          Confirm Location
        </button>
      </div>
    </div>
  )
}

export default MapSelector