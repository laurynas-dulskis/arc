import React from 'react';

type ButtonProps = {
    text: string;
    color: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
};

const Button: React.FC<ButtonProps> = ({ text, color, onClick, disabled = false, type = "button"}) => {
    return (
        <button
            className={`${color} text-white px-6 py-2 rounded-lg hover:opacity-90 transition ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {text}
        </button>
    );
};

export default Button;