import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEdit, FaTrash, FaComments } from "react-icons/fa";
import type { Commission } from "@/lib/types/types";

interface CommissionDetailPopupProps {
  commission: Commission & { display_name?: string };
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onChat?: () => void;
}

export default function CommissionDetailPopup({
  commission,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onChat,
}: CommissionDetailPopupProps) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Not set";
    return `€${price.toFixed(2)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--red-tertiary)]">
              <h2 className="text-xl font-bold text-[var(--red-light)]">
                Commission Details
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--red-muted)] hover:text-[var(--red-primary)] transition-colors p-2"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--red-light)] mb-4">
                    Commission Info
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[var(--red-muted)] text-sm">
                        Category
                      </label>
                      <p className="text-[var(--red-light)] font-medium">
                        {commission.category_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-[var(--red-muted)] text-sm">
                        Type
                      </label>
                      <p className="text-[var(--red-light)] font-medium">
                        {commission.type_name}
                      </p>
                    </div>
                    {commission.subtype_name && (
                      <div>
                        <label className="text-[var(--red-muted)] text-sm">
                          Subtype
                        </label>
                        <p className="text-[var(--red-light)] font-medium">
                          {commission.subtype_name}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-[var(--red-muted)] text-sm">
                        Status
                      </label>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          commission.status === "draft"
                            ? "bg-[var(--tag-draft-bg)] text-[var(--tag-draft-text)]"
                            : commission.status === "submitted"
                            ? "bg-blue-100 text-blue-700"
                            : commission.status === "waitlist"
                            ? "bg-teal-100 text-teal-700"
                            : commission.status === "payment"
                            ? "bg-yellow-100 text-yellow-700"
                            : commission.status === "wip"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {commission.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--red-light)] mb-4">
                    Client Info
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[var(--red-muted)] text-sm">
                        Client
                      </label>
                      <p className="text-[var(--red-light)] font-medium">
                        {commission.display_name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <label className="text-[var(--red-muted)] text-sm">
                        Created
                      </label>
                      <p className="text-[var(--red-light)]">
                        {formatDate(commission.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-[var(--red-muted)] text-sm">
                        Last Updated
                      </label>
                      <p className="text-[var(--red-light)]">
                        {formatDate(commission.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--red-light)] mb-4">
                  Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[var(--red-muted)] text-sm">
                      Base Price
                    </label>
                    <p className="text-[var(--red-light)] font-medium">
                      {formatPrice(commission.base_price)}
                    </p>
                  </div>
                  <div>
                    <label className="text-[var(--red-muted)] text-sm">
                      Total Price
                    </label>
                    <p className="text-[var(--red-light)] font-medium">
                      {formatPrice(commission.total_price)}
                    </p>
                  </div>
                  <div>
                    <label className="text-[var(--red-muted)] text-sm">
                      Final Price
                    </label>
                    <p className="text-[var(--red-light)] font-medium">
                      {formatPrice(commission.final_price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission Details */}
              {commission.comm_specific_data &&
                Object.keys(commission.comm_specific_data).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--red-light)] mb-4">
                      Commission Details
                    </h3>
                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                      <pre className="text-[var(--red-light)] text-sm whitespace-pre-wrap">
                        {JSON.stringify(commission.comm_specific_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

              {/* Extra Info */}
              {commission.extra_info && (
                <div>
                  <h3 className="text-lg font-semibold text-[var(--red-light)] mb-4">
                    Extra Information
                  </h3>
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                    <p className="text-[var(--red-light)] text-sm">
                      {commission.extra_info}
                    </p>
                  </div>
                </div>
              )}

              {/* References */}
              {commission.reference_urls &&
                commission.reference_urls.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--red-light)] mb-4">
                      References ({commission.reference_urls.length})
                    </h3>
                    <div className="space-y-2">
                      {commission.reference_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[var(--red-primary)] hover:text-[var(--red-secondary)] text-sm truncate"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-6 border-t border-[var(--red-tertiary)]">
              <div className="flex gap-3">
                {onChat && (
                  <button
                    onClick={onChat}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--red-primary)] text-white rounded-lg hover:bg-[var(--red-secondary)] transition-colors"
                  >
                    <FaComments />
                    Open Chat
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--red-tertiary)] text-[var(--red-light)] rounded-lg hover:bg-[var(--red-primary)] hover:text-white transition-colors"
                  >
                    <FaEdit />
                    Edit
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTrash />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
