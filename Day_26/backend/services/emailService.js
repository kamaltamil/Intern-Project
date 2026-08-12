const nodemailer = require("nodemailer");

const getApplicationName = () => process.env.APP_NAME || "HotelPro";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;

  if (!host || !user || !password) {
    throw new Error("Email service is not configured");
  }

  const port = Number(process.env.EMAIL_PORT || 587);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) throw new Error("Recipient email is required");

  const transporter = getTransporter();

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "-";

const getBookingDetails = (booking) => {
  const user = booking?.user || {};
  const room = booking?.room || {};

  return {
    applicationName: getApplicationName(),
    userName: user.name || "Guest",
    email: user.email,
    bookingId: booking?._id?.toString() || "-",
    roomInfo: room.roomNumber
      ? `Room ${room.roomNumber}${room.type ? ` - ${room.type}` : ""}`
      : "Room details unavailable",
    startDate: formatDate(booking?.startDate),
    endDate: formatDate(booking?.endDate),
    status: booking?.bookingStatus || "-",
  };
};

const sendBookingNotification = async (type, booking) => {
  const details = getBookingDetails(booking);
  const safe = Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, escapeHtml(value)])
  );

  if (type === "created") {
    return sendEmail({
      to: details.email,
      subject: "Booking Submitted - Waiting for Approval",
      text: `Hello ${details.userName},\n\nYour hotel booking has been successfully submitted.\n\nBooking ID: ${details.bookingId}\nRoom: ${details.roomInfo}\nCheck-in: ${details.startDate}\nCheck-out: ${details.endDate}\n\nCurrent Status: Waiting for Approval\n\nOur team will review your booking and you will receive another email when the booking status changes.\n\nThank you,\n${details.applicationName} Team`,
      html: `<p>Hello ${safe.userName},</p><p>Your hotel booking has been successfully submitted.</p><p><strong>Booking ID:</strong> ${safe.bookingId}<br><strong>Room:</strong> ${safe.roomInfo}<br><strong>Check-in:</strong> ${safe.startDate}<br><strong>Check-out:</strong> ${safe.endDate}</p><p><strong>Current Status:</strong> Waiting for Approval</p><p>Our team will review your booking and you will receive another email when the booking status changes.</p><p>Thank you,<br>${safe.applicationName} Team</p>`,
    });
  }

  const statusLabels = {
    "Payment Pending": "Payment Pending",
    Booked: "Booked",
    CheckedIn: "Checked In",
    CheckedOut: "Checked Out",
    Cancelled: "Cancelled",
    Rejected: "Rejected",
    "Pending Approval": "Pending Approval",
  };

  const statusLabel = statusLabels[details.status] || details.status;
  let subject = `Booking Status Updated - ${statusLabel}`;
  let message = "Your booking status has been updated.";

  if (type === "approved") {
    subject = `Booking Approved - ${details.bookingId}`;
    message = "Your booking has been approved successfully.";
  } else if (type === "rejected") {
    subject = `Booking Update - ${details.bookingId}`;
    message = "We are sorry to inform you that your booking request has been rejected.";
  }

  return sendEmail({
    to: details.email,
    subject,
    text: `Hello ${details.userName},\n\n${message}\n\nBooking ID: ${details.bookingId}\nRoom: ${details.roomInfo}\nCheck-in: ${details.startDate}\nCheck-out: ${details.endDate}\n\nStatus: ${statusLabel}\n\nThank you,\n${details.applicationName} Team`,
    html: `<p>Hello ${safe.userName},</p><p>${escapeHtml(message)}</p><p><strong>Booking ID:</strong> ${safe.bookingId}<br><strong>Room:</strong> ${safe.roomInfo}<br><strong>Check-in:</strong> ${safe.startDate}<br><strong>Check-out:</strong> ${safe.endDate}</p><p><strong>Status:</strong> ${escapeHtml(statusLabel)}</p><p>Thank you,<br>${safe.applicationName} Team</p>`,
  });
};

const sendSubscriptionConfirmation = async (email) => {
  const applicationName = getApplicationName();
  const safeApplicationName = escapeHtml(applicationName);

  return sendEmail({
    to: email,
    subject: `Subscription Confirmation - ${applicationName}`,
    text: `Hello,\n\nThank you for subscribing to ${applicationName}.\n\nYour email subscription has been successfully confirmed.\n\nYou will receive important updates and notifications from us.\n\nThank you,\n${applicationName} Team`,
    html: `<p>Hello,</p><p>Thank you for subscribing to ${safeApplicationName}.</p><p>Your email subscription has been successfully confirmed.</p><p>You will receive important updates and notifications from us.</p><p>Thank you,<br>${safeApplicationName} Team</p>`,
  });
};

module.exports = {
  sendEmail,
  sendBookingNotification,
  sendSubscriptionConfirmation,
};
