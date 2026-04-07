import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setUser } from "@/store/authSlice";
import { authAPI } from "@/services/endpoints/auth";
import type { ApiErrorResponse } from "@/services/types/auth.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = ["VI", "EN"] as const;
const educations = ["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY", "OTHER"] as const;
const hearAppFromOptions = ["YOUTUBE", "FACEBOOK", "TIKTOK", "FRIEND", "OTHER"] as const;

const schema = z.object({
  firstName: z.string().min(1, "Vui lòng nhập tên").max(50, "Tối đa 50 ký tự"),
  lastName: z.string().min(1, "Vui lòng nhập họ").max(50, "Tối đa 50 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  language: z.string().min(1, "Vui lòng chọn ngôn ngữ"),
  education: z.string().min(1, "Vui lòng chọn học vấn"),
  hearAppFrom: z.string().min(1, "Vui lòng chọn nguồn biết đến"),
  accountType: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);

  const initial = useMemo(() => user, [user]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initial?.firstName ?? "",
      lastName: initial?.lastName ?? "",
      email: initial?.email ?? "",
      language: initial?.language ?? "VI",
      education: initial?.education ?? "HIGH_SCHOOL",
      hearAppFrom: initial?.hearAppFrom ?? "OTHER",
      accountType: initial?.accountType ?? "FREE",
      currentPassword: "",
      newPassword: "",
    },
  });

  const language = watch("language");
  const education = watch("education");
  const hearAppFrom = watch("hearAppFrom");

  useEffect(() => {
    // Keep form in sync when user in store changes (e.g. after fetch)
    reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      language: user?.language ?? "VI",
      education: user?.education ?? "HIGH_SCHOOL",
      hearAppFrom: user?.hearAppFrom ?? "OTHER",
      accountType: user?.accountType ?? "FREE",
      currentPassword: "",
      newPassword: "",
    });
  }, [reset, user]);

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getMe();
        dispatch(setUser(res.data.data));
      } catch {
        // If token invalid, global guards already handle redirect; keep silent here
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    if (!initial) {
      toast.error("Không tìm thấy thông tin user.");
      return;
    }

    const payload: Record<string, string> = {};

    const maybeSet = (k: keyof FormData, v: string | undefined, oldV: string | undefined) => {
      if (typeof v !== "string") return;
      const trimmed = v.trim();
      if (!trimmed) return;
      if ((oldV ?? "").trim() === trimmed) return;
      payload[k as string] = trimmed;
    };

    maybeSet("firstName", data.firstName, initial.firstName);
    maybeSet("lastName", data.lastName, initial.lastName);
    maybeSet("email", data.email, initial.email);
    maybeSet("language", data.language, initial.language);
    maybeSet("education", data.education, initial.education);
    maybeSet("hearAppFrom", data.hearAppFrom, initial.hearAppFrom);

    const newPassword = (data.newPassword ?? "").trim();
    const currentPassword = (data.currentPassword ?? "").trim();

    if (newPassword) {
      payload.newPassword = newPassword;
      if (currentPassword) payload.currentPassword = currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("Không có thay đổi nào để cập nhật.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.updateMe(payload);
      dispatch(setUser(res.data.data));
      toast.success(res.data.message ?? "Cập nhật profile thành công.");

      // Clear password fields after a successful update
      setValue("currentPassword", "");
      setValue("newPassword", "");
    } catch (err: unknown) {
      const payloadErr: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      toast.error(payloadErr?.message ?? "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Xem và cập nhật thông tin tài khoản của bạn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input disabled={loading} {...register("firstName")} />
              {errors.firstName && (
                <p className="text-xs text-red-400">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input disabled={loading} {...register("lastName")} />
              {errors.lastName && (
                <p className="text-xs text-red-400">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input disabled={loading} type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={language}
                onValueChange={(v) => setValue("language", v, { shouldDirty: true })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.language && (
                <p className="text-xs text-red-400">{errors.language.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Education</Label>
              <Select
                value={education}
                onValueChange={(v) => setValue("education", v, { shouldDirty: true })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn học vấn" />
                </SelectTrigger>
                <SelectContent>
                  {educations.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.education && (
                <p className="text-xs text-red-400">{errors.education.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Hear app from</Label>
              <Select
                value={hearAppFrom}
                onValueChange={(v) => setValue("hearAppFrom", v, { shouldDirty: true })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn nguồn" />
                </SelectTrigger>
                <SelectContent>
                  {hearAppFromOptions.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hearAppFrom && (
                <p className="text-xs text-red-400">{errors.hearAppFrom.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account type</Label>
              <Input disabled value={watch("accountType") ?? ""} />
              <p className="text-xs text-muted-foreground">
                Field này đang để hiển thị (không cho sửa).
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="font-semibold">Đổi mật khẩu</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input disabled={loading} type="password" {...register("currentPassword")} />
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input disabled={loading} type="password" {...register("newPassword")} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={loading || !isDirty}
              className="min-w-32"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => {
                reset({
                  firstName: user?.firstName ?? "",
                  lastName: user?.lastName ?? "",
                  email: user?.email ?? "",
                  language: user?.language ?? "VI",
                  education: user?.education ?? "HIGH_SCHOOL",
                  hearAppFrom: user?.hearAppFrom ?? "OTHER",
                  accountType: user?.accountType ?? "FREE",
                  currentPassword: "",
                  newPassword: "",
                });
              }}
            >
              Huỷ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

