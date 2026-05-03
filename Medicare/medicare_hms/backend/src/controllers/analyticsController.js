const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const { Alert } = require('../models/Models');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalPatients, totalDoctors, pendingUsers,
      totalAppointments, todayAppointments,
      totalOrders, pendingOrders,
      totalAlerts, activeAlerts
    ] = await Promise.all([
      User.countDocuments({ role: 'patient', status: 'approved' }),
      User.countDocuments({ role: 'doctor', status: 'approved' }),
      User.countDocuments({ status: 'pending' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        date: { $gte: new Date(now.setHours(0,0,0,0)), $lt: new Date(now.setHours(23,59,59,999)) }
      }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['processing', 'confirmed'] } }),
      Alert.countDocuments(),
      Alert.countDocuments({ status: 'pending' })
    ]);

    // Monthly appointments for chart
    const monthlyAppts = await Appointment.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } }
    ]);

    // Department breakdown
    const deptStats = await Appointment.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly revenue (orders)
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { '_id.month': 1 } }
    ]);

    // Recent registrations
    const recentPatients = await User.aggregate([
      { $match: { role: 'patient', status: 'approved', createdAt: { $gte: startOfYear } } },
      { $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalPatients, totalDoctors, pendingUsers,
          totalAppointments, todayAppointments,
          totalOrders, pendingOrders,
          totalAlerts, activeAlerts
        },
        charts: {
          monthlyAppointments: monthlyAppts,
          departmentStats: deptStats,
          monthlyRevenue,
          recentPatients
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};