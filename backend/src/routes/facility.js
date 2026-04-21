// const router = require('express').Router();
// const { protect, authorize } = require('../middleware/auth');
// const {
//   getRooms, createRoom, updateRoom, deleteRoom,
//   getSchedules, createSchedule, updateSchedule, deleteSchedule,
//   getMessages, sendMessage, getUsers,
// } = require('../controllers/facilityController');

// router.use(protect);

// // Rooms
// router.get('/rooms', getRooms);
// router.post('/rooms', authorize('admin'), createRoom);
// router.put('/rooms/:id', authorize('admin','nurse','wardboy'), updateRoom);
// router.delete('/rooms/:id', authorize('admin'), deleteRoom);

// // Schedules
// router.get('/schedules', getSchedules);
// router.post('/schedules', authorize('admin'), createSchedule);
// router.put('/schedules/:id', authorize('admin'), updateSchedule);
// router.delete('/schedules/:id', authorize('admin'), deleteSchedule);

// // Chat
// router.get('/chat/messages', getMessages);
// router.post('/chat/send', sendMessage);
// router.get('/chat/users', getUsers);

// module.exports = router;


// const router = require('express').Router();
// const { protect, authorize } = require('../middleware/auth');
// const {
//   getRooms, createRoom, updateRoom, deleteRoom,
//   getSchedules, createSchedule, bulkSeedSchedules, updateSchedule, deleteSchedule,
//   getMessages, sendMessage, getUsers,
// } = require('../controllers/facilityController');

// router.use(protect);

// // Rooms
// router.get('/rooms', getRooms);
// router.post('/rooms', authorize('admin'), createRoom);
// router.put('/rooms/:id', authorize('admin','nurse','wardboy'), updateRoom);
// router.delete('/rooms/:id', authorize('admin'), deleteRoom);

// // Schedules
// router.get('/schedules', getSchedules);
// router.post('/schedules', authorize('admin'), createSchedule);
// router.post('/schedules/bulk', authorize('admin'), bulkSeedSchedules);
// router.put('/schedules/:id', authorize('admin'), updateSchedule);
// router.delete('/schedules/:id', authorize('admin'), deleteSchedule);

// // Chat
// router.get('/chat/messages', getMessages);
// router.post('/chat/send', sendMessage);
// router.get('/chat/users', getUsers);

// module.exports = router;


const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getRooms, createRoom, updateRoom, deleteRoom,
  getSchedules, createSchedule, bulkSeedSchedules, updateSchedule, deleteSchedule,
  getMessages, sendMessage, getUsers,
} = require('../controllers/facilityController');

router.use(protect);

// Rooms
router.get('/rooms', getRooms);
router.post('/rooms', authorize('admin'), createRoom);
router.put('/rooms/:id', authorize('admin','nurse','wardboy'), updateRoom);
router.delete('/rooms/:id', authorize('admin'), deleteRoom);

// Schedules
router.get('/schedules', getSchedules);
router.post('/schedules', authorize('admin'), createSchedule);
router.post('/schedules/bulk', authorize('admin'), bulkSeedSchedules);
router.put('/schedules/:id', updateSchedule); // any authenticated user can update own schedule
router.delete('/schedules/:id', authorize('admin'), deleteSchedule);

// Chat
router.get('/chat/messages', getMessages);
router.post('/chat/send', sendMessage);
router.get('/chat/users', getUsers);

module.exports = router;