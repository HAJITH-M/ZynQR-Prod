import { Link } from "react-router-dom";

function DashboardApiKeys() {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-10 lg:p-16">
      <h1 className="font-headline text-3xl font-extrabold text-on-background">API access</h1>
      <p className="mt-2 max-w-2xl text-on-surface-variant">
        The dashboard signs you in with a secure session. Separate API keys are not issued in the app today — use your
        account session while using ZynQR in the browser.
      </p>
      <p className="mt-4 max-w-2xl text-sm text-on-surface-variant">
        To integrate ZynQR from your own backend or scripts, see{" "}
        <Link className="font-bold text-primary hover:underline" to="/dashboard/api-docs">
          API Documentation
        </Link>{" "}
        for authentication, endpoints, and examples.
      </p>
    </div>
  );
}

export default DashboardApiKeys;
