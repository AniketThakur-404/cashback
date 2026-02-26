import React, { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../styles/buttonStyles";
import { getApiBaseUrl } from "../lib/apiClient";

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

const PACK_SIZE_UNITS = ["g", "kg", "ml", "L", "pcs"];
const WARRANTY_UNITS = ["months", "years"];

const parseValueUnit = (combined, unitList, defaultUnit) => {
  if (!combined) return { value: "", unit: defaultUnit };
  const str = String(combined).trim();
  for (const u of unitList) {
    if (str.toLowerCase().endsWith(u.toLowerCase())) {
      const numPart = str.slice(0, str.length - u.length).trim();
      return { value: numPart, unit: u };
    }
  }
  const match = str.match(/^([\d.]+)\s*(.*)$/);
  if (match) {
    const foundUnit = unitList.find(
      (u) => u.toLowerCase() === (match[2] || "").toLowerCase(),
    );
    return { value: match[1], unit: foundUnit || defaultUnit };
  }
  return { value: str, unit: defaultUnit };
};

const ProductEditModal = ({ product, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    mrp: "",
    packSize: "",
    warranty: "",
    imageUrl: "",
    description: "",
    status: "active",
  });
  const [packSizeValue, setPackSizeValue] = useState("");
  const [packSizeUnit, setPackSizeUnit] = useState(PACK_SIZE_UNITS[0]);
  const [warrantyValue, setWarrantyValue] = useState("");
  const [warrantyUnit, setWarrantyUnit] = useState(WARRANTY_UNITS[0]);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        mrp: product.mrp || "",
        packSize: product.packSize || "",
        warranty: product.warranty || "",
        imageUrl: product.imageUrl || "",
        description: product.description || "",
        status: product.status || "active",
      });
      const ps = parseValueUnit(
        product.packSize,
        PACK_SIZE_UNITS,
        PACK_SIZE_UNITS[0],
      );
      setPackSizeValue(ps.value);
      setPackSizeUnit(ps.unit);
      const wr = parseValueUnit(
        product.warranty,
        WARRANTY_UNITS,
        WARRANTY_UNITS[0],
      );
      setWarrantyValue(wr.value);
      setWarrantyUnit(wr.unit);
      setImagePreview(resolveAssetUrl(product.imageUrl || ""));
      setImageFile(null);
    }
  }, [product]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updatePackSize = (val, unit) => {
    setPackSizeValue(val);
    setPackSizeUnit(unit);
    const combined = val ? `${val} ${unit}` : "";
    handleChange("packSize", combined);
  };

  const updateWarranty = (val, unit) => {
    setWarrantyValue(val);
    setWarrantyUnit(unit);
    const combined = val ? `${val} ${unit}` : "";
    handleChange("warranty", combined);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: `Image is too large. Maximum allowed size is ${MAX_IMAGE_SIZE_MB}MB.`,
        }));
        e.target.value = "";
        return;
      }

      setErrors((prev) => ({ ...prev, image: "" }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return previewUrl;
      });
      setImageFile(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.mrp || Number(formData.mrp) <= 0)
      newErrors.mrp = "Valid MRP is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...formData, imageFile });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 pb-safe-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {product?.id ? "Edit Product" : "Add New Product"}
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
          className="p-6 overflow-y-auto ios-scroll max-h-[calc(92dvh-180px)] sm:max-h-[calc(85vh-180px)]"
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
                placeholder="e.g., Premium Wireless Headphones"
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

            {/* SKU and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="e.g., WH-1000XM4"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.sku
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-gray-200 dark:border-zinc-700 focus:ring-[#059669]/20"
                  } bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 transition-all`}
                />
                {errors.sku && (
                  <p className="text-xs text-rose-500">{errors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.category
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-gray-200 dark:border-zinc-700 focus:ring-[#059669]/20"
                  } bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 transition-all`}
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                  <option value="Toys">Toys</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="text-xs text-rose-500">{errors.category}</p>
                )}
              </div>
            </div>

            {/* MRP */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                MRP (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={(e) => handleChange("mrp", e.target.value)}
                placeholder="0.00"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.mrp
                    ? "border-rose-500 focus:ring-rose-500/20"
                    : "border-gray-200 dark:border-zinc-700 focus:ring-[#059669]/20"
                } bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 transition-all`}
              />
              {errors.mrp && (
                <p className="text-xs text-rose-500">{errors.mrp}</p>
              )}
            </div>

            {/* Pack Size and Warranty Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pack Size
                </label>
                <div className="flex rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden focus-within:ring-2 focus-within:ring-[#059669]/20 transition-all">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={packSizeValue}
                    onChange={(e) =>
                      updatePackSize(e.target.value, packSizeUnit)
                    }
                    placeholder="e.g., 500"
                    className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border-0 outline-none focus:ring-0"
                  />
                  <select
                    value={packSizeUnit}
                    onChange={(e) =>
                      updatePackSize(packSizeValue, e.target.value)
                    }
                    className="w-20 px-2 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 border-l border-gray-200 dark:border-zinc-600 outline-none cursor-pointer font-medium text-sm"
                  >
                    {PACK_SIZE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Warranty
                </label>
                <div className="flex rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden focus-within:ring-2 focus-within:ring-[#059669]/20 transition-all">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={warrantyValue}
                    onChange={(e) =>
                      updateWarranty(e.target.value, warrantyUnit)
                    }
                    placeholder="e.g., 12"
                    className="flex-1 min-w-0 px-4 py-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border-0 outline-none focus:ring-0"
                  />
                  <select
                    value={warrantyUnit}
                    onChange={(e) =>
                      updateWarranty(warrantyValue, e.target.value)
                    }
                    className="w-24 px-2 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 border-l border-gray-200 dark:border-zinc-600 outline-none cursor-pointer font-medium text-sm"
                  >
                    {WARRANTY_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Product Image
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-zinc-700 shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        handleChange("imageUrl", "");
                        setImageFile(null);
                      }}
                      className="absolute top-1 right-1 p-1 bg-white/90 dark:bg-black/50 hover:bg-rose-500 hover:text-white text-rose-500 rounded-full transition-colors backdrop-blur-sm shadow-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center bg-gray-50 dark:bg-zinc-800/50 shrink-0">
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
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                    Allowed: JPG, PNG, WEBP up to {MAX_IMAGE_SIZE_MB}MB.
                  </p>
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
                placeholder="Product description, features, specifications..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/20 transition-all resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 ${SECONDARY_BUTTON}`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex-1 ${PRIMARY_BUTTON}`}
          >
            {isLoading
              ? "Saving..."
              : product?.id
                ? "Update Product"
                : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
