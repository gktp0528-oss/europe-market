import React, { useState } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { SearchBox } from '@mapbox/search-js-react';
import './LocationPicker.css';

const LocationPicker = ({ countryCode, onSelect, onClose }) => {
    const [searchValue, setSearchValue] = useState('');
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    const handleRetrieve = (res) => {
        if (res && res.features && res.features[0]) {
            const feature = res.features[0];
            const coordinates = feature.geometry.coordinates;

            onSelect({
                address: feature.properties.full_address || feature.properties.name,
                name: feature.properties.name,
                lat: coordinates[1],
                lng: coordinates[0]
            });
        }
    };

    return (
        <div className="location-picker-overlay" onClick={onClose}>
            <div className="location-picker-content" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <h3>지역 선택</h3>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <div className="search-bar-wrapper">
                    <Search size={18} className="search-icon" />
                    <SearchBox
                        accessToken={mapboxToken}
                        value={searchValue}
                        onChange={(val) => setSearchValue(val)}
                        onRetrieve={handleRetrieve}
                        placeholder="장소나 주소를 입력해보세요"
                        options={{
                            countries: [countryCode?.toLowerCase() || 'fr'],
                            language: 'ko',
                            limit: 5
                        }}
                        theme={{
                            variables: {
                                fontFamily: 'inherit',
                                borderRadius: '12px',
                                colorPrimary: '#3b82f6',
                                colorBackground: '#f1f5f9',
                                colorText: '#1e293b'
                            },
                            css: `
                                .mapboxgl-ctrl-geocoder {
                                    width: 100%;
                                    max-width: none;
                                    box-shadow: none;
                                    background: none;
                                }
                                .mapbox-search-box-container {
                                    width: 100%;
                                }
                                input {
                                    padding-left: 44px !important;
                                    height: 48px;
                                    font-size: 16px !important;
                                    border: 1px solid transparent !important;
                                    background-color: #f1f5f9 !important;
                                }
                                input:focus {
                                    background-color: #fff !important;
                                    border-color: #3b82f6 !important;
                                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                                }
                                .mapboxgl-ctrl-geocoder--icon-search {
                                    display: none;
                                }
                            `
                        }}
                    />
                </div>

                <div className="picker-hint">
                    <MapPin size={14} />
                    <span>입력하신 국가({countryCode}) 내 장소만 검색됩니다.</span>
                </div>

                <div className="mapbox-attribution">
                    Powered by Mapbox
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
