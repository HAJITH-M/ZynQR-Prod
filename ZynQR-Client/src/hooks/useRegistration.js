import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api/auth.api";

/**
 * Registration mutation only — no alerts or navigation here.
 * Callers should use mutateAsync + try/catch (or mutate with per-call callbacks) so success and error never double-fire.
 */
export function useRegistration() {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: registerUser,
    retry: false,
  });
}
