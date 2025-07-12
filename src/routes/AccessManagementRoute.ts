// routes/AccessManagementRoute.ts
import { Router } from "express";
import { AccessManagementController } from "@/controllers/AccessManagementController";
import Container from "typedi";

const router = Router();
const accessController = Container.get(AccessManagementController);

// Create user directly
router.post("/", (req, res) => accessController.createAccess(req, res));

// Get all users
router.get("/", (req, res) => accessController.getAllAccess(req, res));

// Get user by ID
router.get("/:id", (req, res) => accessController.getAccessById(req, res));

// Verify/activate user (previously approve)
router.post("/:id/approve", (req, res) =>
  accessController.approveAccess(req, res)
);

// Delete user (previously reject)
router.post("/:id/reject", (req, res) =>
  accessController.rejectAccess(req, res)
);

// Update user details
router.put("/:id", (req, res) => accessController.updateUser(req, res));

// Check if user exists by email or ID
router.get("/check/:employeeId", (req, res) =>
  accessController.checkEmployee(req, res)
);

// Get users by role
router.get("/role/:role", (req, res) =>
  accessController.getUsersByRole(req, res)
);

// Get users by bank
router.get("/bank/:bankId", (req, res) =>
  accessController.getUsersByBank(req, res)
);

// Get users by branch
router.get("/branch/:branchId", (req, res) =>
  accessController.getUsersByBranch(req, res)
);

// Change user password
router.post("/:id/change-password", (req, res) =>
  accessController.changePassword(req, res)
);

// Validate user password
router.post("/:id/validate-password", (req, res) =>
  accessController.validatePassword(req, res)
);

export default router;
