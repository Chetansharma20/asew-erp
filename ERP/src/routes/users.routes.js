import { Router } from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateCurrentUser,
    deleteCurrentUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUserStats
} from "../controllers/users.controllers.js"
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js"

import { User } from "../models/users.models.js"

const router = Router()

// Public Routes
router.post('/login', loginUser)

// Secured Routes
router.post('/register', async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            return registerUser(req, res, next);
        }

        return verifyJWT(req, res, (err) => {
            if (err) return next(err);

            // Call authorizeRoles middleware
            authorizeRoles("ADMIN", "SUPER_ADMIN", "SUB_ADMIN")(req, res, (authErr) => {
                if (authErr) return next(authErr);
                // If authorized, proceed to the actual controller
                return registerUser(req, res, next);
            });
        });
    } catch (error) {
        next(error);
    }
})
router.post("/logout", verifyJWT, logoutUser)
router.get("/get-current-user", verifyJWT, getCurrentUser)
router.patch("/update-current-user", verifyJWT, updateCurrentUser)
router.delete("/delete-current-user", verifyJWT, deleteCurrentUser)

// Admin/Moderator Routes (Example: restrict getAllUsers to admin)
router.get("/get-all-users", verifyJWT, authorizeRoles("ADMIN", "SUPER_ADMIN", "SUB_ADMIN", "STAFF"), getAllUsers)

// Specific ID Routes
router.get("/get-user-by-id/:id", verifyJWT, getUserById)
router.patch("/update-user-by-id/:id", verifyJWT, updateUserById)
router.delete("/delete-user-by-id/:id", verifyJWT, deleteUserById)
router.get("/get-user-stats", verifyJWT, authorizeRoles("ADMIN", "SUPER_ADMIN", "SUB_ADMIN"), getUserStats)

export default router
