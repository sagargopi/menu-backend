const express = require("express")
const { body, validationResult, param } = require("express-validator")
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

// GET all categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 })
    res.json({
      success: true,
      data: categories,
      count: categories.length,
    })
  } catch (error) {
    next(error)
  }
})

// GET category by name (exact)
router.get(
  "/by-name/:name",
  async (req, res, next) => {
    try {
      const category = await Category.findOne({ name: req.params.name.trim() })
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" })
      }
      res.json({ success: true, data: category })
    } catch (error) {
      next(error)
    }
  },
)

// GET category by ID
router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid category ID"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const category = await Category.findById(req.params.id)
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        })
      }
      res.json({
        success: true,
        data: category,
      })
    } catch (error) {
      next(error)
    }
  },
)

// CREATE new category
router.post(
  "/",
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("taxApplicability").optional().isBoolean().withMessage("taxApplicability must be a boolean"),
  body("tax").optional().isFloat({ min: 0 }).withMessage("tax must be a non-negative number"),
  body("taxType").optional().isString().withMessage("taxType must be a string"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, description, image, taxApplicability, tax, taxType } = req.body

      // Check if category already exists
      const existingCategory = await Category.findOne({ name })
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Category with this name already exists",
        })
      }

      const category = new Category({
        name,
        description,
        image,
        taxApplicability,
        tax,
        taxType,
      })

      await category.save()
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      })
    } catch (error) {
      next(error)
    }
  },
)

// UPDATE category
router.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid category ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("taxApplicability").optional().isBoolean().withMessage("taxApplicability must be a boolean"),
  body("tax").optional().isFloat({ min: 0 }).withMessage("tax must be a non-negative number"),
  body("taxType").optional().isString().withMessage("taxType must be a string"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, description, image, isActive, taxApplicability, tax, taxType } = req.body

      // Check if new name already exists (if name is being updated)
      if (name) {
        const existingCategory = await Category.findOne({
          name,
          _id: { $ne: req.params.id },
        })
        if (existingCategory) {
          return res.status(409).json({
            success: false,
            message: "Category with this name already exists",
          })
        }
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { name, description, image, isActive, taxApplicability, tax, taxType },
        { new: true, runValidators: true },
      )

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        })
      }

      res.json({
        success: true,
        message: "Category updated successfully",
        data: category,
      })
    } catch (error) {
      next(error)
    }
  },
)

// DELETE category
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid category ID"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id)

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        })
      }

      res.json({
        success: true,
        message: "Category deleted successfully",
        data: category,
      })
    } catch (error) {
      next(error)
    }
  },
)

module.exports = router
