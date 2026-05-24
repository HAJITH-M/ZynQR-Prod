import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import DashboardLayout from "../layouts/DashboardLayout";
import ChangePasswordView from "../pages/dashboard/ChangePasswordView";
import DashboardCreateQr from "../pages/dashboard/DashboardCreateQr";
import DashboardCreateStaticQr from "../pages/dashboard/DashboardCreateStaticQr";
import DashboardStaticQrList from "../pages/dashboard/DashboardStaticQrList";
import DashboardMyQrs from "../pages/dashboard/DashboardMyQrs";
import DashboardOverview from "../pages/dashboard/DashboardOverview";
import DashboardQrAnalytics from "../pages/dashboard/DashboardQrAnalytics";
import DashboardQrEdit from "../pages/dashboard/DashboardQrEdit";
import DashboardQrIndividualAnalytics from "../pages/dashboard/DashboardQrIndividualAnalytics";
import DashboardRecentActivity from "../pages/dashboard/DashboardRecentActivity";
import DashboardSecurity from "../pages/dashboard/DashboardSecurity";
import DashboardUserGuide from "../pages/dashboard/DashboardUserGuide";
import DashboardApiDocs from "../pages/dashboard/DashboardApiDocs";
import ForgotPassword from "../pages/forgotPassword/ForgotPassword";
import LandingApi from "../pages/landing/LandingApi";
import LandingFeatures from "../pages/landing/LandingFeatures";
import LandingHome from "../pages/landing/LandingHome";
import LandingLayout from "../pages/landing/LandingLayout";
import LandingContact from "../pages/landing/LandingContact";
import LandingPricing from "../pages/landing/LandingPricing";
import Login from "../pages/login/Login";
import OAuthCallback from "../pages/oauth/OAuthCallback";
import PageNotFound from "../pages/pageNotFound/PageNotFound";
import QrLinkInactive from "../pages/public/QrLinkInactive";
import QrNotFound from "../pages/public/QrNotFound";
import Register from "../pages/register/Register";
import { GuestRoute } from "./protectedRoute/guestRoute";
import { ProtectedRoute } from "./protectedRoute/protectedRoute";

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <LandingLayout />,
        children: [
          { index: true, element: <LandingHome /> },
          { path: "features", element: <LandingFeatures /> },
          { path: "api", element: <LandingApi /> },
          { path: "pricing", element: <LandingPricing /> },
          { path: "contact", element: <LandingContact /> },
        ],
      },
      {
        path: "/register",
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        ),
      },
      {
        path: "/oauth/callback",
        element: <OAuthCallback />,
      },
      {
        path: "/link-inactive",
        element: <QrLinkInactive />,
      },
      {
        path: "/qr-not-found",
        element: <QrNotFound />,
      },
      {
        path: "/change-password",
        element: <Navigate replace to="/dashboard/account" />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: "my-qrs/:qrId/edit", element: <DashboardQrEdit /> },
          { path: "my-qrs/:qrId/analytics", element: <DashboardQrIndividualAnalytics /> },
          { path: "my-qrs", element: <DashboardMyQrs /> },
          { path: "recent-activity", element: <DashboardRecentActivity /> },
          { path: "analytics", element: <DashboardQrAnalytics /> },
          { path: "create", element: <DashboardCreateQr /> },
          { path: "create-static-qr", element: <DashboardCreateStaticQr /> },
          { path: "static-qrs", element: <DashboardStaticQrList /> },
          { path: "security", element: <DashboardSecurity /> },
          { path: "account", element: <ChangePasswordView /> },
          { path: "guide", element: <DashboardUserGuide /> },
          { path: "api-docs", element: <DashboardApiDocs /> },
          // { path: "notifications", element: <DashboardNotifications /> },
          // { path: "api-keys", element: <DashboardApiKeys /> },
        ],
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
]);

export default router;
