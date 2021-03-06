const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MedicineSchema = new Schema ({
  name: {
    type: String,
    required: true
  },
  bula: {
    type: String,
    required: true
  },
  inventory: [
    {
      type: mongoose.ObjectId,
      ref: "HealthCenter"
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model("Medicine", MedicineSchema)