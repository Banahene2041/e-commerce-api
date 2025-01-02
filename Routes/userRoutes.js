const { Router } = require("express")
const router = Router()
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  showCurrentUser,
  updateUserPassword,
} = require("../controllers/userController")

const {
  authenticateUser,
  authorizedPermissions,
} = require("../middleware/authentication")

router
  .route("/")
  .get(authenticateUser, authorizedPermissions("admin"), getAllUsers)
router.route("/showMe").get(authenticateUser, showCurrentUser)
router.route("/updateUser").patch(authenticateUser, updateUser)
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword)
router.route("/:id").get(authenticateUser, getSingleUser)

module.exports = router
