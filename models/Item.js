const mongoose = require("mongoose")

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [2, "Item name must be at least 2 characters"],
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    baseAmount: {
      type: Number,
      required: [true, "Base Amount is required"],
      min: [0, "Base Amount cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total Amount is required"],
      min: [0, "Total Amount cannot be negative"],
    },
    taxApplicability: {
      type: Boolean,
      default: undefined,
    },
    tax: {
      type: Number,
      default: undefined,
      min: [0, "Tax cannot be negative"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: false,
    },
    image: {
      type: String,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
)

// Index for search functionality
itemSchema.index({ name: "text", description: "text", tags: "text" })
itemSchema.index({ categoryId: 1, subCategoryId: 1 })

module.exports = mongoose.model("Item", itemSchema)
