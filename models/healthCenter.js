const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HealthCenterSchema = new Schema ({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  hour: {
    type: String,
    required: true
  },
  latitude: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  medicines: [
    {
      medicine: {
        type: Schema.ObjectId,
        ref: "Medicine"
      },
      amountAvailable: {
        type: Number,
        required: true
      },
      situation: {
        type: String,
        required: true
      }
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model("HealthCenter", HealthCenterSchema)