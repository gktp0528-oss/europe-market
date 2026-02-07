import React, { useState } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import './LocationPicker.css';

// Predefined set of cities for each country to ensure valid location data
const CITY_DATA = {
    'FR': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Lille', 'Strasbourg', 'Montpellier'],
    'DE': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Düsseldorf', 'Stuttgart', 'Leipzig'],
    'GB': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Edinburgh', 'Leeds', 'Bristol'],
    'IT': ['Rome', 'Milan', 'Florence', 'Venice', 'Naples', 'Turin', 'Palermo', 'Bologna'],
    'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Malaga', 'Bilbao', 'Zaragoza', 'Granada'],
    'AT': ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz'],
    'NL': ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague', 'Eindhoven'],
    'HU': ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs'],
    'CZ': ['Prague', 'Brno', 'Ostrava', 'Plzeň'],
    'PL': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań']
};

const LocationPicker = ({ countryCode, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const cities = CITY_DATA[countryCode] || [];

    const filteredCities = cities.filter(city =>
        city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="location-picker-overlay" onClick={onClose}>
            <div className="location-picker-content" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <h3>지역 선택</h3>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                <div className="search-bar-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="도시명을 검색해보세요"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="city-list">
                    {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                            <button
                                key={city}
                                className="city-item"
                                onClick={() => onSelect(`${city}, ${countryCode}`)}
                            >
                                <MapPin size={16} />
                                <span>{city}</span>
                            </button>
                        ))
                    ) : (
                        <div className="no-result">검색 결과가 없습니다 🥲</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
