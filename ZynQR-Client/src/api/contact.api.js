import axiosInstance from "./axiosInstance";

/**
 * POST /contact — public contact form (emails CONTACT_INBOX_EMAIL on the server).
 * @param {{ name: string; email: string; topic: string; message: string }} payload
 */
export async function submitContactForm(payload) {
  // SMTP delivery can take >10s; default axios timeout would cancel the request early.
  const res = await axiosInstance.post("/contact", payload, { timeout: 30_000 });
  return res.data;
}
