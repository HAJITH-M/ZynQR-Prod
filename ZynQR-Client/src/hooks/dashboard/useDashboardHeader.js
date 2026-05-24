import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useMatch } from "react-router-dom";
import { fetchAuthMe } from "../../api/auth.api.js";
import { qrBreadcrumbTitleFromList } from "../../lib/dashboard/breadcrumbs.js";
import { useQrListQuery } from "../useQrList.js";
import { userInitialFromMe } from "../../utils/userInitial.js";

const AUTH_ME_QUERY_KEY = ["auth", "me"];

export function useDashboardHeader() {
  const qrEditMatch = useMatch({ path: "/dashboard/my-qrs/:qrId/edit", end: true });
  const qrAnalyticsMatch = useMatch({ path: "/dashboard/my-qrs/:qrId/analytics", end: true });
  const { data: qrRows = [] } = useQrListQuery();
  const { data: me } = useQuery({ queryKey: AUTH_ME_QUERY_KEY, queryFn: fetchAuthMe });

  const profileInitial = useMemo(() => userInitialFromMe(me), [me]);

  const accountAriaLabel = useMemo(() => {
    const n = String(me?.display_name ?? "").trim();
    if (n) return `Account settings for ${n}`;
    const e = String(me?.email ?? "").trim();
    if (e) return `Account settings (${e})`;
    return "Account settings";
  }, [me]);

  const editQrId = qrEditMatch?.params?.qrId;
  const analyticsQrId = qrAnalyticsMatch?.params?.qrId;

  const editTitle = useMemo(
    () => qrBreadcrumbTitleFromList(qrRows, editQrId),
    [qrRows, editQrId],
  );

  const analyticsTitle = useMemo(
    () => qrBreadcrumbTitleFromList(qrRows, analyticsQrId),
    [qrRows, analyticsQrId],
  );

  return {
    profileInitial,
    accountAriaLabel,
    editQrId,
    analyticsQrId,
    editTitle,
    analyticsTitle,
  };
}
