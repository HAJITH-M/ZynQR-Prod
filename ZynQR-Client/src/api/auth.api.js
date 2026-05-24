import axiosInstance from "./axiosInstance";

/** SMTP (verification / OTP) can exceed the default 10s axios timeout. */
const AUTH_EMAIL_TIMEOUT_MS = 30_000;

export const registerUser = async (data) => {
  const res = await axiosInstance.post("/auth/register", data, {
    timeout: AUTH_EMAIL_TIMEOUT_MS,
  });
  return res.data;
};

export const forgotPassword = async (data) => {
  const res = await axiosInstance.post("/auth/forgot-password", data, {
    timeout: AUTH_EMAIL_TIMEOUT_MS,
  });
  return res.data;
};

/** POST /auth/forgot-password-verify — body: { email, otp } */
export const verifyForgotPasswordOtp = async (data) => {
    const res = await axiosInstance.post("/auth/forgot-password-verify", data);
    return res.data;
};

/** POST /auth/forgot-password-update — body: { email, password } */
export const updateForgotPassword = async (data) => {
    const res = await axiosInstance.post("/auth/forgot-password-update", data);
    return res.data;
};

export const loginUser = async (data) => {
  const res = await axiosInstance.post("/auth/login", data, {
    timeout: AUTH_EMAIL_TIMEOUT_MS,
  });
  return res.data;
};

/** POST /auth/login/2fa — body: { two_factor_ticket, otp } */
export const verifyLogin2FA = async (data) => {
    const res = await axiosInstance.post("/auth/login/2fa", data);
    return res.data;
};

/** GET /auth/me — current user (requires Bearer). */
export const fetchAuthMe = async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
};

/** PATCH /auth/me — update profile (e.g. display_name); returns same shape as GET /auth/me. */
export const patchAuthMe = async (body) => {
    const res = await axiosInstance.patch("/auth/me", body);
    return res.data;
};

/** PATCH /auth/two-factor — body: { enabled: boolean } */
export const updateTwoFactor = async (enabled) => {
    const res = await axiosInstance.patch("/auth/two-factor", { enabled });
    return res.data;
};

export const changePassword = async (data) => {
    const res = await axiosInstance.post('/auth/change-password', data)
    return res.data
}

export const logoutCurrentSession = async () => {
    const res = await axiosInstance.post('/auth/logout')
    return res.data
}

export const logoutAllSessions = async () => {
    const res = await axiosInstance.post('/auth/logout-all')
    return res.data
}

/** GET /auth/sessions — requires Bearer (active sessions for current user). */
export const fetchAuthSessions = async () => {
    const res = await axiosInstance.get("/auth/sessions");
    return res.data;
};

/** GET /auth/security-audit-log */
export const fetchSecurityAuditLog = async () => {
    const res = await axiosInstance.get("/auth/security-audit-log");
    return res.data;
};

/** POST /auth/sessions/:sessionId/revoke */
export const revokeAuthSession = async (sessionId) => {
    const res = await axiosInstance.post(`/auth/sessions/${encodeURIComponent(sessionId)}/revoke`);
    return res.data;
};

/** POST /auth/delete-account — body: { confirmation: "delete" }; permanently deletes user and related data. */
export const deleteAccount = async (confirmation) => {
    const res = await axiosInstance.post("/auth/delete-account", { confirmation });
    return res.data;
};