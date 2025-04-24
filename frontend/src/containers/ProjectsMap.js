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
                    style: 'mapbox://styles/mapbox/streets-v12', // Changed to light style
                    center: [0, 20],
                    zoom: 2
                });

                map.current.on('load', () => setMapLoaded(true));

                // Add navigation controls
                const nav = new mapboxgl.NavigationControl();
                map.current.addControl(nav);
            } catch (err) {
                console.error('Map initialization error:', err);
                setMapError('Failed to initialize map');
            }
        }

        return () => {
            markersRef.current.forEach(marker => marker?.remove());
            map.current?.remove();
            map.current = null;
        };
    }, [projects.length]);

    // Handle markers
    useEffect(() => {
        if (map.current && mapLoaded && projects?.length > 0) {
            // Clear existing markers
            markersRef.current.forEach(marker => marker?.remove());
            markersRef.current = [];

            const bounds = new mapboxgl.LngLatBounds();
            let validLocationsFound = false;

            projects.forEach(project => {
                const lat = parseFloat(project.latitude);
                const lng = parseFloat(project.longitude);

                if (isValidCoordinates(lat, lng)) {
                    validLocationsFound = true;
                    bounds.extend([lng, lat]);

                    // Create simple marker like in project detail
                    const marker = new mapboxgl.Marker()
                        .setLngLat([lng, lat])
                        .setPopup(
                            new mapboxgl.Popup({
                                offset: 25,
                                closeButton: true,
                                closeOnClick: true,
                                className: 'project-popup'
                            })
                            .setHTML(`
                                <div class="map-popup">
                                    <h6>${project.title}</h6>
                                    <p class="location">${project.location}</p>
                                    <div class="progress mb-2">
                                        <div 
                                            class="progress-bar" 
                                            role="progressbar" 
                                            style="width: ${Math.min((project.amount_raised / project.goal_amount) * 100, 100)}%"
                                        >
                                            ${Math.round((project.amount_raised / project.goal_amount) * 100)}%
                                        </div>
                                    </div>
                                    <p class="mt-2">
                                        <strong>$${project.amount_raised.toLocaleString()}</strong> 
                                        <span class="text-muted">of $${project.goal_amount.toLocaleString()}</span>
                                    </p>
                                    <a href="/projects/${project.id}" class="btn btn-info btn-sm">View Details</a>
                                </div>
                            `)
                        )
                        .addTo(map.current);

                    markersRef.current.push(marker);
                }    
            });       

            if (validLocationsFound && !bounds.isEmpty()) {
                map.current.fitBounds(bounds, {
                    padding: { top: 50, bottom: 50, left: 50, right: 50 },
                    maxZoom: 12
                });
            }
        }
    }, [projects, mapLoaded]);

    if (mapError) {
        return <div className="alert alert-danger">{mapError}</div>;
    }

    return (
        <div className="map-container card">
            <div className="card-body p-0">
                <div 
                    ref={mapContainer} 
                    className="map-wrapper"
                    style={{ 
                        height: '600px',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}
                />
            </div>
        </div>
    );
};

export default ProjectsMap;