import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '32px',
          maxWidth: '400px',
          minWidth: '300px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: isDangerous ? '#dc2626' : '#1a1a1a',
            fontFamily: 'system-ui',
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: '#5a7a99',
            lineHeight: '1.6',
            fontFamily: 'system-ui',
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f0f4fa',
              color: '#1a3a5c',
              border: '1px solid #dde3ec',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'system-ui',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#e8ecf3';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f4fa';
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isDangerous ? '#dc2626' : '#1a3a5c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'system-ui',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = isDangerous ? '#b91c1c' : '#132d47';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDangerous ? '#dc2626' : '#1a3a5c';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLoading ? 'Eliminando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
