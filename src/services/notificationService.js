// Notification Service
// Handles notification operations via REST API

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5068/api";
export const notificationService = {
  // Store the callback for real-time notifications
  _notificationCallback: null,

  /**
   * Subscribe to real-time notifications
   * @param {Function} callback - Function to call when notification is received
   */
  subscribeToNotifications(callback) {
    this._notificationCallback = callback;
    // In a real implementation, this would connect to SignalR/WebSocket
    // For now, we're just storing the callback
    console.log("📡 Subscribed to notifications (polling mode)");
  },

  /**
   * Unsubscribe from real-time notifications
   */
  unsubscribe() {
    this._notificationCallback = null;
    console.log("📡 Unsubscribed from notifications");
  },

  /**
   * Get all notifications for current user
   * @returns {Promise<Array>} Array of notifications
   */
  async getAllNotifications() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Notification`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} Count of unread notifications
   */
  async getUnreadCount() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Notification/unread`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  /**
   * Mark a notification as read
   * @param {number} notificationId - The notification ID
   * @returns {Promise<Object>} Response message
   */
  async markAsRead(notificationId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/Notification/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Response message
   */
  async markAllAsRead() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Notification/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {number} notificationId - The notification ID
   * @returns {Promise<Object>} Response message
   */
  async deleteNotification(notificationId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/Notification/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};
