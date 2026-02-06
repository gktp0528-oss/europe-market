import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Search } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px'
};

const defaultCenter = {
    lat: 48.8566, // Paris by default
    lng: 2.3522
};

const libraries = ['places'];

const LocationPicker = ({ onLocationSelect }) => {
    const [map, setMap] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '', // Need to add to .env
        libraries
    });

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const handleMapClick = (e) => {
        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setMarkerPosition(newPos);
        // Reverse geocoding could go here to get address
        onLocationSelect({
            ...newPos,
            address: `위도: ${newPos.lat.toFixed(4)}, 경도: ${newPos.lng.toFixed(4)}` // Placeholder address
        });
    };

    // Placeholder for search (would use PlacesService in real implementation)
    const handleSearch = () => {
        if (!map || !searchQuery) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                map.setCenter(location);
                const newPos = { lat: location.lat(), lng: location.lng() };
                setMarkerPosition(newPos);
                onLocationSelect({
                    ...newPos,
                    address: results[0].formatted_address
                });
            } else {
                alert('장소를 찾을 수 없습니다.');
            }
        });
    };

    if (!isLoaded) {
        return <div style={{
            height: '300px',
            background: '#f0f0f0',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888'
        }}>
            구글 맵 로딩 중... (API 키 확인 필요)
        </div>;
    }

    return (
        <div className="location-picker">
            <div className="search-box" style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '10px'
            }}>
                <input
                    type="text"
                    placeholder="장소 검색 (예: 에펠탑)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        outline: 'none'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} style={{
                    padding: '0 12px',
                    background: 'var(--color-primary-pink, #ff6f61)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer'
                }}>
                    <Search size={20} />
                </button>
            </div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={13}
                onClick={handleMapClick}
                onLoad={setMap}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {markerPosition && (
                    <Marker position={markerPosition} />
                )}
            </GoogleMap>

            {markerPosition && (
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} />
                    선택된 위치: {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
                </div>
            )}
        </div>
    );
};

export default React.memo(LocationPicker);
