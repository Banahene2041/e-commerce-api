require("dotenv").config()
// express async errors
require("express-async-errors")
// express
const express = require("express")
const app = express()

// morgan
const morgan = require("morgan")

// cookie parser for accessing the cookie from the browser(token) on the server
const cookieParser = require("cookie-parser")

// file upload
const fileUpload = require("express-fileupload")

const rateLimiter = require("express-rate-limit")
const helmet = require("helmet")
const xss = require("xss-clean")
const cors = require("cors")
const mongoSanitize = require("express-mongo-sanitize")
// database
const connectDB = require("./db/connect")

// routers
const authRouter = require("./Routes/authRoutes")
const userRouter = require("./Routes/userRoutes")
const productRouter = require("./Routes/productRoutes")
const reviewRouter = require("./Routes/reviewRoutes")
const orderRouter = require("./Routes/orderRoutes")

// middleware
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

app.set("trust proxy", 1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
)
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.urlencoded({ extended: false }))

// serve the public folder
app.use(express.static("./public"))

// fileUpload
app.use(fileUpload())


// authMiddleware
const { authenticateUser } = require("./middleware/authentication")

// router middleware
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/reviews", reviewRouter)
app.use("/api/v1/orders", authenticateUser, orderRouter)

// error middleware
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
