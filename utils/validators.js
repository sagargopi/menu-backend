const { body, param, query } = require("express-validator")

// Category validators
const validateCreateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
]

const validateUpdateCategory = [
  param("id").isMongoId().withMessage("Invalid category ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
]

// SubCategory validators
const validateCreateSubCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("SubCategory name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("SubCategory name must be between 2 and 100 characters"),
  body("categoryId").isMongoId().withMessage("Valid category ID is required"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
]

// Item validators
const validateCreateItem = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Item name must be between 2 and 100 characters"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("categoryId").isMongoId().withMessage("Valid category ID is required"),
  body("subCategoryId").isMongoId().withMessage("Valid subcategory ID is required"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isAvailable").optional().isBoolean().withMessage("isAvailable must be a boolean"),
]

const validateUpdateItem = [
  param("id").isMongoId().withMessage("Invalid item ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Item name must be between 2 and 100 characters"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
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
]

const validateSearch = [
  query("q").trim().notEmpty().withMessage("Search query is required"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
]

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCreateSubCategory,
  validateCreateItem,
  validateUpdateItem,
  validateSearch,
}
