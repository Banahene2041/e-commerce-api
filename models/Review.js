const mongoose = require("mongoose")

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide review rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
)

// ensures that a user can leave only one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

ReviewSchema.statics.calculateAverageRatingAndNumOfReviews = async function (
  productId
) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ])
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    )
  } catch (error) {
    console.log(error)
  }
}

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRatingAndNumOfReviews(this.product)
})

ReviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    if (this.product) {
      await this.constructor.calculateAverageRatingAndNumOfReviews(this.product)
    }
  }
)

module.exports = mongoose.model("Review", ReviewSchema)
