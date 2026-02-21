import type { User } from "@/store/authSlice";

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateProfileData = {
  name: string;
  email: string;
};

export type ChangePasswordResponse = {
  message: string;
};

export type UpdateProfileResponse = {
  message: string;
  user: User;
};
