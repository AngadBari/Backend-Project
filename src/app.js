import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))//setting

app.use(express.json({ limit:"16kb",}))//when From Data
app.use(express.urlencoded({extended:true,limit:"16kb"}))//when URL Data
app.use(express.static("public"))//pdf,images temp store

app.use(cookieParser())//cookies set

//routes
import userRouter from "./routes/user.route.js"


//routes Declaration
app.use("/api/v1/users",userRouter)

export default app