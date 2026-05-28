// components/Map.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issue in Leaflet with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
    locationLink: string;
    readOnly?: boolean;
}

interface MapFocusProps {
  position: [number, number];
}

const MapFocus: React.FC<MapFocusProps> = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 13, { animate: true });
  }, [position, map]);

  return null;
};

const MapResizeFix: React.FC = () => {
    const map = useMap();

    useEffect(() => {
        const syncMapSize = () => {
            map.invalidateSize();
        };

        const animationFrame = window.requestAnimationFrame(syncMapSize);
        const timeout = window.setTimeout(syncMapSize, 150);

        window.addEventListener('resize', syncMapSize);

        return () => {
            window.cancelAnimationFrame(animationFrame);
            window.clearTimeout(timeout);
            window.removeEventListener('resize', syncMapSize);
        };
    }, [map]);

    return null;
};

const defaultCenter: [number, number] = [6.882545, 79.859001];

const Map: React.FC<MapProps> = ({ locationLink, readOnly = false }) => {
    const [position, setPosition] = useState<[number, number]>(defaultCenter);

    useEffect(() => {
        if (locationLink) {
            const match = locationLink.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                setPosition([lat, lng]);
            }
        }
    }, [locationLink]);

    const LocationSetter = () => {
        useMapEvents({
            click(e) {
                if (!readOnly) {
                    setPosition([e.latlng.lat, e.latlng.lng]);
                    // You can also update the locationLink here if needed
                }
            }
        });
        return null;
    };

    return (
        <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {position && <Marker position={position} />}
            {position && <MapFocus position={position} />}
            <MapResizeFix />
            {!readOnly && <LocationSetter />}
        </MapContainer>
    );
};

export default Map;
