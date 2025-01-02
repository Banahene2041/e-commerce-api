const express = require("express")
const {
  createOrder,
  getAllOrders,
  getCurrentUserOrder,
  getSingleOrder,
  updateOrder,
} = require("../controllers/orderController")
const { Router } = express
const router = Router()

// middleware
const {
  authorizedPermissions,
} = require("../middleware/authentication")

router
  .route("/")
  .post(createOrder)
  .get(authorizedPermissions("admin"), getAllOrders)
router.route("/showAllMyOrders").get(getCurrentUserOrder)
router
  .route("/:id")
  .get(getSingleOrder)
  .patch(updateOrder)

module.exports = router
