import React, { createContext, useContext, useState, useEffect } from 'react';

const CountryContext = createContext();

// 11 Countries with Korean communities
// eslint-disable-next-line react-refresh/only-export-components
export const SUPPORTED_COUNTRIES = [
    { code: 'ALL', name: '전체', flag: '🌍', lat: 48.8566, lng: 2.3522, currencySymbol: '€' }, // Default/All
    { code: 'DE', name: '독일', flag: '🇩🇪', lat: 51.1657, lng: 10.4515, currencySymbol: '€' },
    { code: 'FR', name: '프랑스', flag: '🇫🇷', lat: 46.2276, lng: 2.2137, currencySymbol: '€' },
    { code: 'GB', name: '영국', flag: '🇬🇧', lat: 55.3781, lng: -3.4360, currencySymbol: '£' },
    { code: 'IT', name: '이탈리아', flag: '🇮🇹', lat: 41.8719, lng: 12.5674, currencySymbol: '€' },
    { code: 'ES', name: '스페인', flag: '🇪🇸', lat: 40.4637, lng: -3.7492, currencySymbol: '€' },
    { code: 'AT', name: '오스트리아', flag: '🇦🇹', lat: 47.5162, lng: 14.5501, currencySymbol: '€' },
    { code: 'NL', name: '네덜란드', flag: '🇳🇱', lat: 52.1326, lng: 5.2913, currencySymbol: '€' },
    { code: 'HU', name: '헝가리', flag: '🇭🇺', lat: 47.1625, lng: 19.5033, currencySymbol: 'Ft' },
    { code: 'CZ', name: '체코', flag: '🇨🇿', lat: 49.8175, lng: 15.4730, currencySymbol: 'Kč' },
    { code: 'PL', name: '폴란드', flag: '🇵🇱', lat: 51.9194, lng: 19.1451, currencySymbol: 'zł' },
];

export const CountryProvider = ({ children }) => {
    const [selectedCountry, setSelectedCountry] = useState(SUPPORTED_COUNTRIES[0]); // Default: Germany
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auto-detect country via API
        const detectCountry = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const detectedCode = data.country_code;

                const country = SUPPORTED_COUNTRIES.find(c => c.code === detectedCode);

                if (country) {
                    setSelectedCountry(country);
                } else {
                    // Fallback to Germany if outside supported list
                    setSelectedCountry(SUPPORTED_COUNTRIES[0]);
                }
            } catch (error) {
                console.error('Failed to detect country:', error);
                // Fallback to Germany on error
                setSelectedCountry(SUPPORTED_COUNTRIES[0]);
            } finally {
                setLoading(false);
            }
        };

        detectCountry();
    }, []);

    return (
        <CountryContext.Provider value={{ selectedCountry, setSelectedCountry, loading }}>
            {children}
        </CountryContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCountry = () => useContext(CountryContext);
