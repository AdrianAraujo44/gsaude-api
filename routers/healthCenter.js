const router = require('express').Router()
const { healthCenterController } = require('../controllers/healthCenter')

// add a medicine in a health center 
router.post("/addMedicine", async(req,res) => {
  healthCenterController.addMedicine(req,res)
})

// get a health center 
router.get("/:id", async(req,res) => {
  healthCenterController.getHealthCenter(req,res)
})

// updating the amount of medicines
router.put("/updateAmountMedicine", async(req,res) => {
  healthCenterController.updateAmountMedicine(req,res)
})

router.get("/getAmountMedicines/:healthCenterId", async(req,res) => {
  healthCenterController.getAmountMedicines(req,res)
})

router.post("/listMedicines/:healthCenterId", async(req,res) => {
  healthCenterController.listMedicine(req,res)
})

router.post("/listHealthCenter/:healthCenterName", async(req,res) => {
  healthCenterController.listHealthCenter(req,res)
})

router.post("/searchMedicine/:healthCenterId", async(req,res) => {
  healthCenterController.searchMedicine(req,res)
})

module.exports = router