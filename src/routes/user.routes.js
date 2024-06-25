import { Router } from "express";
import {registerUser} from "../controllers/register.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import {loginUser} from '../controllers/register.controller.js'
import {logoutUser} from '../controllers/register.controller.js'
import { jwtVerify } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avtaar",
            maxCount:1
        },
        {
            name:"coverImg",
            maxCount:1
        }
    ]),
    registerUser)

router.route('/login').post(loginUser)

router.route('/logout').post(jwtVerify, logoutUser)

export default router