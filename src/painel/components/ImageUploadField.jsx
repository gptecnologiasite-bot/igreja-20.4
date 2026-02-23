import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, X, Check } from 'lucide-react';
import './ImageUploadField.css';

const ImageUploadField = ({ value, onChange, label = "Foto / Imagem", placeholder = "Cole o link ou suba uma foto" }) => {
    const fileInputRef = useRef(null);
    const [showUrlInput, setShowUrlInput] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result);
                setShowUrlInput(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="iuf-container">
            <div className="iuf-main-actions">
                <button
                    type="button"
                    className="iuf-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={16} />
                    <span>{value ? 'Trocar Foto' : 'Subir Foto'}</span>
                </button>

                <button
                    type="button"
                    className={`iuf-link-toggle ${showUrlInput ? 'active' : ''}`}
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    title="Editar manualmente (Link/Base64)"
                >
                    <LinkIcon size={16} />
                </button>

                {value && (
                    <button
                        type="button"
                        className="iuf-clear-btn"
                        onClick={clearImage}
                        title="Remover Foto"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {showUrlInput && (
                <div className="iuf-url-input-container">
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="iuf-url-input"
                        autoFocus
                    />
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default ImageUploadField;
