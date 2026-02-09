import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Search as SearchIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCountry } from '../contexts/CountryContext';
import { getPostTimeLabel } from '../utils/dateUtils';
import { useMinuteTicker } from '../hooks/useMinuteTicker';
import '../styles/WriteForm.css';

const CATEGORY_OPTIONS = [
    { value: 'all', label: '전체' },
    { value: 'used', label: '중고거래' },
    { value: 'job', label: '알바' },
    { value: 'tutoring', label: '과외/레슨' },
    { value: 'meetup', label: '모임' },
];

const getDetailRoute = (item) => {
    if (item.category === 'job') return `/job/${item.id}`;
    if (item.category === 'tutoring') return `/tutoring/${item.id}`;
    if (item.category === 'meetup') return `/meetup/${item.id}`;
    return `/detail/${item.id}`;
};

const Search = () => {
    const navigate = useNavigate();
    const { selectedCountry } = useCountry();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || 'all';
    const initialCountry = searchParams.get('country') || selectedCountry.code || 'ALL';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [selectedCountryCode] = useState(initialCountry);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const nowTick = useMinuteTicker();

    const countryLabel = useMemo(() => {
        if (selectedCountryCode === 'ALL') return '전체 국가';
        if (selectedCountryCode === selectedCountry.code) return selectedCountry.name;
        return selectedCountryCode;
    }, [selectedCountry.code, selectedCountry.name, selectedCountryCode]);

    const fetchSearchResults = useCallback(async (query, category, countryCode) => {
        setLoading(true);
        try {
            let request = supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(40);

            if (category !== 'all') {
                request = request.eq('category', category);
            }

            if (countryCode && countryCode !== 'ALL') {
                request = request.eq('country_code', countryCode);
            }

            const trimmedQuery = query.trim();
            if (trimmedQuery) {
                const safeQuery = trimmedQuery.replace(/[,%_]/g, '');
                request = request.or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,location.ilike.%${safeQuery}%`);
            }

            const { data, error } = await request;
            if (error) throw error;
            setResults(data || []);
        } catch (error) {
            console.error('Search query failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const nextParams = new URLSearchParams();
        const trimmedQuery = searchQuery.trim();

        if (trimmedQuery) nextParams.set('q', trimmedQuery);
        if (selectedCategory !== 'all') nextParams.set('category', selectedCategory);
        if (selectedCountryCode && selectedCountryCode !== 'ALL') nextParams.set('country', selectedCountryCode);

        if (nextParams.toString() !== searchParams.toString()) {
            setSearchParams(nextParams, { replace: true });
        }
    }, [searchQuery, selectedCategory, selectedCountryCode, searchParams, setSearchParams]);

    useEffect(() => {
        const debounceId = setTimeout(() => {
            fetchSearchResults(searchQuery, selectedCategory, selectedCountryCode);
        }, 300);

        return () => clearTimeout(debounceId);
    }, [searchQuery, selectedCategory, selectedCountryCode, fetchSearchResults]);

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <div style={{ flex: 1, margin: '0 10px' }}>
                    <form onSubmit={(e) => e.preventDefault()} style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '10px 40px 10px 15px',
                                borderRadius: '20px',
                                border: '1px solid #eee',
                                fontSize: '15px',
                                outline: 'none',
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#888',
                            display: 'inline-flex',
                        }}>
                            <SearchIcon size={20} />
                        </span>
                    </form>
                </div>
            </header>

            <div className="write-content" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span style={{
                        padding: '6px 10px',
                        borderRadius: '999px',
                        background: '#F5F6F8',
                        color: '#4f5561',
                        fontSize: '12px',
                        fontWeight: 700,
                    }}>
                        국가: {countryLabel}
                    </span>
                    {CATEGORY_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedCategory(option.value)}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '999px',
                                border: selectedCategory === option.value ? '1px solid #2D3436' : '1px solid #E5E7EB',
                                background: selectedCategory === option.value ? '#2D3436' : 'white',
                                color: selectedCategory === option.value ? 'white' : '#6B7280',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>검색 중...</p>
                ) : results.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
                        검색 결과가 없습니다.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {results.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => navigate(getDetailRoute(item))}
                                style={{
                                    border: '1px solid #eee',
                                    borderRadius: '14px',
                                    padding: '12px',
                                    background: 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                }}
                            >
                                <p style={{ fontWeight: 700, color: '#2D3436', marginBottom: '6px' }}>{item.title}</p>
                                <div style={{ display: 'flex', gap: '10px', color: '#8A8A8A', fontSize: '12px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {item.location || '위치 미정'}
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {getPostTimeLabel(item, nowTick)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
