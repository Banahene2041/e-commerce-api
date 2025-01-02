const Review = require("../models/Review")
const Product = require("../models/product")
const { StatusCodes } = require("http-status-codes")
const { BadRequestError, NotFoundError } = require("../errors")

const { checkPermissions } = require("../utils")

const createReview = async (req, res) => {
  const { product: productId } = req.body

  const isValidProduct = await Product.findOne({ _id: productId })

  if (!isValidProduct) {
    throw new NotFoundError(`No product with id : ${productId}`)
  }

  const alreadySubmittedReview = await Review.findOne({
    product: productId,
    user: req.user.userId,
  })

  if (alreadySubmittedReview) {
    throw new BadRequestError(`Already provided a review for this product`)
  }

  req.body.user = req.user.userId

  const review = await Review.create(req.body)

  res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product user",
    select: "name company price",
  })
  res.status(StatusCodes.OK).json({ nbHits: reviews.length, reviews })
}

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new NotFoundError(`No review with id : ${reviewId}`)
  }

  res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params
  const { title, comment, rating } = req.body

  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new NotFoundError(`No review with id : ${reviewId}`)
  }

  checkPermissions(req.user, review.user)

  review.rating = rating
  review.title = title
  review.comment = comment

  await review.save()

  res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params

  // Find the review document
  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new NotFoundError(`No review with id : ${reviewId}`)
  }

  // Check if the user has permissions to delete the review
  checkPermissions(req.user, review.user)

  // Use `deleteOne` on the document instance
  await review.deleteOne()

  res.status(StatusCodes.OK).json({ msg: "Success!! Review deleted" })
}



// alternative to get products with it's reviews
const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params
  const reviews = await Review.find({ product: productId })
  res.status(StatusCodes.OK).json({nbHits:reviews.length,reviews})
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
}
