const healthCenterModel = require('../models/healthCenter')
const medicineModel = require('../models/medicine')

// add medicine in a health center
const addMedicine = async(req,res) => {
  try {
    await healthCenterModel.updateOne(
      { '_id': req.body.healthCenterId },
      {
        '$push': {
          'medicines': {
            medicine: req.body.medicine,
            amountAvailable: req.body.amountAvailable,
            situation: "available"
          }
        }
      }
    )

    await medicineModel.updateOne(
      { '_id': req.body.medicine},
      {
        '$push': {
          'inventory': req.body.healthCenterId
        }
      }
    )

    res.status(200).json({ message: "ok" })
  }catch(err) {
    res.status(500).json(err)
  }
}

// get a health center
const getHealthCenter = async(req,res) => {
  try {
    const select = "_id name bula"
    const healthCenter =  await healthCenterModel.findOne({ _id: req.params.id })
      .populate({path:"medicines.medicine", select})

    res.status(200).json(healthCenter)
  }catch(err) {
    res.status(500).json(err)
  }
}

// updating the amount of medicines
const updateAmountMedicine = async(req,res) => {
  try {
    if(req.body.amount == 0) {
      await healthCenterModel.updateOne(
        { 
          'medicines.medicine': req.body.medicineId,
          '_id': req.body.healthCenterId
        }, 
        {
          '$set': {
            'medicines.$.amountAvailable': req.body.amount,
            'medicines.$.situation': 'missing'
          }
        }
      )
    }else {
      await healthCenterModel.updateOne({
        'medicines.medicine': req.body.medicineId,
        '_id': req.body.healthCenterId
      },
        {
          '$set': {
            'medicines.$.amountAvailable': req.body.amount,
            'medicines.$.situation': 'available'
          }
        }
      )
    }

    res.status(200).json({ message: "medicine updated", type: "success"})
  }
  catch(err) {
    res.status(500).json(err)
  }
}

const getAmountMedicines = async(req,res) => {
  try {
    const healthCenter = await healthCenterModel.findOne({ _id: req.params.healthCenterId}, "name medicines")
      .populate({path:"medicines.medicine", select: "name"})

    const medicineAvailable = healthCenter.medicines.filter(element => element.situation == "available")
    const medicineComing = healthCenter.medicines.filter(element => element.situation == "coming")
    const medicineMissing = healthCenter.medicines.filter(element => element.situation == "missing")

    res.status(200).json({
      type:"success",
      data: {
        available: medicineAvailable.length,
        coming: medicineComing.length,
        missing: medicineMissing.length
      }
    })

  }catch(err) {
    res.status(500).json(err)
    console.log(err)
  }
}

const listMedicine = async(req, res) => {
  
  try {
    const healthCenterResult = await healthCenterModel.findOne({_id: req.params.healthCenterId})
      .populate({path: "medicines.medicine", select: "name"})

    if(healthCenterResult == null) {
      res.status(500).json({ type: "error", message: "Nao existem esse posto"})
    } else {
      if(req.body.type == 'available') {
        const available_medicines = await healthCenterResult.medicines.filter((e) => e.situation == "available")
        res.status(200).json(available_medicines)

      } else if(req.body.type == 'missing') {
        const missing_medicines = await healthCenterResult.medicines.filter((e) => e.situation == "missing")
        res.status(200).json(missing_medicines)

      } else if(req.body.type == 'coming') {
        const coming_medicines = await healthCenterResult.medicines.filter((e) => e.situation == "coming")
        res.status(200).json(coming_medicines)
      }else {
        res.status(200).json(healthCenterResult.medicines)
      }
    }
  }catch(err) {
    res.status(500).json(err)
  }
}

const listHealthCenter = async(req, res) => {
  try {
    function deg2rad(deg) {
      return deg * (Math.PI / 180)
    }
    
    function getDistance(lat1, lon1, lat2, lon2) {
      var R = 6371; // Radius of the earth in kilometers
      var dLat = deg2rad(lat2 - lat1); // deg2rad below
      var dLon = deg2rad(lon2 - lon1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in KM
      return d.toFixed(1);
    }

    const healthCenterList = await healthCenterModel.find({name: new RegExp(req.params.healthCenterName, 'i')})
      
    let result = []

    for(let hc of healthCenterList) {
      if(req.body.latitude == undefined || req.body.longitude == undefined) {
        result.push({ 
          _id: hc._id,
          name: hc.name, 
          latitude: hc.latitude, 
          longitude: hc.longitude, 
          distance: "não foi possível calcular a distância" })
      } else {
        result.push({ 
          _id: hc._id,
          name: hc.name, 
          latitude: hc.latitude, 
          longitude: hc.longitude, 
          distance: `${getDistance(parseFloat(req.body.latitude), parseFloat(req.body.longitude),parseFloat(hc.latitude), parseFloat(hc.longitude))}km de distância de você` })
      }
    }
    
    res.status(200).json(result)

  }catch(err) {
    res.status(500).json(err)
  }
}

const searchMedicine = async(req,res) => {
  try {
    const healthCenter = await healthCenterModel.findOne({_id:req.params.healthCenterId})
      .populate({path: "medicines.medicine", select: "name"})

    const medicine = healthCenter.medicines.filter(element => element.medicine.name.toUpperCase().includes(req.body.name.toUpperCase()))
    res.status(200).json(medicine)
  }catch(err) {
    res.status(500).json(err)
    console.log(err)
  }
}

const healthCenterController = {
  addMedicine,
  getHealthCenter,
  updateAmountMedicine,
  getAmountMedicines,
  listMedicine,
  listHealthCenter,
  searchMedicine
}

module.exports = { healthCenterController }