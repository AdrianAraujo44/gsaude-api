const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema ({
  credentialId: {
    type: Schema.Types.ObjectId,
    ref: "Credentials"
  },
  name: {
    type: String,
    required: true
  },
  cpf: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true
  },
  notifications: [
    {
      medicine: {
        type: Schema.Types.ObjectId,
        ref: "Medicine"
      },
      healthCenter: [
        {
          type: mongoose.ObjectId,
          ref: "HealthCenter"
        }
      ]
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)