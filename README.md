# Menu Management Backend API

A comprehensive Node.js + Express backend for managing hierarchical menu structures with MongoDB. This API provides complete CRUD operations for categories, subcategories, and menu items with advanced search functionality.

## Features

- **Hierarchical Menu Structure**: Category → SubCategory → Items
- **Complete CRUD Operations**: Create, Read, Update, Delete for all entities
- **Advanced Search**: Full-text search across item names, descriptions, and tags
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with meaningful error messages
- **Pagination**: Built-in pagination support for list endpoints
- **MongoDB Integration**: Mongoose ODM for database operations
- **RESTful API**: Standard REST conventions for all endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd menu-backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file in the root directory:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update `.env` with your MongoDB connection string:
\`\`\`
MONGODB_URI=mongodb://localhost:27017/menu_db
PORT=5000
NODE_ENV=development
\`\`\`

5. Start the server:
\`\`\`bash
npm run dev
\`\`\`

The server will run on `http://localhost:5000`

## API Endpoints

### Categories

#### Get All Categories
\`\`\`
GET /api/categories
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Beverages",
      "description": "All types of drinks",
      "image": "https://example.com/beverages.jpg",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
\`\`\`

#### Get Category by ID
\`\`\`
GET /api/categories/:id
\`\`\`

#### Create Category
\`\`\`
POST /api/categories
Content-Type: application/json

{
  "name": "Beverages",
  "description": "All types of drinks",
  "image": "https://example.com/beverages.jpg"
}
\`\`\`

#### Update Category
\`\`\`
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Updated Beverages",
  "description": "Updated description",
  "isActive": true
}
\`\`\`

#### Delete Category
\`\`\`
DELETE /api/categories/:id
\`\`\`

### SubCategories

#### Get All SubCategories
\`\`\`
GET /api/subcategories
\`\`\`

**Query Parameters:**
- `categoryId` (optional): Filter by category ID

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Hot Beverages",
      "description": "Coffee, tea, and hot drinks",
      "categoryId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Beverages"
      },
      "image": "https://example.com/hot-beverages.jpg",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
\`\`\`

#### Get SubCategory by ID
\`\`\`
GET /api/subcategories/:id
\`\`\`

#### Create SubCategory
\`\`\`
POST /api/subcategories
Content-Type: application/json

{
  "name": "Hot Beverages",
  "categoryId": "507f1f77bcf86cd799439011",
  "description": "Coffee, tea, and hot drinks",
  "image": "https://example.com/hot-beverages.jpg"
}
\`\`\`

#### Update SubCategory
\`\`\`
PUT /api/subcategories/:id
Content-Type: application/json

{
  "name": "Updated Hot Beverages",
  "description": "Updated description",
  "isActive": true
}
\`\`\`

#### Delete SubCategory
\`\`\`
DELETE /api/subcategories/:id
\`\`\`

### Items

#### Get All Items
\`\`\`
GET /api/items
\`\`\`

**Query Parameters:**
- `categoryId` (optional): Filter by category ID
- `subCategoryId` (optional): Filter by subcategory ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Espresso",
      "description": "Strong Italian coffee",
      "price": 3.50,
      "categoryId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Beverages"
      },
      "subCategoryId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Hot Beverages"
      },
      "image": "https://example.com/espresso.jpg",
      "isAvailable": true,
      "tags": ["coffee", "italian", "strong"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
\`\`\`

#### Search Items
\`\`\`
GET /api/items/search/query?q=espresso&page=1&limit=10
\`\`\`

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Espresso",
      "description": "Strong Italian coffee",
      "price": 3.50,
      "categoryId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Beverages"
      },
      "subCategoryId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Hot Beverages"
      },
      "image": "https://example.com/espresso.jpg",
      "isAvailable": true,
      "tags": ["coffee", "italian", "strong"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  },
  "query": "espresso"
}
\`\`\`

#### Get Item by ID
\`\`\`
GET /api/items/:id
\`\`\`

#### Create Item
\`\`\`
POST /api/items
Content-Type: application/json

{
  "name": "Espresso",
  "description": "Strong Italian coffee",
  "price": 3.50,
  "categoryId": "507f1f77bcf86cd799439011",
  "subCategoryId": "507f1f77bcf86cd799439012",
  "image": "https://example.com/espresso.jpg",
  "tags": ["coffee", "italian", "strong"],
  "isAvailable": true
}
\`\`\`

#### Update Item
\`\`\`
PUT /api/items/:id
Content-Type: application/json

{
  "name": "Updated Espresso",
  "price": 4.00,
  "description": "Updated description",
  "isAvailable": true
}
\`\`\`

#### Delete Item
\`\`\`
DELETE /api/items/:id
\`\`\`

## Error Handling

All endpoints return consistent error responses:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "name",
      "message": "Category name is required"
    }
  ]
}
\`\`\`

### Common Error Codes

- `400`: Bad Request - Validation failed
- `404`: Not Found - Resource not found
- `409`: Conflict - Duplicate entry
- `500`: Internal Server Error

## Data Models

### Category
\`\`\`javascript
{
  name: String (required, unique, 2-100 chars),
  description: String (max 500 chars),
  image: String (URL),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### SubCategory
\`\`\`javascript
{
  name: String (required, 2-100 chars),
  description: String (max 500 chars),
  categoryId: ObjectId (required, ref: Category),
  image: String (URL),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Item
\`\`\`javascript
{
  name: String (required, 2-100 chars),
  description: String (max 1000 chars),
  price: Number (required, min: 0),
  categoryId: ObjectId (required, ref: Category),
  subCategoryId: ObjectId (required, ref: SubCategory),
  image: String (URL),
  isAvailable: Boolean (default: true),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Project Structure

\`\`\`
menu-backend/
├── models/
│   ├── Category.js
│   ├── SubCategory.js
│   └── Item.js
├── routes/
│   ├── categoryRoutes.js
│   ├── subcategoryRoutes.js
│   └── itemRoutes.js
├── middleware/
│   ├── errorHandler.js
│   └── validation.js
├── utils/
│   └── validators.js
├── config/
│   └── database.js
├── server.js
├── .env.example
├── package.json
└── README.md
\`\`\`

## Testing the API

You can test the API using tools like Postman, Insomnia, or cURL.

### Example cURL Commands

**Create a Category:**
\`\`\`bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beverages",
    "description": "All types of drinks"
  }'
\`\`\`

**Get All Categories:**
\`\`\`bash
curl http://localhost:5000/api/categories
\`\`\`

**Search Items:**
\`\`\`bash
curl "http://localhost:5000/api/items/search/query?q=espresso"
\`\`\`

## Development

To run the server in development mode with auto-reload:
\`\`\`bash
npm run dev
\`\`\`

## Production

To run the server in production:
\`\`\`bash
npm start
\`\`\`

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
