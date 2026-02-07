import React, { createContext, useContext, useState, useEffect } from 'react';

const CountryContext = createContext();

// 11 Countries with Korean communities
export const SUPPORTED_COUNTRIES = [
    {
        code: 'ALL', name: '전체', flag: '🌍', lat: 48.8566, lng: 2.3522, currencySymbol: '€',
        cities: ['전체']
    },
    {
        code: 'DE', name: '독일', flag: '🇩🇪', lat: 51.1657, lng: 10.4515, currencySymbol: '€',
        cities: ['베를린', '프랑크푸르트', '뮌헨', '함부르크', '뒤셀도르프', '에센', '슈투트가르트']
    },
    {
        code: 'FR', name: '프랑스', flag: '🇫🇷', lat: 46.2276, lng: 2.2137, currencySymbol: '€',
        cities: ['파리', '리옹', '마르세유', '니스', '보르도', '스트라스부르']
    },
    {
        code: 'GB', name: '영국', flag: '🇬🇧', lat: 55.3781, lng: -3.4360, currencySymbol: '£',
        cities: ['런던', '맨체스터', '버밍엄', '에든버러', '케임브리지', '옥스퍼드']
    },
    {
        code: 'IT', name: '이탈리아', flag: '🇮🇹', lat: 41.8719, lng: 12.5674, currencySymbol: '€',
        cities: ['로마', '밀라노', '나폴리', '피렌체', '베네치아']
    },
    {
        code: 'ES', name: '스페인', flag: '🇪🇸', lat: 40.4637, lng: -3.7492, currencySymbol: '€',
        cities: ['마드리드', '바르셀로나', '발렌시아', '세비야']
    },
    {
        code: 'AT', name: '오스트리아', flag: '🇦🇹', lat: 47.5162, lng: 14.5501, currencySymbol: '€',
        cities: ['빈', '잘츠부르크', '인스브루크', '그라츠']
    },
    {
        code: 'NL', name: '네덜란드', flag: '🇳🇱', lat: 52.1326, lng: 5.2913, currencySymbol: '€',
        cities: ['암스테르담', '로테르담', '헤이그', '위트레흐트']
    },
    {
        code: 'HU', name: '헝가리', flag: '🇭🇺', lat: 47.1625, lng: 19.5033, currencySymbol: 'Ft',
        cities: ['부다페스트', '데브레첸', '세게드']
    },
    {
        code: 'CZ', name: '체코', flag: '🇨🇿', lat: 49.8175, lng: 15.4730, currencySymbol: 'Kč',
        cities: ['프라하', '브르노', '오스트라바']
    },
    {
        code: 'PL', name: '폴란드', flag: '🇵🇱', lat: 51.9194, lng: 19.1451, currencySymbol: 'zł',
        cities: ['바르샤바', '크라쿠프', '브로츠와프']
    },
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

export const useCountry = () => useContext(CountryContext);
