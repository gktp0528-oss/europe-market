import React, { useState, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import './LocationPicker.css';

const libraries = ['places'];

const LocationPicker = ({ countryCode, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const autocompleteRef = useRef(null);
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey,
        libraries,
        language: 'ko', // Korean for names if possible
    });

    const onLoad = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) {
                // We send a structured object or just the address string depending on need.
                // For now, let's send the full info so the parent can decide.
                onSelect({
                    address: place.formatted_address,
                    name: place.name,
                    lat: place.geometry?.location?.lat(),
                    lng: place.geometry?.location?.lng()
                });
            }
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };

    return (
        <div className="location-picker-overlay" onClick={onClose}>
            <div className="location-picker-content" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <h3>지역 선택</h3>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                {!isLoaded ? (
                    <div className="loading-container">
                        <Loader2 className="animate-spin" size={32} />
                        <p>지도를 불러오는 중...</p>
                    </div>
                ) : loadError ? (
                    <div className="error-container">
                        <p>구글 맵을 불러오지 못했습니다 🥲</p>
                        <p className="error-hint">API 키 설정을 확인해 주세요.</p>
                    </div>
                ) : (
                    <>
                        <div className="search-bar-wrapper">
                            <Search size={18} className="search-icon" />
                            <Autocomplete
                                onLoad={onLoad}
                                onPlaceChanged={onPlaceChanged}
                                options={{
                                    componentRestrictions: { country: countryCode?.toLowerCase() || 'fr' },
                                    fields: ['formatted_address', 'geometry', 'name']
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="장소나 주소를 입력해보세요 (예: 파리 에펠탑)"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </Autocomplete>
                        </div>

                        <div className="picker-hint">
                            <MapPin size={14} />
                            <span>입력한 국가({countryCode}) 내의 장소만 검색됩니다.</span>
                        </div>

                        <div className="google-attribution">
                            Powered by Google
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LocationPicker;
