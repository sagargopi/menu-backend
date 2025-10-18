const express = require("express")
const { body, validationResult, param, query } = require("express-validator")
const SubCategory = require("../models/SubCategory")
const Category = require("../models/Category")

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

// GET all subcategories with optional category filter
router.get(
  "/",
  query("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const filter = {}
      if (req.query.categoryId) {
        filter.categoryId = req.query.categoryId
      }

      const subcategories = await SubCategory.find(filter).populate("categoryId", "name").sort({ createdAt: -1 })

      res.json({
        success: true,
        data: subcategories,
        count: subcategories.length,
      })
    } catch (error) {
      next(error)
    }
  },
)

// GET subcategory by name (exact), optional category filter
router.get(
  "/by-name/:name",
  query("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const filter = { name: req.params.name.trim() }
      if (req.query.categoryId) filter.categoryId = req.query.categoryId
      const subcategory = await SubCategory.findOne(filter).populate("categoryId", "name")
      if (!subcategory) {
        return res.status(404).json({ success: false, message: "SubCategory not found" })
      }
      res.json({ success: true, data: subcategory })
    } catch (error) {
      next(error)
    }
  },
)

// GET subcategory by ID
router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid subcategory ID"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const subcategory = await SubCategory.findById(req.params.id).populate("categoryId", "name")

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message: "SubCategory not found",
        })
      }

      res.json({
        success: true,
        data: subcategory,
      })
    } catch (error) {
      next(error)
    }
  },
)

// CREATE new subcategory
router.post(
  "/",
  body("name")
    .trim()
    .notEmpty()
    .withMessage("SubCategory name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("SubCategory name must be between 2 and 100 characters"),
  body("categoryId").isMongoId().withMessage("Valid category ID is required"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("taxApplicability").optional().isBoolean().withMessage("taxApplicability must be a boolean"),
  body("tax").optional().isFloat({ min: 0 }).withMessage("tax must be a non-negative number"),
  body("taxType").optional().isString().withMessage("taxType must be a string"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, categoryId, description, image, taxApplicability, tax, taxType } = req.body

      // Verify category exists
      const category = await Category.findById(categoryId)
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        })
      }

      // Check if subcategory already exists for this category
      const existingSubCategory = await SubCategory.findOne({
        name,
        categoryId,
      })
      if (existingSubCategory) {
        return res.status(409).json({
          success: false,
          message: "SubCategory with this name already exists in this category",
        })
      }

      const subcategory = new SubCategory({
        name,
        categoryId,
        description,
        image,
        taxApplicability: taxApplicability !== undefined ? taxApplicability : category.taxApplicability,
        tax: tax !== undefined ? tax : category.tax,
        taxType: taxType !== undefined ? taxType : category.taxType,
      })

      await subcategory.save()
      await subcategory.populate("categoryId", "name")

      res.status(201).json({
        success: true,
        message: "SubCategory created successfully",
        data: subcategory,
      })
    } catch (error) {
      next(error)
    }
  },
)

// UPDATE subcategory
router.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid subcategory ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("SubCategory name must be between 2 and 100 characters"),
  body("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("taxApplicability").optional().isBoolean().withMessage("taxApplicability must be a boolean"),
  body("tax").optional().isFloat({ min: 0 }).withMessage("tax must be a non-negative number"),
  body("taxType").optional().isString().withMessage("taxType must be a string"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, categoryId, description, image, isActive, taxApplicability, tax, taxType } = req.body

      // If categoryId is being updated, verify it exists
      if (categoryId) {
        const category = await Category.findById(categoryId)
        if (!category) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          })
        }
      }

      // Check if new name already exists in the category
      if (name || categoryId) {
        const updateCategoryId = categoryId || (await SubCategory.findById(req.params.id)).categoryId
        const existingSubCategory = await SubCategory.findOne({
          name: name || (await SubCategory.findById(req.params.id)).name,
          categoryId: updateCategoryId,
          _id: { $ne: req.params.id },
        })
        if (existingSubCategory) {
          return res.status(409).json({
            success: false,
            message: "SubCategory with this name already exists in this category",
          })
        }
      }

      const subcategory = await SubCategory.findByIdAndUpdate(
        req.params.id,
        { name, categoryId, description, image, isActive, taxApplicability, tax, taxType },
        { new: true, runValidators: true },
      ).populate("categoryId", "name")

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message: "SubCategory not found",
        })
      }

      res.json({
        success: true,
        message: "SubCategory updated successfully",
        data: subcategory,
      })
    } catch (error) {
      next(error)
    }
  },
)

// DELETE subcategory
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid subcategory ID"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const subcategory = await SubCategory.findByIdAndDelete(req.params.id)

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message: "SubCategory not found",
        })
      }

      res.json({
        success: true,
        message: "SubCategory deleted successfully",
        data: subcategory,
      })
    } catch (error) {
      next(error)
    }
  },
)

module.exports = router
