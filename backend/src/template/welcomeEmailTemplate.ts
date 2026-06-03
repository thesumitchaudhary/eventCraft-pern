export const Welcome_Email_Template = `
  <div style="
    font-family: Arial, Helvetica, sans-serif;
    max-width: 600px;
    margin: auto;
    background-color: #f4f6fb;
    padding: 30px;
    border-radius: 12px;
  ">

    <!-- Header -->
    <div style="
      background: linear-gradient(135deg, #6d28d9, #8b5cf6);
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      color: #ffffff;
    ">
      <h1 style="margin: 0; font-size: 26px;">Welcome to EventCraft 🎉</h1>
      <p style="margin-top: 8px; font-size: 14px;">
        Crafting unforgettable events, effortlessly
      </p>
    </div>

    <!-- Content -->
    <div style="
      background-color: #ffffff;
      padding: 25px;
      margin-top: 20px;
      border-radius: 10px;
      color: #333;
      line-height: 1.6;
    ">

      <p style="font-size: 16px;">
        Hi <strong>{firstname} {lastname}</strong>,
      </p>

      <p style="font-size: 15px; color: #555;">
        We’re thrilled to have you onboard! <strong>EventCraft</strong> helps you
        plan and book <strong>birthdays, weddings, corporate events,</strong>
        and other special celebrations — all in one place.
      </p>

      <h3 style="margin-top: 20px; color: #111;">✨ What You Can Do</h3>

      <ul style="padding-left: 18px; color: #555; font-size: 14px;">
        <li style="margin-bottom: 8px;">📅 Book customized events in minutes</li>
        <li style="margin-bottom: 8px;">🎨 Select themes & event types</li>
        <li style="margin-bottom: 8px;">💬 Get instant live chat support</li>
        <li style="margin-bottom: 8px;">📊 Track bookings from your dashboard</li>
      </ul>

      <h3 style="margin-top: 20px; color: #111;">💬 Real-Time Chat Support</h3>
      <p style="font-size: 14px; color: #555;">
        Our built-in live chat lets you connect instantly with our team
        for updates, assistance, and peace of mind.
      </p>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://eventcraft-1-nffh.onrender.com/"
          style="
            display: inline-block;
            background-color: #6d28d9;
            color: #ffffff;
            padding: 14px 26px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: bold;
          ">
          Go to Dashboard →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <p style="
      font-size: 12px;
      color: #888;
      text-align: center;
      margin-top: 25px;
    ">
      Need help? Reach out anytime via live chat.<br/>
      © ${new Date().getFullYear()} EventCraft. All rights reserved.
    </p>

  </div>
  `