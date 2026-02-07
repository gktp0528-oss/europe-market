import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../contexts/CountryContext';
import './LocationPicker.css';

const LocationPicker = ({ countryCode, onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef(null);
    const inputRef = useRef(null);

    // Get API URL from env, default to local if not set
    const API_URL = import.meta.env.VITE_PHOTON_API_URL || 'http://localhost:2322/api';

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const searchPlaces = async (searchText) => {
        if (!searchText.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            // Construct query
            // If specific country is selected, append it to query for better filtering
            // Note: With self-hosted Europe data, we are already limited to Europe.
            // This allows further narrowing to a specific country.
            let finalQuery = searchText;

            if (countryCode && countryCode !== 'ALL') {
                const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
                if (country) {
                    finalQuery = `${searchText}, ${country.name}`;
                }
            }

            const params = new URLSearchParams({
                q: finalQuery,
                lang: 'ko',
                limit: '5'
            });

            // If we have access to user location or country center, we could add lat/lon bias
            if (countryCode && countryCode !== 'ALL') {
                const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
                if (country) {
                    params.append('lat', country.lat);
                    params.append('lon', country.lng);
                }
            }

            const response = await fetch(`${API_URL}?${params}`);
            const data = await response.json();

            setResults(data.features || []);
        } catch (error) {
            console.error('Photon search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            searchPlaces(val);
        }, 300); // 300ms debounce
    };

    const handleSelect = (feature) => {
        const { properties, geometry } = feature;
        // Construct a readable address
        // Photon properties: name, country, city, street, etc.
        const name = properties.name;
        const city = properties.city || properties.town || properties.village;
        const country = properties.country;

        let fullAddress = name;
        if (city && city !== name) fullAddress += `, ${city}`;
        if (country) fullAddress += `, ${country}`;

        onSelect({
            address: fullAddress,
            name: name,
            lat: geometry.coordinates[1],
            lng: geometry.coordinates[0]
        });
    };

    return (
        <div className="location-picker-overlay" onClick={onClose}>
            <div className="location-picker-content" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <h3>지역 선택</h3>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <div className="api-status-indicator">
                    <span className="badge">Photon API</span>
                </div>

                <div className="search-bar-wrapper custom-search">
                    <Search size={18} className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInput}
                        placeholder={countryCode === 'ALL' ? "유럽 내 장소 검색" : `${countryCode} 내 장소 검색`}
                        className="photon-input"
                    />
                    {loading && <Loader2 size={18} className="spinner" />}
                </div>

                <div className="results-list">
                    {results.map((feature, idx) => (
                        <div key={idx} className="result-item" onClick={() => handleSelect(feature)}>
                            <div className="result-icon">
                                <MapPin size={16} />
                            </div>
                            <div className="result-info">
                                <div className="result-name">{feature.properties.name}</div>
                                <div className="result-details">
                                    {[
                                        feature.properties.city,
                                        feature.properties.state,
                                        feature.properties.country
                                    ].filter(Boolean).join(', ')}
                                </div>
                            </div>
                        </div>
                    ))}
                    {query && !loading && results.length === 0 && (
                        <div className="no-results">검색 결과가 없습니다.</div>
                    )}
                </div>

                <div className="picker-hint">
                    <MapPin size={14} />
                    <span>
                        {countryCode === 'ALL'
                            ? '유럽 전체 데이터 검색 중'
                            : `입력하신 국가(${countryCode}) 위주로 검색됩니다.`}
                    </span>
                </div>

                <div className="mapbox-attribution">
                    Data © OpenStreetMap contributors
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
