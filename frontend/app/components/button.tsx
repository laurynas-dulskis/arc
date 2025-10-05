import React from 'react';

type ButtonProps = {
    text: string;
    color: string;
    onClick?: () => void;
};

const Button: React.FC<ButtonProps> = ({ text, color, onClick }) => {
    return (
        <button
            className={`${color} text-white px-6 py-2 rounded-lg hover:opacity-90 transition`}
            onClick={onClick}
        >
            {text}
        </button>
    );
};

export default Button;