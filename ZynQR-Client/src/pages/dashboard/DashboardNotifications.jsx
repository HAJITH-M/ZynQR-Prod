import { Link } from "react-router-dom";

function DashboardNotifications() {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-10 lg:p-16">
      <h1 className="font-headline text-3xl font-extrabold text-on-background">Notifications</h1>
      <p className="mt-2 max-w-2xl text-on-surface-variant">
        In-app notifications and alert preferences are not available yet. This screen is reserved for when that
        capability is added.
      </p>
      <p className="mt-4 text-sm text-on-surface-variant">
        Email for account recovery (forgot password) is already supported from the sign-in flow.
      </p>
      <p className="mt-6 text-sm">
        <Link className="font-bold text-primary hover:underline" to="/dashboard/api-docs">
          API Documentation
        </Link>{" "}
        covers integration details for developers.
      </p>
    </div>
  );
}

export default DashboardNotifications;
