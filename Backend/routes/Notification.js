import express from "express";
import Notification from "../models/Notification.js";

const NotificationRouter = express.Router();

/* =========================================================
   GET /notifications — Last 30, newest first
========================================================= */
NotificationRouter.get("/notifications", async (req, res) => {
  try {
    const userId = req.data._id;

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "name username profilepic")
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   PUT /notifications/read-all — Mark all as read
========================================================= */
NotificationRouter.put("/notifications/read-all", async (req, res) => {
  try {
    const userId = req.data._id;
    await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
    res.status(200).json({ success: true, message: "All marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   PUT /notifications/read/:id — Mark one as read
========================================================= */
NotificationRouter.put("/notifications/read/:id", async (req, res) => {
  try {
    const userId = req.data._id;
    const { id } = req.params;

    await Notification.updateOne(
      { _id: id, recipient: userId },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   DELETE /notifications/:id — Remove one notification
========================================================= */
NotificationRouter.delete("/notifications/:id", async (req, res) => {
  try {
    const userId = req.data._id;
    const { id } = req.params;

    await Notification.deleteOne({ _id: id, recipient: userId });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default NotificationRouter;
