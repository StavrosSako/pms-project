import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [currentModalId, setCurrentModalId] = useState(null);
  const [modalProps, setModalProps] = useState({});

  const openModal = (id, props = {}) => {
    setCurrentModalId(id);
    setModalProps(props);
  };

  const closeModal = () => {
    setCurrentModalId(null);
    setModalProps({});
  };

  const value = { openModal, closeModal, currentModalId, modalProps };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const Modal = ({ id, children, title, size = 'md', onConfirm, onClose, showCancel = true, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  const { currentModalId, closeModal, modalProps } = useContext(ModalContext);
  const modalRef = useRef(null);
  const isOpen = currentModalId === id;

  const handleClose = () => {
    if (onClose) onClose();
    closeModal();
  };

  const handleConfirm = async () => {
    if (!onConfirm) {
      closeModal();
      return;
    }

    try {
      const result = await onConfirm();

      if (result === false || result?.success === false) {
        return;
      }

      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  const getWidthClass = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-3xl';
      case 'xl': return 'max-w-5xl';
      default: return 'max-w-md'; // md
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`relative w-full ${getWidthClass()} max-h-[90vh] bg-background dark:bg-dark-bg rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-6 flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-xl font-semibold text-text-main dark:text-dark-text">{title || modalProps.title}</h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-visible mb-6 text-text-main dark:text-dark-text">
              {children || modalProps.content}
            </div>

            {/* Modal Footer */}
            {(showCancel || onConfirm) && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                {showCancel && (
                  <button 
                    onClick={handleClose} 
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    {cancelText}
                  </button>
                )}
                {onConfirm && (
                  <button 
                    onClick={handleConfirm} 
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};