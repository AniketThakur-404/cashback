import React, { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../../styles/buttonStyles";
import { getApiBaseUrl } from "../../lib/apiClient";

const API_BASE_URL = getApiBaseUrl();
const MAX_IMAGE_SIZE_MB = 10;

const resolveAssetUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) {
    return API_BASE_URL ? `${API_BASE_URL}${value}` : value;
  }
  return value;
};

const RedeemProductModal = ({
  product,
  onClose,
  onSave,
  isSaving,
  onUploadImage,
  uploadState,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "Popular",
    amount: "",
    value: "",
    brand: "",
    stock: "",
    status: "active",
    description: "",
    image: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || "",
        name: product.name || "",
        category: product.category || "Popular",
        amount: product.amount ?? "",
        value: product.value || "",
        brand: product.brand || "",
        stock: product.stock ?? "",
        status: product.status || "active",
        description: product.description || "",
        image: product.image || "",
      });
    }
  }, [product]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.id.trim()) newErrors.id = "Product ID is required";
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = "Valid amount is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: `Image is too large. Maximum allowed size is ${MAX_IMAGE_SIZE_MB}MB.`,
        }));
        return;
      }
      onUploadImage(file);
    }
  };

  useEffect(() => {
    if (product?.image) {
      setFormData((prev) => ({ ...prev, image: product.image }));
    }
  }, [product?.image]);

  // Sync image from props if it changes (e.g. after upload)
  useEffect(() => {
    if (uploadState?.status === "Product image uploaded." && product?.image) {
      setFormData((prev) => ({ ...prev, image: product.image }));
    }
  }, [uploadState, product]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 pb-safe-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {product?.id && product.isEditing
              ? "Edit Redeem Product"
              : "Add Redeem Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto ios-scroll flex-1"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="space-y-5">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Wireless Earbuds"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-gray-200 dark:border-zinc-700 focus:ring-[#059669]/20"
                } bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 transition-all`}
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name}</p>
              )}
            </div>

            {/* ID and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Product ID *
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  placeholder="e.g., wireless-earbuds-01"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.id
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-gray-200 dark:border-zinc-700 focus:ring-[#059669]/20"
                  } bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 transition-all`}
                />
                {errors.id && (
                  <p className="text-xs text-rose-500">{errors.id}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="e.g., Popular"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/20 transition-all"
                />
              </div>
            </div>

            {/* Points and Value Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Points (Amount) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.amount
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-gray-200 dark:border-zinc-700 focus:ring-[#059669]/20"
                  } bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 transition-all`}
                />
                {errors.amount && (
                  <p className="text-xs text-rose-500">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Value Label (INR)
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  placeholder="e.g., INR 1499"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/20 transition-all"
                />
              </div>
            </div>

            {/* Brand and Stock Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Brand.
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="e.g., Boat"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Stock (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/20 transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/20 transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Product Image
              </label>
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-zinc-700 shrink-0">
                    <img
                      src={resolveAssetUrl(formData.image)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("image", "");
                      }}
                      className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center bg-gray-50 dark:bg-zinc-800/50 shrink-0">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <label
                    className={`w-full ${SECONDARY_BUTTON} cursor-pointer flex items-center justify-center gap-2`}
                  >
                    <Upload size={16} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadState?.status && (
                    <p className="text-xs text-emerald-500">
                      {uploadState.status}
                    </p>
                  )}
                  {uploadState?.error && (
                    <p className="text-xs text-rose-500">{uploadState.error}</p>
                  )}
                  {errors.image && (
                    <p className="text-xs text-rose-500">{errors.image}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Product description..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/20 transition-all resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 ${SECONDARY_BUTTON}`}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className={`flex-1 ${PRIMARY_BUTTON}`}
          >
            {isSaving
              ? "Saving..."
              : product?.id && product.isEditing
                ? "Update Product"
                : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedeemProductModal;
