import { api } from "./client";
import type { AuthResponse, UserPublic } from "./types";

export interface Credentials {
  email: string;
  password: string;
}

export const authApi = {
  me: () => api<UserPublic>("/auth/me"),
  login: (body: Credentials) => api<AuthResponse>("/auth/login", { method: "POST", body }),
  register: (body: Credentials & { display_name: string }) =>
    api<AuthResponse>("/auth/register", { method: "POST", body }),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
  refresh: () => api<AuthResponse>("/auth/refresh", { method: "POST" }),
  forgotPassword: (email: string) =>
    api<void>("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token: string, password: string) =>
    api<void>("/auth/reset-password", { method: "POST", body: { token, password } }),
  verifyEmail: (token: string) =>
    api<UserPublic>("/auth/verify-email", { method: "POST", body: { token } }),
  resendVerification: () => api<void>("/auth/verify-email/resend", { method: "POST" }),
};
