const router = require('express').Router()
const { userController } = require("../controllers/user")

// Login
router.post("/login", async(req,res) => {
  userController.login(req,res)
})

// New user 
router.post("/newUser", async(req,res) => {
  userController.newUser(req,res)
})

// send email to user
router.post("/sendCode", async(req,res) => {
  userController.sendCodeVerificationToUser(req,res)
})

// validate verification code
router.get("/validateVerificationCode/:code", async(req,res) => {
  userController.validateVerificationCode(req,res)
})

router.get("/getNotifications/:userId", async(req,res) => {
  userController.getNotifications(req,res)
})

router.post("/addNotification", async(req,res) => {
  userController.addNotification(req,res)
})

module.exports = router