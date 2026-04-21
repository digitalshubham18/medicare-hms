// routes/users.js
const express = require('express');
const router = express.Router();
const { getUsers, getUser, approveUser, updateUser, deleteUser, getDashboardStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', authorize('admin'), getDashboardStats);
router.get('/', authorize('admin', 'doctor', 'nurse','patient'), getUsers);
router.get('/:id', getUser);
router.put('/:id/approve', authorize('admin'), approveUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;