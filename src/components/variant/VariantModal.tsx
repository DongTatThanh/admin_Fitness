import React from 'react';
import type { ProductVariant } from '../../services/variant.service';
import VariantForm from './VariantForm';

interface VariantModalProps {
  productId: number;
  variant?: ProductVariant;
  onClose: () => void;
  onSuccess: () => void;
}

const VariantModal: React.FC<VariantModalProps> = ({ productId, variant, onClose, onSuccess }) => {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal variant-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{variant ? 'Chỉnh sửa Variant' : 'Thêm Variant mới'}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <VariantForm
            productId={productId}
            variant={variant}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default VariantModal;
