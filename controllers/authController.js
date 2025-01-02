const User = require("../models/User")
const { StatusCodes } = require("http-status-codes")
const { BadRequestError, UnauthenticatedError } = require("../errors")
const { attachCookiesResponse, createTokenUser } = require("../utils")

const register = async (req, res) => {
  const { email, name, password } = req.body
  const emailAlreadyExist = await User.findOne({ email })
  if (emailAlreadyExist) {
    throw new BadRequestError("User already exists")
  }

  // first registered user will be admin
  const isFirstAccount = (await User.countDocuments({})) === 0
  const role = isFirstAccount ? "admin" : "user"

  const user = await User.create({ name, email, password, role })

  const tokenUser = createTokenUser(user)

  attachCookiesResponse({ res, user: tokenUser })

  res.status(StatusCodes.CREATED).json({ user: tokenUser })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password")
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new UnauthenticatedError("invalid credential")
  }

  const isPasswordCorrect = await user.comparePassword(password)

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("invalid credentials")
  }

  const tokenUser = createTokenUser(user)

  attachCookiesResponse({ res, user: tokenUser })

  res.status(StatusCodes.CREATED).json({ user: tokenUser })
}

const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(200).json()
}

module.exports = {
  register,
  login,
  logout,
}
