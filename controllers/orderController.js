const Order = require("../models/Order")
const Product = require("../models/product")
const { StatusCodes } = require("http-status-codes")
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors")

const { checkPermissions } = require("../utils")

// fakeStripeAPI

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue"
  return { client_secret, amount }
}

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee, product: productId } = req.body

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No cart items provided")
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide tax and shipping fee")
  }

  let orderItems = []
  let subtotal = 0

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product })

    if (!dbProduct) {
      throw new NotFoundError(`No product with id : ${item.product}`)
    }

    const { name, price, image, _id } = dbProduct

    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    }

    // add item to order
    orderItems = [...orderItems, singleOrderItem]
    // calculate subtotal
    subtotal += item.amount * price
  }

  //   calculate total
  const total = tax + shippingFee + subtotal

  //   get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  })

  const order = await Order.create({
    tax,
    shippingFee,
    total,
    subtotal,
    orderItems,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  })

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret })
}

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
  res.status(StatusCodes.OK).json({ nbHit: orders.length, orders })
}

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params
  const order = await Order.findOne({ _id: orderId })

  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`)
  }

  checkPermissions(req.user, order.user)

  res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrder = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })

  if (!orders) {
    throw new NotFoundError(`No orders found for this users`)
  }

  res.status(StatusCodes.OK).json({ nbHits: orders.length, orders })
}

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params
  const order = await Order.findOne({ _id: orderId })

  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`)
  }

  checkPermissions(req.user, order.user)

  const paymentIntentId = "TRX" + Date.now() + Math.floor(Math.random() * 100)

  order.paymentIntentId = paymentIntentId
  order.status = "paid"

  await order.save()

  res.status(StatusCodes.OK).json({ order })
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrder,
  createOrder,
  updateOrder,
}
