const mongoose = require("mongoose")

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name is required"],
      trim: true,
      minlength: [2, "SubCategory name must be at least 2 characters"],
      maxlength: [100, "SubCategory name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    image: {
      type: String,
      default: null,
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
    taxType: {
      type: String,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Compound unique index for name within a category
subCategorySchema.index({ name: 1, categoryId: 1 }, { unique: true })

module.exports = mongoose.model("SubCategory", subCategorySchema)
