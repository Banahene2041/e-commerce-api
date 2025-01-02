const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      maxlength: [100, "name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "description can not be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please provide product company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      required: true,
      default: ["#222"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  //when you want to reference the reviews to the product,mongoose virtuals is used.
  {
    timestamps: true,
    collection: "products",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// adding the reviews to the model
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id", //product id
  foreignField: "product", //field in the review model that link to the product
  justOne: false,
  // match:{rating:5} //incase you want to filter
})

// this is used in reference of the deleteOne() i used when  i was deleting a product
// so that no review will be lying there without connected(null) to a product
ProductSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await this.model("Review").deleteMany({ product: this._id })
    next()
  }
)

module.exports = mongoose.model("Product", ProductSchema)
