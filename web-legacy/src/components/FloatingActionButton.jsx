import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Briefcase, GraduationCap, Users, Pencil } from 'lucide-react';
import './FloatingActionButton.css';

const FloatingActionButton = () => {
    const navigate = useNavigate();
    const [fabExpanded, setFabExpanded] = useState(false);

    const options = [
        { icon: ShoppingBag, label: '중고거래', path: '/write/select/used' },
        { icon: Briefcase, label: '알바', path: '/write/select/job' },
        { icon: GraduationCap, label: '과외/레슨', path: '/write/select/tutoring' },
        { icon: Users, label: '모임', path: '/write/select/meetup' },
    ];

    const handleOptionClick = (path) => {
        navigate(path);
        setFabExpanded(false);
    };

    return (
        <>
            <div className="fab-container">
                {/* Sub-buttons (appear when expanded) */}
                <div className={`fab-options ${fabExpanded ? 'expanded' : ''}`}>
                    {options.map((option, index) => (
                        <button
                            key={index}
                            className="fab-option"
                            onClick={() => handleOptionClick(option.path)}
                        >
                            <option.icon size={18} />
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main FAB button */}
                <button
                    className={`fab-write ${fabExpanded ? 'active' : ''}`}
                    onClick={() => setFabExpanded(!fabExpanded)}
                    aria-label="메뉴 열기"
                >
                    <Pencil size={24} className={fabExpanded ? 'rotate' : ''} />
                </button>
            </div>

            {/* Overlay when FAB is expanded */}
            {fabExpanded && <div className="fab-overlay" onClick={() => setFabExpanded(false)} />}
        </>
    );
};

export default FloatingActionButton;
