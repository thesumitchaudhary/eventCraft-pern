import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

// this is main dashboard of the website
import LandingPage from "./mainLandingPages/Dashboard";
import FeedBack from "./mainLandingPages/FeedBack";
import Gallery from "./mainLandingPages/Gallery";
import FAQ from "./mainLandingPages/FAQ";

// this is for the sign in and also sign up form for user,admin, and employee
import AuthModal from "./mainLandingPages/AuthModel";

// import for customer
import Page from "./app/users/dashboard/page";
import MyBookingPage from "./app/users/my-booking/page";
import EventThemePage from "./app/users/event-theme/page";
import Payment from "./app/users/payment/page";

// import for admin
import AdminDashboardPage from "./app/admin/dashboard/page";
import AdminBookingPage from "./app/admin/booking/page";
import AdminEventThemePage from "./app/admin/event-theme/page";
import AdminAnalyticsPage from "./app/admin/analytics/page";
import AdminCustomerPage from "./app/admin/customer/page";
import AdminEmployeesPage from "./app/admin/employees/page";
import AdminAddTasksPage from "./app/admin/add-task/page";
import AdminRevenuePage from "./app/admin/Revenue/page";

// import for employee
import EmployeeDashboardPage from "./app/employee/all task/page";
import EmployeePendingWorkPage from "./app/employee/pending work/page";
import EmployeeInProgressPage from "./app/employee/in progress/page";
import EmployeeCompletedPage from "./app/employee/completed/page";

function App() {
  return (
    <Routes>
      {/* this is the main dashboard */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/feedBack" element={<FeedBack />} />
      <Route path="/Gallery" element={<Gallery />} />
      <Route path="/FAQ" element={<FAQ />} />
      <Route path="/feedback" element={<FeedBack />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/faq" element={<FAQ />} />

      {/* auth (same UI, role decided by route) */}
      <Route path="/login" element={<AuthModal />} />
      <Route path="/admin/login" element={<AuthModal />} />
      <Route path="/employee/login" element={<AuthModal />} />

      <Route path="/customer/dashboard" element={<Page />} />
      <Route path="/customer/myBooking" element={<MyBookingPage />} />
      <Route path="/customer/EventTheme" element={<EventThemePage />} />
      <Route path="/customer/payments" element={<Payment />} />

      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/my-booking" element={<AdminBookingPage />} />
      <Route path="/admin/event-theme" element={<AdminEventThemePage />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      <Route path="/admin/customer" element={<AdminCustomerPage />} />
      <Route path="/admin/employees" element={<AdminEmployeesPage />} />
      <Route path="/admin/add-tasks" element={<AdminAddTasksPage />} />
      <Route path="/admin/revenue" element={<AdminRevenuePage />} />

      <Route path="/employee" element={<EmployeeDashboardPage />} />
      <Route path="/employee/pending" element={<EmployeePendingWorkPage />} />
      <Route
        path="/employee/in-progress"
        element={<EmployeeInProgressPage />}
      />
      <Route path="/employee/completed" element={<EmployeeCompletedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
