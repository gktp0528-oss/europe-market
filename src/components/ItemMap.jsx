import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '200px',
    borderRadius: '12px'
};

const ItemMap = ({ lat, lng }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    if (!isLoaded) {
        return <div style={{ height: '200px', background: '#f0f0f0', borderRadius: '12px' }} />;
    }

    const center = { lat, lng };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            options={{
                disableDefaultUI: true,
                zoomControl: false,
                draggable: false, // Static map feeling
            }}
        >
            <Marker position={center} />
        </GoogleMap>
    );
};

export default React.memo(ItemMap);
