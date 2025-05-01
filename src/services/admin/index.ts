
import { adminBaseService } from './base-service';
import { subscriptionPlansService } from './subscription-plans-service';
import { userSubscriptionsService } from './user-subscriptions-service';
import { activityLogsService } from './activity-logs-service';

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
  
  // Activity logs
  getActivityLogs: activityLogsService.getActivityLogs
};
