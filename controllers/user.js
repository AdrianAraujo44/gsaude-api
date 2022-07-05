const userModel = require('../models/user')
const credentialsModel = require('../models/credentials')
const codeVerificationModel = require('../models/codeVerification')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

//login
const login = async(req,res) => {
  try {
    const credential = await credentialsModel.findOne({ email: req.body.email })
    
    if(credential === null) {
      res.status(200).json({type:'warning', message: "Usuário ou senha incorreto"})
    }else {
      const validPassword = await bcrypt.compare(req.body.password, credential.password)
      if(!validPassword) {
        res.status(200).json({type: 'warnig', message: 'Usuário ou senha incorreto'})
      }else {
        const user = await userModel.findOne({ credentialId: credential._id})
        const { credentialId, ...others} = user._doc
        if(credential.healthCenterId !== undefined) {
          others.healthCenterId = credential.healthCenterId
        }
        res.status(200).json({type: "success" , user: others})
      }
    }

  }catch(err) {
    res.status(500).json(err)
  }
}

// new user
const newUser = async(req,res) => {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(req.body.password, salt)
    let credential = {
      email: req.body.email,
      password: req.body.password,
      healthCenterId : req.body.healthCenterId
    }
    credential.password = hashedPass

    const newCredential = new credentialsModel(credential)
    const credentialSaved = await newCredential.save()

    const user = {
      credentialId: credentialSaved._doc._id,
      name: req.body.name,
      dateOfBirth: req.body.dateOfBirth,
      cpf: req.body.cpf,
    }
    const newUser = new userModel(user)
    const userSaved = await newUser.save()

    res.status(200).json(userSaved)

  } catch (err) {
    res.status(500).json(err)
  }
}

// send email to user
const sendCodeVerificationToUser = async(req,res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "gsaudeapp@gmail.com",
        pass: process.env.PASSWORDAPP
      }
    })

    let responseCredential = await credentialsModel.findOne({ email: req.body.email })
    if(responseCredential != null) {
      res.status(200).json({ message: 'email já cadastrado', type: 'emailExist'})
    }else {
      let active = false
      let code
      while(active != true) {
        code = Math.floor(Math.random() * 9999 + 1)
        let responseCode = await codeVerificationModel.findOne({ code })
        if(responseCode == null) {
          const newCode = new codeVerificationModel({ code })
          await newCode.save()
          active = true
        }else {
          active = false
        }
      }

      const emailOption = {
        from: "gsaudeapp@gmail.com",
        to: req.body.email,
        subject: "Código de verificação",
        html: `
          <div style="border:1px solid #dadce0; border-radius:8px; padding:40px 20px;">
            <center>
              <div style="border-bottom:1px solid #dadce0;">
                <h1>Bem-vindo ao Gsaúde !</h1>
              </div>
              <p>
                Seu código é <strong>${code}</strong> 
              </p>
            </center>
          </div>
        `
      }
      transporter.sendMail(emailOption)
      res.status(200).json({ message: "email has been send", type: "success" })
    }

    

  }catch(err) {
    res.status(500).json(err)
  }
}

const validateVerificationCode = async(req,res) => {
  try {
    const code = await codeVerificationModel.findOne({ code: req.params.code })

    if(code == null || code.active == false) {
      res.status(200).json({ message: "código inválido", type: "erro"})
    }else {
      const timeoutInMinutes = 3
      const dateCode = new Date(code.createdAt)
      const dayCode = dateCode.getDate()
      const hourCode = dateCode.getHours()
      const minutesCode = dateCode.getMinutes()
      const monthCode = dateCode.getMonth()
      const yearCode = dateCode.getFullYear()

      const currentDate = new Date()
      
      if( (yearCode == currentDate.getFullYear())                       &&
          (monthCode == currentDate.getMonth())                         && 
          (dayCode == currentDate.getDate())                            &&
          (hourCode == currentDate.getHours())                          &&
          (minutesCode + timeoutInMinutes >= currentDate.getMinutes())
        ){

          await codeVerificationModel.updateOne(
            { 'code': req.params.code },
            { 'active': false}
          )
          res.status(200).json({ message: "código é válido", type:"success"})

      }else {
        res.status(200).json({ message: "código inválido", type:"erro" })
      }
    }
  }catch(err) {
    res.status(500).json(err)
  }

}

const getNotifications = async(req,res) => {
  try {
    const selectUser = "_id name"
    const selectMedicine = "_id name inventory"
    const selectHealthCenter = "_id name medicines latitude longitude"
    let user = await userModel.findOne({_id: req.params.userId}, selectUser)
      .populate({ path:"notifications.medicine", select:selectMedicine })
      .populate({ path:"notifications.healthCenter", select:selectHealthCenter })

    user = user.toObject()
    userCopy = JSON.parse(JSON.stringify(user))

    user.notifications.forEach((notification,indexNotification) => {
      notification.healthCenter.forEach((healthCenter,indexHealthCenter) => {
        let haveMedicine = false
        healthCenter.medicines.forEach((medicine) => {
          if((medicine.medicine?.toString() == notification.medicine._id?.toString()) && (medicine.situation == "available")) {
            haveMedicine = true
          }
        })
        if(haveMedicine == false) {
          userCopy.notifications[indexNotification].healthCenter.splice(indexHealthCenter,1)
        }
      })
    })
    
    userCopy.notifications.forEach((element,index) => {
      if(element.healthCenter.length == 0) {
        userCopy.notifications.splice(index,1)
      }
    })

    res.status(200).json(userCopy)

  }catch(err) {
    res.status(500).json(err)
  }
}

const addNotification = async(req, res) => {
  const user_result = await userModel.findOne({ _id : req.body.userId }) 
  console.log(user_result)

  if(user_result == null) {
    res.status(200).json({type:"alerta", message: "O usuário não existe"})
  } else {
    let notif_result = user_result.notifications.find(e => e.medicine == req.body.medicine_id)
    
    let arr_temp = []
    if(notif_result == null || notif_result?.length == 0) {
      arr_temp.push({ medicine : req.body.medicine_id, healthCenter : req.body.healthCenter_id })

      await userModel.updateOne({ _id: req.body.userId }, {
        notifications : [...user_result.notifications, ...arr_temp ]
      })

    } else {  
      arr_temp = [...notif_result.healthCenter]

      arr_temp.push(req.body.healthCenter_id)

      await userModel.updateOne({ _id: req.body.userId }, {
        notifications : [ ...user_result.notifications, { medicine: req.body.medicine_id, healthCenter: arr_temp } ]
      })
    }

    res.status(200).json({ message: "notificacão adicionada com sucesso", type: "sucesso" })
  }
}

const userController = {
  login,
  newUser,
  sendCodeVerificationToUser,
  validateVerificationCode,
  getNotifications,
  addNotification
}

module.exports = { userController }