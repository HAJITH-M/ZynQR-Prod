import axiosInstance from "./axiosInstance";

/** POST /static-qr/create — encoded bitmap only; no redirect / scan analytics pipeline. */
export async function createStaticQr({ name, encoded_payload }) {
  const res = await axiosInstance.post("/static-qr/create", { name, encoded_payload });
  return res.data;
}

/** GET /static-qr/list */
export async function fetchStaticQrList() {
  const res = await axiosInstance.get("/static-qr/list");
  return res.data;
}

/** DELETE /static-qr/:id */
export async function deleteStaticQr(id) {
  const res = await axiosInstance.delete(`/static-qr/${encodeURIComponent(id)}`);
  return res.data;
}
