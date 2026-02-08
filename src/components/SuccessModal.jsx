import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessModal = ({
    isOpen,
    onClose,
    title,
    message,
    buttonText = '확인',
    icon: Icon = CheckCircle,
    iconColor = '#eb2f96',
    iconBg = '#fff0f6'
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease-out' }}>
                <div style={{
                    backgroundColor: iconBg,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <Icon size={30} color={iconColor} />
                </div>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-desc">
                    {message.split('<br/>').map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            {i < message.split('<br/>').length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </p>
                <div className="modal-buttons">
                    <button
                        className="modal-btn confirm"
                        onClick={onClose}
                        style={{ width: '100%' }}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
