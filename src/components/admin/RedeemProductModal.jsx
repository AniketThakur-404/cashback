import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../../styles/buttonStyles";
import { getApiBaseUrl, resolvePublicAssetUrl as resolveAssetUrl } from "../../lib/apiClient";
import AuthImage from "../AuthImage";
import { uploadImage } from "../../lib/api";
import { getAuthToken } from "../../lib/auth";


const MAX_IMAGE_SIZE_MB = 10;

const RedeemProductModal = ({
  product,
  onClose,
  onSave,
  isSaving,
}) => {
  const [internalUploadState, setInternalUploadState] = useState({ status: "", error: "" });
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
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [localPreviewUrls, setLocalPreviewUrls] = useState([]);
  const localPreviewUrlsRef = useRef([]);

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
        images: Array.isArray(product.images)
          ? [...new Set([product.image, ...product.images].filter(Boolean))]
          : product.image
            ? [product.image]
            : [],
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

  const productImages = Array.isArray(formData.images)
    ? formData.images.filter(Boolean)
    : formData.image
      ? [formData.image]
      : [];

  useEffect(
    () => () => {
      localPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const oversizedFile = files.find(
      (file) => file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024,
    );
    if (oversizedFile) {
      setErrors((prev) => ({
        ...prev,
        image: `Each image must be ${MAX_IMAGE_SIZE_MB}MB or smaller.`,
      }));
      e.target.value = "";
      return;
    }

    const previewEntries = files.map((file) => URL.createObjectURL(file));
    localPreviewUrlsRef.current = [
      ...localPreviewUrlsRef.current,
      ...previewEntries,
    ];
    setLocalPreviewUrls((prev) => [...prev, ...previewEntries]);
    
    setInternalUploadState({ status: "Uploading...", error: "" });
    const token = getAuthToken();

    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (!token) throw new Error("Sign in to upload.");
        const data = await uploadImage(token, file);
        if (data?.url) {
          uploadedUrls.push(data.url);
        }
      }

      setFormData((prev) => {
        const currentImages = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
        const nextImages = [...new Set([...currentImages, ...uploadedUrls].filter(Boolean))];
        return {
          ...prev,
          image: prev.image || uploadedUrls[0],
          images: nextImages,
        };
      });
      setInternalUploadState({ status: "Product image uploaded.", error: "" });
    } catch (err) {
      setInternalUploadState({ status: "", error: err.message || "Upload failed." });
    } finally {
      e.target.value = "";
    }
  };

  const setPrimaryImage = (image) => {
    if (image.startsWith("blob:")) return;
    setFormData((prev) => ({
      ...prev,
      image,
      images: [image, ...productImages.filter((item) => item !== image)],
    }));
  };

  const removeProductImage = (image) => {
    const nextImages = productImages.filter((item) => item !== image);
    if (image.startsWith("blob:")) {
      URL.revokeObjectURL(image);
      localPreviewUrlsRef.current = localPreviewUrlsRef.current.filter(
        (item) => item !== image,
      );
      setLocalPreviewUrls((prev) => prev.filter((item) => item !== image));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      image: prev.image === image ? nextImages[0] || "" : prev.image,
      images: nextImages,
    }));
  };

  useEffect(() => {
    if (product?.image) {
      setFormData((prev) => ({
        ...prev,
        image: product.image,
        images: Array.isArray(product.images)
          ? [...new Set([product.image, ...product.images].filter(Boolean))]
          : [product.image],
      }));
    }
  }, [product?.image, product?.images]);

  // Sync image from props if it changes (e.g. after upload)
  useEffect(() => {
    if (internalUploadState?.status && formData?.image) {
      const statusLower = internalUploadState?.status?.toLowerCase() || "";
      // Clear local previews to avoid double images since they are now in product.images
      // Only do this when upload is successful, not when it's 'uploading'
      if (statusLower.includes("success") || statusLower.includes("uploaded")) {
         localPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
         localPreviewUrlsRef.current = [];
         setLocalPreviewUrls([]);
      }
    }
  }, [internalUploadState, formData.image]);

  useEffect(() => {
    if (formData.image && !formData.image.startsWith("blob:")) {
      localPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      localPreviewUrlsRef.current = [];
      setLocalPreviewUrls([]);
    }
  }, [formData.image]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section with back button and title */}
      <div className="flex items-center gap-4 pb-2 border-b border-slate-200/60 dark:border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
        >
          <X size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {product?.id && product.isEditing ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Fill in the details below to publish this product to the catalog.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0f0f11] shadow-xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
        <form onSubmit={handleSubmit} className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x divide-slate-200/60 dark:divide-white/10">
            
            {/* Left Column: Basic Details */}
            <div className="p-6 md:p-8 lg:col-span-7 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">1</span>
                  Basic Information
                </h3>
                
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                          : "border-slate-200 dark:border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
                      } bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 transition-all outline-none`}
                    />
                    {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                            : "border-slate-200 dark:border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
                        } bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 transition-all outline-none`}
                      />
                      {errors.id && <p className="text-xs text-rose-500">{errors.id}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleChange("brand", e.target.value)}
                        placeholder="e.g., Boat"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        placeholder="e.g., Popular"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none"
                      >
                        <option value="active">Active (Visible to users)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Write a compelling product description..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Media */}
            <div className="p-6 md:p-8 lg:col-span-5 space-y-8 bg-slate-50/50 dark:bg-white/[0.02]">
              
              {/* Pricing & Inventory */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">2</span>
                  Pricing & Inventory
                </h3>
                
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                      <span>Points Required *</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">Coin Value</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-medium">✨</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleChange("amount", e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                          errors.amount
                            ? "border-rose-500 focus:ring-rose-500/20"
                            : "border-slate-200 dark:border-white/10 focus:ring-emerald-500/20 focus:border-emerald-500"
                        } bg-white dark:bg-[#0f0f11] text-slate-900 dark:text-white focus:ring-2 transition-all outline-none font-semibold text-lg`}
                      />
                    </div>
                    {errors.amount && <p className="text-xs text-rose-500">{errors.amount}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Value Label (INR)
                      </label>
                      <input
                        type="text"
                        value={formData.value}
                        onChange={(e) => handleChange("value", e.target.value)}
                        placeholder="e.g., INR 1499"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f0f11] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleChange("stock", e.target.value)}
                        placeholder="Unlimited"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f0f11] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200/60 dark:border-white/10" />

              {/* Media */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">3</span>
                    Product Images
                  </h3>
                  <label className="cursor-pointer text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                    <Upload size={14} />
                    Upload
                    <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="hidden" />
                  </label>
                </div>
                
                <div className="space-y-3">
                  <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 transition-colors hover:border-indigo-400 dark:hover:border-indigo-500/50">
                    {[...localPreviewUrls, ...productImages].length ? (
                      <div className="grid grid-cols-3 gap-3">
                        {[...localPreviewUrls, ...productImages].map((image, index) => {
                          const isLocalPreview = image.startsWith("blob:");
                          const isPrimary = image === formData.image || (!formData.image && index === 0);
                          return (
                            <div
                              key={`${image}-${index}`}
                              className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-slate-50 dark:bg-black/20 ${
                                isPrimary
                                  ? "border-indigo-500 ring-2 ring-indigo-500/20"
                                  : "border-transparent"
                              }`}
                            >
                               <AuthImage
                                src={resolveAssetUrl(image)}
                                alt={`Product ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute top-2 right-2 flex flex-col gap-1">
                                  <button
                                    type="button"
                                    onClick={() => removeProductImage(image)}
                                    className="p-1.5 rounded-md bg-rose-500/90 text-white hover:bg-rose-600 backdrop-blur-sm transition-colors shadow-sm"
                                  >
                                    <X size={12} strokeWidth={3} />
                                  </button>
                                </div>
                                <div className="absolute bottom-2 left-2 right-2">
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryImage(image)}
                                    disabled={isLocalPreview}
                                    className={`w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-sm transition-colors ${
                                      isPrimary
                                        ? "bg-indigo-500 text-white"
                                        : "bg-white/80 dark:bg-black/60 text-slate-800 dark:text-white hover:bg-white dark:hover:bg-black/80"
                                    }`}
                                  >
                                    {isPrimary ? "Primary" : "Make Primary"}
                                  </button>
                                </div>
                              </div>
                              {isPrimary && (
                                <div className="absolute top-1.5 left-1.5 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                  Main
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-8 cursor-pointer text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                          <ImageIcon size={24} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Drop images here
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          PNG, JPG up to {MAX_IMAGE_SIZE_MB}MB
                        </span>
                        <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Upload State Feedback */}
                  {(internalUploadState?.status || internalUploadState?.error || errors.image) && (
                    <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      internalUploadState?.error || errors.image 
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {internalUploadState?.error || errors.image ? <AlertCircle size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                      {internalUploadState?.error || errors.image || internalUploadState?.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 md:p-8 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/80 dark:bg-black/20 backdrop-blur-md rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors shadow-sm"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : product?.id && product.isEditing ? (
                "Update Product"
              ) : (
                "Add Product to Catalog"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RedeemProductModal;
