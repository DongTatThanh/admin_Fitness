import React, { useState } from 'react';
import type { ProductVariant } from '../../services/variant.service';
import VariantList from './VariantList';
import VariantModal from './VariantModal';

interface VariantManagementProps {
  productId: number;
}

const VariantManagement: React.FC<VariantManagementProps> = ({ productId }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddVariant = () => {
    setEditingVariant(undefined);
    setShowModal(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVariant(undefined);
  };

  return (
    <div className="variant-management">
      <div className="variant-management-header">
        <button className="btn-add-variant" onClick={handleAddVariant}>
          Thêm Variant
        </button>
      </div>

      <VariantList key={refreshKey} productId={productId} onEdit={handleEditVariant} />

      {showModal && (
        <VariantModal
          productId={productId}
          variant={editingVariant}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default VariantManagement;
