import { Outlet } from "react-router-dom";
import SiteNavBar from "../../components/layout/SiteNavBar";
import LandingFooter from "./LandingFooter";

export default function LandingLayout() {
  return (
    <div className="light bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <SiteNavBar fixed />

      <main className="pt-16">
        <Outlet />
      </main>

      <LandingFooter />
    </div>
  );
}
