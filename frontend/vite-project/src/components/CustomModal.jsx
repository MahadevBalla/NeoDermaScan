import { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';

const CustomModal = ({ opened, onClose, title, children }) => {
    useEffect(() => {
        if (opened) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [opened]);

    if (!opened) return null;

    return (
        <>
            {/* Frosted Glass Backdrop */}
            <div
                className="fixed inset-0 z-1000 transition-all duration-500 ease-out"
                style={{
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    backdropFilter: 'blur(10px) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(10px) brightness(1.1)',
                }}
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="fixed inset-0 z-1001 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out pointer-events-auto overflow-hidden"
                    style={{
                        boxShadow: '0 20px 70px rgba(20, 184, 166, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Gradient overlay */}
                    <div
                        className="absolute inset-0 opacity-50 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.05) 0%, transparent 70%)',
                        }}
                    />

                    {/* Header */}
                    <div className="relative flex items-center justify-between p-6 border-b border-teal-50">
                        <div className="flex-grow">{title}</div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-teal-600 transition-all duration-200 hover:rotate-90 hover:scale-110 transform bg-white/50 hover:bg-white rounded-full p-2 shadow-sm"
                            aria-label="Close modal"
                        >
                            <IconX size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative p-6">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomModal;