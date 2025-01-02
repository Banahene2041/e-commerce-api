const User = require("../models/User")
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors")
const { StatusCodes } = require("http-status-codes")
const { createTokenUser, attachCookiesResponse,checkPermissions } = require("../utils")

const getAllUsers = async (req, res) => {
  //   console.log(req.user)
  const users = await User.find({ role: "user" }).select("-password")
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password")

  if (!user) {
    throw new NotFoundError(`No user with id : ${req.params.id}`)
  }

  checkPermissions(req.user,user._id)

  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  const user = req.user
  res.status(StatusCodes.OK).json({ user })
}

// update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { email, name } = req.body

//   if (!email || !name) throw new BadRequestError("Please provide all values")

//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     {
//       new: true,
//       runValidators: true,
//     }
//   )

//   const tokenUser = createTokenUser(user)

//   attachCookiesResponse({ res, user: tokenUser })

//   res.status(StatusCodes.OK).json({ user: tokenUser })
// }

// update user with user.save()
const updateUser = async (req, res) => {
  const { email, name } = req.body

  if (!email || !name) throw new BadRequestError("Please provide all values")

  const user = await User.findOne({ _id: req.user.userId })

  user.email = email
  user.name = name

  await user.save()

  const tokenUser = createTokenUser(user)

  attachCookiesResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new BadRequestError(
      "Please provide both oldPassword and new Password"
    )
  }

  const user = await User.findOne({ _id: req.user.userId })

  const isPasswordCorrect = await user.comparePassword(oldPassword)

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credential")
  }

  user.password = newPassword
  await user.save()
  res.status(StatusCodes.OK).json({ msg: "Success!! Password Updated" })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
