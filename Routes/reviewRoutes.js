const { Router } = require("express")
const router = Router()

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController")

const {
  authenticateUser,
} = require("../middleware/authentication")

router.route("/").post(authenticateUser, createReview).get(getAllReviews)
router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview)

module.exports = router
