import { useSyncExternalStore } from "react";
import { Navigate } from "react-router-dom";
import { getToken, subscribeAuthToken } from "../../api/axiosInstance";

export function GuestRoute({ children, redirectTo = "/dashboard" }) {
  const token = useSyncExternalStore(subscribeAuthToken, getToken, () => null);

  if (token) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
