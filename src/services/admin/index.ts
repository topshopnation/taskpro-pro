
import { adminBaseService } from './base-service';
import { subscriptionPlansService } from './subscription-plans-service';
import { userSubscriptionsService } from './user-subscriptions-service';
import { activityLogsService } from './activity-logs-service';
import { userManagementService } from './user-management-service';
import { dashboardStatsService } from './dashboard-stats-service';
import { settingsService } from './settings-service';

/**
 * Combined admin service that exports all functionality from individual service modules
 */
export const adminService = {
  // Admin authentication and base operations
  isUserAdmin: adminBaseService.isUserAdmin,
  loginAdmin: adminBaseService.loginAdmin,
  addAdminUser: adminBaseService.addAdminUser,
  changeAdminPassword: adminBaseService.changeAdminPassword,
  
  // Subscription plans management
  getSubscriptionPlans: subscriptionPlansService.getSubscriptionPlans,
  createSubscriptionPlan: subscriptionPlansService.createSubscriptionPlan,
  updateSubscriptionPlan: subscriptionPlansService.updateSubscriptionPlan,
  deleteSubscriptionPlan: subscriptionPlansService.deleteSubscriptionPlan,
  
  // User subscriptions management
  getUserSubscriptions: userSubscriptionsService.getUserSubscriptions,
  updateUserSubscription: userSubscriptionsService.updateUserSubscription,
  
  // User management
  getAllUsers: userManagementService.getAllUsers,
  updateUserProfile: userManagementService.updateUserProfile,
  updateUserSubscription: userManagementService.updateUserSubscription,
  deleteUser: userManagementService.deleteUser,
  
  // Dashboard statistics
  getDashboardStats: dashboardStatsService.getDashboardStats,
  
  // Settings management
  getSettings: settingsService.getSettings,
  updateSettings: settingsService.updateSettings,
  resetToDefaults: settingsService.resetToDefaults,
  
  // Activity logs
  getActivityLogs: activityLogsService.getActivityLogs
};
