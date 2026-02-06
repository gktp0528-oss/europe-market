import React, { createContext, useContext, useState, useEffect } from 'react';

const CountryContext = createContext();

// 10 Countries with Korean communities
export const SUPPORTED_COUNTRIES = [
    { code: 'DE', name: '독일', flag: '🇩🇪', lat: 51.1657, lng: 10.4515 },
    { code: 'FR', name: '프랑스', flag: '🇫🇷', lat: 46.2276, lng: 2.2137 },
    { code: 'GB', name: '영국', flag: '🇬🇧', lat: 55.3781, lng: -3.4360 },
    { code: 'IT', name: '이탈리아', flag: '🇮🇹', lat: 41.8719, lng: 12.5674 },
    { code: 'ES', name: '스페인', flag: '🇪🇸', lat: 40.4637, lng: -3.7492 },
    { code: 'AT', name: '오스트리아', flag: '🇦🇹', lat: 47.5162, lng: 14.5501 },
    { code: 'NL', name: '네덜란드', flag: '🇳🇱', lat: 52.1326, lng: 5.2913 },
    { code: 'HU', name: '헝가리', flag: '🇭🇺', lat: 47.1625, lng: 19.5033 },
    { code: 'CZ', name: '체코', flag: '🇨🇿', lat: 49.8175, lng: 15.4730 },
    { code: 'PL', name: '폴란드', flag: '🇵🇱', lat: 51.9194, lng: 19.1451 },
];

export const CountryProvider = ({ children }) => {
    // 1. Initial State: Always start with null if no saved country to avoid flashing Germany
    const [selectedCountry, setSelectedCountry] = useState(() => {
        const saved = localStorage.getItem('selected_country');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const found = SUPPORTED_COUNTRIES.find(c => c.code === parsed.code);
                return found || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    const [loading, setLoading] = useState(!selectedCountry);

    useEffect(() => {
        // Only auto-detect if nothing is in localStorage or initial state is null
        if (selectedCountry) {
            setLoading(false);
            return;
        }

        const detectCountry = async () => {
            try {
                // Using ipapi.co for accurate location detection
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const detectedCode = data.country_code;

                const country = SUPPORTED_COUNTRIES.find(c => c.code === detectedCode);

                if (country) {
                    setSelectedCountry(country);
                    // We don't save auto-detected country to localStorage immediately 
                    // unless you want to lock them in. Let's save it so it's consistent.
                    localStorage.setItem('selected_country', JSON.stringify(country));
                } else {
                    // Default to Germany only if detected outside supported list
                    setSelectedCountry(SUPPORTED_COUNTRIES[0]);
                    localStorage.setItem('selected_country', JSON.stringify(SUPPORTED_COUNTRIES[0]));
                }
            } catch (error) {
                console.error('Failed to detect country:', error);
                // Fallback to Germany on network error
                setSelectedCountry(SUPPORTED_COUNTRIES[0]);
                localStorage.setItem('selected_country', JSON.stringify(SUPPORTED_COUNTRIES[0]));
            } finally {
                setLoading(false);
            }
        };

        detectCountry();
    }, [selectedCountry]);

    const updateCountry = (country) => {
        setSelectedCountry(country);
        localStorage.setItem('selected_country', JSON.stringify(country));
    };

    return (
        <CountryContext.Provider value={{ selectedCountry, setSelectedCountry: updateCountry, loading }}>
            {children}
        </CountryContext.Provider>
    );
};

export const useCountry = () => useContext(CountryContext);
