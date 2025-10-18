const express = require("express")
const { body, validationResult, param, query } = require("express-validator")
const Item = require("../models/Item")
const Category = require("../models/Category")
const SubCategory = require("../models/SubCategory")

const router = express.Router()

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// GET all items with optional filters
router.get(
  "/",
  query("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  query("subCategoryId").optional().isMongoId().withMessage("Invalid subcategory ID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const filter = {}
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      if (req.query.categoryId) {
        filter.categoryId = req.query.categoryId
      }
      if (req.query.subCategoryId) {
        filter.subCategoryId = req.query.subCategoryId
      }

      const items = await Item.find(filter)
        .populate("categoryId", "name")
        .populate("subCategoryId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      const total = await Item.countDocuments(filter)

      res.json({
        success: true,
        data: items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

// SEARCH items by name, description, or tags
router.get(
  "/search/query",
  query("q").trim().notEmpty().withMessage("Search query is required"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const searchQuery = req.query.q
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      const items = await Item.find({ $text: { $search: searchQuery } }, { score: { $meta: "textScore" } })
        .populate("categoryId", "name")
        .populate("subCategoryId", "name")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)

      const total = await Item.countDocuments({ $text: { $search: searchQuery } })

      res.json({
        success: true,
        data: items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        query: searchQuery,
      })
    } catch (error) {
      next(error)
    }
  },
)

// GET item by ID
router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid item ID"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const item = await Item.findById(req.params.id).populate("categoryId", "name").populate("subCategoryId", "name")

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        })
      }

      res.json({
        success: true,
        data: item,
      })
    } catch (error) {
      next(error)
    }
  },
)

// CREATE new item
router.post(
  "/",
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Item name must be between 2 and 100 characters"),
  body("baseAmount").isFloat({ min: 0 }).withMessage("Base Amount must be a positive number"),
  body("discount").optional().isFloat({ min: 0 }).withMessage("Discount must be a non-negative number"),
  body("taxApplicability").optional().isBoolean().withMessage("taxApplicability must be a boolean"),
  body("tax").optional().isFloat({ min: 0 }).withMessage("tax must be a non-negative number"),
  body("categoryId").isMongoId().withMessage("Valid category ID is required"),
  body("subCategoryId").optional().isMongoId().withMessage("Invalid subcategory ID"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isAvailable").optional().isBoolean().withMessage("isAvailable must be a boolean"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, baseAmount, discount = 0, taxApplicability, tax, categoryId, subCategoryId, description, image, tags, isAvailable } = req.body

      // Verify category exists
      const category = await Category.findById(categoryId)
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" })
      }

      // If subcategory is provided, verify it exists and belongs to the category
      if (subCategoryId) {
        const subCategory = await SubCategory.findById(subCategoryId)
        if (!subCategory) {
          return res.status(404).json({ success: false, message: "SubCategory not found" })
        }
        if (subCategory.categoryId.toString() !== categoryId) {
          return res.status(400).json({ success: false, message: "SubCategory does not belong to the specified Category" })
        }
      }

      const computedTotal = Math.max(0, (Number(baseAmount) || 0) - (Number(discount) || 0))

      const item = new Item({
        name,
        baseAmount,
        discount,
        totalAmount: computedTotal,
        taxApplicability,
        tax,
        categoryId,
        subCategoryId,
        description,
        image,
        tags: tags || [],
        isAvailable,
      })

      await item.save()
      await item.populate("categoryId", "name")
      await item.populate("subCategoryId", "name")

      res.status(201).json({ success: true, message: "Item created successfully", data: item })
    } catch (error) {
      next(error)
    }
  },
)

// UPDATE item
router.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid item ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Item name must be between 2 and 100 characters"),
  body("baseAmount").optional().isFloat({ min: 0 }).withMessage("Base Amount must be a positive number"),
  body("discount").optional().isFloat({ min: 0 }).withMessage("Discount must be a non-negative number"),
  body("taxApplicability").optional().isBoolean().withMessage("taxApplicability must be a boolean"),
  body("tax").optional().isFloat({ min: 0 }).withMessage("tax must be a non-negative number"),
  body("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  body("subCategoryId").optional().isMongoId().withMessage("Invalid subcategory ID"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isAvailable").optional().isBoolean().withMessage("isAvailable must be a boolean"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, baseAmount, discount, taxApplicability, tax, categoryId, subCategoryId, description, image, tags, isAvailable } = req.body

      // If categoryId or subCategoryId is being updated, verify they exist
      if (categoryId) {
        const category = await Category.findById(categoryId)
        if (!category) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          })
        }
      }

      if (subCategoryId) {
        const subCategory = await SubCategory.findById(subCategoryId)
        if (!subCategory) {
          return res.status(404).json({
            success: false,
            message: "SubCategory not found",
          })
        }

        // Verify subcategory belongs to the category
        const updateCategoryId = categoryId || (await Item.findById(req.params.id)).categoryId
        if (subCategory.categoryId.toString() !== updateCategoryId.toString()) {
          return res.status(400).json({
            success: false,
            message: "SubCategory does not belong to the specified Category",
          })
        }
      }

      // Compute totalAmount if baseAmount or discount provided; otherwise keep existing
      let updateDoc = { name, categoryId, subCategoryId, description, image, tags, isAvailable, taxApplicability, tax }
      if (baseAmount !== undefined || discount !== undefined) {
        const existing = await Item.findById(req.params.id)
        if (!existing) {
          return res.status(404).json({ success: false, message: "Item not found" })
        }
        const newBase = baseAmount !== undefined ? Number(baseAmount) : Number(existing.baseAmount)
        const newDiscount = discount !== undefined ? Number(discount) : Number(existing.discount)
        updateDoc.baseAmount = newBase
        updateDoc.discount = newDiscount
        updateDoc.totalAmount = Math.max(0, newBase - newDiscount)
      }

      const item = await Item.findByIdAndUpdate(
        req.params.id,
        updateDoc,
        { new: true, runValidators: true },
      )
        .populate("categoryId", "name")
        .populate("subCategoryId", "name")

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        })
      }

      res.json({
        success: true,
        message: "Item updated successfully",
        data: item,
      })
    } catch (error) {
      next(error)
    }
  },
)

// DELETE item
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid item ID"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const item = await Item.findByIdAndDelete(req.params.id)

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        })
      }

      res.json({
        success: true,
        message: "Item deleted successfully",
        data: item,
      })
    } catch (error) {
      next(error)
    }
  },
)

module.exports = router
