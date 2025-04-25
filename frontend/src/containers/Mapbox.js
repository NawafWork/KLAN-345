import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = ({ latitude, longitude, zoom = 12, interactive = true }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);

    useEffect(() => {
        if (!map.current && latitude && longitude) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [longitude, latitude],
                zoom: zoom,
                interactive: interactive
            });

            const nav = new mapboxgl.NavigationControl();
            map.current.addControl(nav);

            marker.current = new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .addTo(map.current);
        }

        return () => {
            if (marker.current) {
                marker.current.remove();
                marker.current = null;
            }
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [latitude, longitude, zoom, interactive]);

    return (
        <div 
            ref={mapContainer} 
            style={{ 
                height: '100%', 
                width: '100%',
                minHeight: '200px',
                borderRadius: '4px'
            }} 
        />
    );
};

export default Map;