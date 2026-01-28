const express = require("express");
const router = express.Router();
const { uploadImage} = require("../middleware/uploads");
const { protect } = require("../middleware/auth");

const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  uploadItemPhoto,
} = require("../controller/item_controller");

// Error handler for upload endpoint
const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error("Upload error:", err);
    return res.status(400).json({ 
      message: err.message || 'File upload failed' 
    });
  }
  next();
};

// Upload routes (protected - user must be logged in to upload)
router.post("/upload-photo", protect, uploadImage.single("ItemPhoto"), handleUploadError, uploadItemPhoto);

// CRUD routes - create item with optional photo
router.post("/new_item", protect, uploadImage.single("ItemPhoto"), handleUploadError, createItem);
router.get("/", protect, getAllItems);
router.get("/:id", getItemById);
router.put("/:id", uploadImage.single("ItemPhoto"), handleUploadError, updateItem); // yo aaile chaleko xoina
router.delete("/:id", protect, deleteItem);

module.exports = router;
