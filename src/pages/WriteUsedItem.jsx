import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, ChevronRight, Euro } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';
import './Home.css'; // Reusing Home styles for now, or create separate css

const WriteUsedItem = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState({ id: 'clothes', name: '의류' });
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    const handleImageUpload = (e) => {
        // Placeholder for image upload
        const files = Array.from(e.target.files);
        // In a real app, you'd upload these or create object URLs
        const newImages = files.map(file => URL.createObjectURL(file));
        setImages([...images, ...newImages]);
    };

    const handleSubmit = () => {
        // Submit logic here
        alert('글 등록이 완료되었습니다!');
        navigate('/category/clothes'); // Navigate to category or detail
    };

    return (
        <div className="home-container" style={{ padding: 0, backgroundColor: '#f9f9f9' }}>
            {/* Header */}
            <header className="write-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'white',
                borderBottom: '1px solid #f0f0f0',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', padding: 0 }}>
                    <ArrowLeft size={24} color="#333" />
                </button>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>중고거래 글쓰기</h2>
                <button onClick={handleSubmit} style={{
                    border: 'none',
                    background: 'none',
                    color: '#ff6f61', // Primary pink color based on Home.jsx reference or similar
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    완료
                </button>
            </header>

            <div className="write-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Image Upload */}
                <div className="image-upload-section" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                    <label className="image-upload-btn" style={{
                        minWidth: '80px',
                        height: '80px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#888',
                        fontSize: '12px',
                        cursor: 'pointer',
                        background: 'white'
                    }}>
                        <Camera size={24} style={{ marginBottom: '4px' }} />
                        <span>{images.length}/10</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>

                    {images.map((img, index) => (
                        <div key={index} className="uploaded-image" style={{
                            minWidth: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <img src={img} alt={`uploaded-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>

                {/* Title */}
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="글 제목"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 0',
                            border: 'none',
                            borderBottom: '1px solid #eee',
                            fontSize: '16px',
                            outline: 'none',
                            background: 'transparent'
                        }}
                    />
                </div>

                {/* Category Selection */}
                <div className="input-group" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer'
                }}>
                    <span style={{ fontSize: '16px', color: '#333' }}>카테고리</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#333', fontWeight: '500' }}>{category.name}</span>
                        <ChevronRight size={20} color="#ccc" />
                    </div>
                </div>

                {/* Price */}
                <div className="input-group" style={{ position: 'relative' }}>
                    <Euro size={18} color="#888" style={{ position: 'absolute', top: '14px', left: '0' }} />
                    <input
                        type="number"
                        placeholder="가격 (유로)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 0 12px 28px',
                            border: 'none',
                            borderBottom: '1px solid #eee',
                            fontSize: '16px',
                            outline: 'none',
                            background: 'transparent'
                        }}
                    />
                </div>

                {/* Content */}
                <div className="input-group">
                    <textarea
                        placeholder="게시글 내용을 작성해주세요. (가품 및 판매금지 물품은 게시가 제한될 수 있어요.)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '12px 0',
                            border: 'none',
                            fontSize: '16px',
                            outline: 'none',
                            resize: 'none',
                            background: 'transparent',
                            lineHeight: '1.5'
                        }}
                    />
                </div>

                {/* Location (To be integrated with Google Maps) */}
                <div style={{ padding: '12px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                    <div
                        className="input-group"
                        onClick={() => setShowMap(!showMap)}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: showMap ? '10px' : '0'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} color="#333" />
                            <span style={{ fontSize: '16px', color: location ? '#333' : '#888' }}>
                                {location ? location.address : '거래 희망 장소'}
                            </span>
                        </div>
                        <ChevronRight size={20} color="#ccc" style={{ transform: showMap ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>

                    {showMap && (
                        <div style={{ marginTop: '10px' }}>
                            <LocationPicker onLocationSelect={(loc) => {
                                setLocation(loc);
                                // setShowMap(false); // Optional: close map after selection
                            }} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default WriteUsedItem;
