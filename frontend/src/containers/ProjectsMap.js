import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { isValidCoordinates } from '../utils/mapUtils';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/Map.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const ProjectsMap = ({ projects }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);

    // Initialize map
    useEffect(() => {
        if (!map.current && projects?.length > 0) {
            try {
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: [0, 20],
                    zoom: 3
                });

                map.current.on('load', () => {
                    setMapLoaded(true);
                });

                const nav = new mapboxgl.NavigationControl();
                map.current.addControl(nav);
            } catch (err) {
                console.error('Map initialization error:', err);
                setMapError('Failed to initialize map');
            }
        }

        // Cleanup function
        return () => {
            markersRef.current.forEach(marker => {
                if (marker) marker.remove();
            });
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [projects.length]);

    // Handle markers
    useEffect(() => {
        if (map.current && mapLoaded && projects?.length > 0) {
            // Clear existing markers
            markersRef.current.forEach(marker => {
                if (marker) marker.remove();
            });
            markersRef.current = [];

            const bounds = new mapboxgl.LngLatBounds();
            let validLocationsFound = false;

            projects.forEach(project => {
                const lat = parseFloat(project.latitude);
                const lng = parseFloat(project.longitude);

                if (isValidCoordinates(lat, lng)) {
                    validLocationsFound = true;
                    bounds.extend([lng, lat]);

                    // Create marker element
                    const el = document.createElement('div');
                    el.className = 'project-marker';
                    
                    // Create and add marker
                    const marker = new mapboxgl.Marker({
                        element: el,
                        anchor: 'center'
                    })
                    .setLngLat([lng, lat])
                    .setPopup(
                        new mapboxgl.Popup({
                            offset: 25,
                            closeButton: false,
                            closeOnClick: false
                        })
                        .setHTML(`
                            <div class="map-popup">
                                <h6>${project.title}</h6>
                                <p>${project.location || 'Location not specified'}</p>
                            </div>
                        `)
                    )
                    .addTo(map.current);

                    // Show popup on hover
                    el.addEventListener('mouseenter', () => marker.togglePopup());
                    el.addEventListener('mouseleave', () => marker.togglePopup());

                    markersRef.current.push(marker);
                }
            });

            if (validLocationsFound && !bounds.isEmpty()) {
                map.current.fitBounds(bounds, {
                    padding: 50,
                    maxZoom: 12
                });
            }
        }
    }, [projects, mapLoaded]);

    if (mapError) {
        return <div className="alert alert-danger">{mapError}</div>;
    }

    return (
        <div 
            ref={mapContainer} 
            style={{ 
                height: '100%', 
                width: '100%',
                borderRadius: '4px'
            }} 
        />
    );
};

export default ProjectsMap;