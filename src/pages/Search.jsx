import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import '../styles/WriteForm.css'; // Reusing header styles

const Search = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
        // Future: Implement actual search filtering logic
    };

    return (
        <div className="write-page">
            <header className="write-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <div style={{ flex: 1, margin: '0 10px' }}>
                    <form onSubmit={handleSearch} style={{ position: 'relative' }}>
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
                                outline: 'none'
                            }}
                        />
                        <button type="submit" style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#888'
                        }}>
                            <SearchIcon size={20} />
                        </button>
                    </form>
                </div>
            </header>

            <div className="write-content" style={{ padding: '20px' }}>
                <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
                    최근 검색어가 없습니다.
                </p>
            </div>
        </div>
    );
};

export default Search;
