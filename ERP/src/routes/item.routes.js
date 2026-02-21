import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { itemUpload } from "../middlewares/upload.middleware.js";
import * as itemController from "../controllers/item.controllers.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Create item (with optional image upload)
router.post("/createitem", itemUpload.single('image'), itemController.createItem);

// Get all items
router.get("/getallitems", itemController.getAllItems);

// Get item by ID
router.get("/getitembyid/:id", itemController.getItemById);

// Update item (with optional image upload)
router.patch("/updateitem/:id", itemUpload.single('image'), itemController.updateItem);

// Delete item
router.delete("/deleteitem/:id", itemController.deleteItem);

export default router;
