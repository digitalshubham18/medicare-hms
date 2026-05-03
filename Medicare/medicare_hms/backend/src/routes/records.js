const express = require('express');
const router = express.Router();
const {
  getRecords, getRecord, createRecord, updateRecord, deleteRecord
} = require('../controllers/recordReminderController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', getRecords);
router.get('/:id', getRecord);
router.post('/', authorize('admin', 'doctor', 'nurse'), (req, res, next) => { req.uploadFolder = 'records'; next(); }, upload.single('file'), createRecord);
router.put('/:id', authorize('admin', 'doctor'), updateRecord);
router.delete('/:id', authorize('admin', 'doctor'), deleteRecord);

module.exports = router;