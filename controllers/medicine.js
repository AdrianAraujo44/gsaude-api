const medicineModel = require("../models/medicine")

// search medicine
const getMedicine = async (req,res) => {
  try {
    const select = "name latitude longitude medicines image"
    let medicineInfo = await medicineModel.findOne({ name: new RegExp(req.params.name, 'i') })
      .populate({path:"inventory", select})

    if(medicineInfo != null) {
      medicineInfo = medicineInfo.toObject()
      delete medicineInfo.updatedAt

      if(medicineInfo.inventory.length >0){
        medicineInfo.inventory.forEach(element => {
          const arrayMedicines = element.medicines.filter(item => item.medicine?.equals(medicineInfo._id))
          element.medicine = arrayMedicines[0]?.medicine
          element.amountAvailable = arrayMedicines[0]?.amountAvailable
          element.situation = arrayMedicines[0]?.situation
          delete element.medicines
        })
      }
      
      res.status(200).json({type:"success", data:medicineInfo})
    }else {
      res.status(200).json({message: "Indisponível para ser distribuido nos postos", type:"error"})
    }

    

  }catch(err) {
    res.status(500).json(err)
  }
}

const medicineController = {
  getMedicine,
}

module.exports = { medicineController }