import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  forgotPassword,
  verifyForgotPasswordOtp,
  updateForgotPassword,
  changePassword,
  patchAuthMe,
} from "../api/auth.api";
import { toastApiError, toastSuccess } from "../utils/toast";

const AUTH_ME_QUERY_KEY = ["auth", "me"];

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: forgotPassword,
    onError: (error) => {
      console.log(error);
      toastApiError(error, "Failed to send reset password email");
    },
  });
};

export const useVerifyForgotPasswordOtp = () => {
  return useMutation({
    mutationKey: ["forgot-password-verify"],
    mutationFn: verifyForgotPasswordOtp,
    onError: (error) => {
      console.log(error);
      toastApiError(error, "Invalid or expired code. Try again.");
    },
  });
};

export const useUpdateForgotPassword = () => {
  return useMutation({
    mutationKey: ["forgot-password-update"],
    mutationFn: updateForgotPassword,
    onError: (error) => {
      console.log(error);
      toastApiError(error, "Could not update password. Try again.");
    },
  });
};

export const useUpdateAuthProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["auth", "me", "patch"],
    mutationFn: (display_name) => patchAuthMe({ display_name }),
    onError: (error) => {
      console.log(error);
      toastApiError(error, "Could not update profile");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, data);
      toastSuccess("Profile updated");
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationKey: ["change-password"],
    mutationFn: changePassword,
    onError: (error) => {
      console.log(error);
      toastApiError(error, "Could not change password. Try again.");
    },
    onSuccess: (data) => {
      console.log(data);
      toastSuccess("Password changed successfully");
    },
  });
};
