import { useEffect, useState } from "react";
import api from "../services/api";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
} from "lucide-react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      // Get authenticated student
      const userResponse = await api.get("/auth/me");
      const user = userResponse.data.user;
      console.log("Logged in user:", user);

      if (!user.student_id) {
        console.error("Student ID not found");
        return;
      }

      // Get notifications for authenticated student
      const response = await api.get(
        `/notifications/student/${user.student_id}`
      );

      setNotifications(response.data.data || []);
console.log(
  "Notification is_read:",
  response.data.data[0]?.is_read,
  "Type:",
  typeof response.data.data[0]?.is_read
);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  fetchNotifications();
}, []);

  const handleMarkAsRead = async (notificationId) => {
  try {
    const response = await api.put(
      `/notifications/${notificationId}/read`
    );

    console.log("Mark as read response:", response.data);

    if (response.data.success) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notification_id === notificationId
            ? {
                ...notification,
                is_read: 1,
              }
            : notification
        )
      );
    }
  } catch (error) {
    console.error(
      "Failed to mark notification as read:",
      error
    );
  }
};

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <a href="/dashboard" className="back-button">
          <ArrowLeft size={18} />
          Back to Dashboard
        </a>

        <div>
          <h1>Notifications</h1>
          <p>
            Stay updated with your latest campus activities.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="notifications-empty">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <Bell size={40} />
          <h2>No notifications</h2>
          <p>You are all caught up.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`notification-card ${
                notification.is_read ? "read" : "unread"
              }`}
            >
              <div className="notification-icon">
                <Bell size={20} />
              </div>

              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>

                <span className="notification-date">
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </span>
              </div>

              {!notification.is_read && (
                <button
                  className="mark-read-button"
                  onClick={() =>
                    handleMarkAsRead(
                      notification.notification_id
                    )
                  }
                >
                  <CheckCircle2 size={16} />
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;