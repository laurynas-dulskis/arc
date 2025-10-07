import React from 'react';
import Button from './button';
import Spinner from './spinner';

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, title, message, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                {isLoading ? (
                    <div className="mb-10 ml-10 mr-10">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <h2 className="text-lg font-bold mb-4 text-gray-700">{title}</h2>
                        <p className="mb-4 text-gray-700">{message}</p>
                        <div className="flex space-x-2 justify-between">
                            <Button text="Cancel" color="bg-blue-500" onClick={onCancel} />
                            <Button text="Confirm" color="bg-red-500" onClick={onConfirm} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfirmationModal;