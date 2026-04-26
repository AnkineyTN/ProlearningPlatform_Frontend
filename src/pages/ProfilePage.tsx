import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Save, X } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setUser } from "@/store/authSlice";
import { authAPI } from "@/services/endpoints/auth";
import type { ApiErrorResponse } from "@/services/types/auth.types";

import { Input } from "@/components/ui/input";
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
type ProfileTab = "profile" | "preferences" | "security" | "billing";

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "profile", label: "Hồ sơ" },
  { id: "preferences", label: "Tuỳ chỉnh" },
  { id: "security", label: "Bảo mật" },
  { id: "billing", label: "Gói & thanh toán" },
];

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11.5px] tracking-[0.06em] uppercase text-[var(--pl-text-faint)]">
    {children}
  </span>
);

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11.5px] italic font-[var(--font-serif)] text-[var(--pl-text-faint)]">
    {children}
  </span>
);

const Section = ({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-[16px] mb-5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] p-7">
    <div className="mb-5">
      <h3 className="text-[22px] font-medium tracking-tight m-0 mb-1 font-[var(--font-display)] text-[var(--pl-text)]">
        {title}
      </h3>
      {sub && (
        <p className="text-[13px] m-0 italic font-[var(--font-serif)] text-[var(--pl-text-muted)]">
          {sub}
        </p>
      )}
    </div>
    {children}
  </section>
);

const inputCls =
  "w-full rounded-[8px] text-sm outline-none transition-colors bg-[var(--pl-bg)] border border-[var(--pl-border)] text-[var(--pl-text)] focus:border-[var(--pl-accent)] px-3.5 py-[11px]";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [bio, setBio] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Preferences local state
  const [prefs, setPrefs] = useState({
    notifPush: true,
    notifEmail: false,
    notifReminders: true,
    weekStart: "mon",
  });

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
        // token invalid — global guards handle redirect
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

  const handleCancel = () => {
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
  };

  const avatarLetters =
    `${(user?.firstName ?? "").charAt(0)}${(user?.lastName ?? "").charAt(0)}`.toUpperCase() || "?";

  return (
    <div className="pt-8 px-10 pb-20 max-w-[1100px] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]">
          Tài khoản
        </div>
        <h1 className="text-[44px] font-normal tracking-tight leading-[1.05] m-0 mb-1.5 font-[var(--font-display)] text-[var(--pl-text)]">
          Hồ sơ của bạn
        </h1>
        <p className="text-[17px] italic m-0 font-[var(--font-serif)] text-[var(--pl-text-muted)]">
          Quản lý thông tin, gói và sở thích học tập — chỉ bạn mới thấy được.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-7 border-b border-[var(--pl-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 text-[13px] transition-all -mb-px border-b-2 ${
              activeTab === t.id
                ? "text-[var(--pl-text)] font-medium border-[var(--pl-accent)]"
                : "text-[var(--pl-text-muted)] font-normal border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {activeTab === "profile" && (
        <>
          <Section
            title="Thông tin cơ bản"
            sub="Tên hiển thị, email, ảnh đại diện."
          >
            {/* Avatar + identity */}
            <div className="flex gap-7 items-start mb-6 pb-6 border-b border-dashed border-[var(--pl-border)]">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full grid place-items-center text-[36px] font-medium bg-[linear-gradient(135deg,_var(--pl-accent),_var(--pl-accent-strong))] text-[var(--pl-accent-fg)] font-[var(--font-display)]">
                  {avatarLetters}
                </div>
              </div>
              <div className="flex-1 pt-1.5">
                <div className="text-[24px] font-medium tracking-tight mb-1 font-[var(--font-display)] text-[var(--pl-text)]">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[13.5px] mb-2 flex items-center gap-2.5 flex-wrap text-[var(--pl-text-muted)]">
                  <span>{user?.email}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--pl-text-faint)]" />
                  <span className="px-[9px] py-0.5 rounded-full text-[10.5px] tracking-[0.1em] uppercase font-medium bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]">
                    {user?.accountType ?? "FREE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
              <label className="flex flex-col gap-1.5">
                <FieldLabel>First name</FieldLabel>
                <Input
                  disabled={loading}
                  {...register("firstName")}
                  className={inputCls}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <FieldLabel>Last name</FieldLabel>
                <Input
                  disabled={loading}
                  {...register("lastName")}
                  className={inputCls}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <FieldLabel>Email</FieldLabel>
                <Input
                  disabled={loading}
                  type="email"
                  {...register("email")}
                  className={inputCls}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
                <FieldHint>Dùng để đăng nhập và nhận thông báo.</FieldHint>
              </label>

              <label className="flex flex-col gap-1.5">
                <FieldLabel>Account type</FieldLabel>
                <Input
                  disabled
                  value={watch("accountType") ?? ""}
                  className={inputCls + " text-[var(--pl-text-faint)] bg-[var(--pl-bg-hover)]"}
                />
                <FieldHint>Field này dạng để hiển thị (không sửa).</FieldHint>
              </label>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Giới thiệu ngắn về bản thân…"
                  className={inputCls + " resize-y font-[var(--font-serif)] text-[15px] leading-[1.55]"}
                />
              </div>
            </div>
          </Section>

          <Section
            title="Hồ sơ học tập"
            sub="Giúp ProLearning gợi ý nội dung phù hợp hơn."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Language</FieldLabel>
                <Select
                  value={language}
                  onValueChange={(v) => setValue("language", v, { shouldDirty: true })}
                  disabled={loading}
                >
                  <SelectTrigger className={inputCls + " cursor-pointer"}>
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
                  <p className="text-xs text-destructive">{errors.language.message}</p>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <FieldLabel>Education</FieldLabel>
                <Select
                  value={education}
                  onValueChange={(v) => setValue("education", v, { shouldDirty: true })}
                  disabled={loading}
                >
                  <SelectTrigger className={inputCls + " cursor-pointer"}>
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
                  <p className="text-xs text-destructive">{errors.education.message}</p>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <FieldLabel>Hear app from</FieldLabel>
                <Select
                  value={hearAppFrom}
                  onValueChange={(v) => setValue("hearAppFrom", v, { shouldDirty: true })}
                  disabled={loading}
                >
                  <SelectTrigger className={inputCls + " cursor-pointer"}>
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
                  <p className="text-xs text-destructive">{errors.hearAppFrom.message}</p>
                )}
              </label>
            </div>
          </Section>

          {/* Sticky save bar */}
          <div className="flex justify-end gap-2.5 py-5 sticky bottom-20">
            <button
              type="button"
              disabled={loading}
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-full text-[13px] transition-colors border border-[var(--pl-border)] text-[var(--pl-text-muted)]"
            >
              <X className="w-3.5 h-3.5" />
              Huỷ
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading || !isDirty}
              className="inline-flex items-center gap-1.5 px-[22px] py-2.5 rounded-full text-[13px] font-medium transition-opacity disabled:opacity-50 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </div>
        </>
      )}

      {/* ── Preferences tab ── */}
      {activeTab === "preferences" && (
        <>
          <Section
            title="Thông báo"
            sub="Bạn muốn ProLearning chạm vai bạn lúc nào?"
          >
            <div className="flex flex-col">
              {([
                { k: "notifPush" as const, label: "Push notifications", desc: "Nhắc học flashcard, deadline goal." },
                { k: "notifEmail" as const, label: "Email summaries", desc: "Tổng kết tuần, bundle mới được đề xuất." },
                { k: "notifReminders" as const, label: "Daily streak reminder", desc: "Nhắc nhẹ vào 20:00 nếu hôm đó chưa học." },
              ]).map((o) => (
                <label
                  key={o.k}
                  className="flex justify-between items-center py-3.5 cursor-pointer border-t border-[var(--pl-border)]"
                >
                  <div>
                    <div className="text-[14px] font-medium text-[var(--pl-text)]">
                      {o.label}
                    </div>
                    <div className="text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]">
                      {o.desc}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, [o.k]: !p[o.k] }))}
                    className={`relative flex-shrink-0 w-[38px] h-[22px] rounded-full transition-all border ${
                      prefs[o.k]
                        ? "bg-[var(--pl-accent)] border-[var(--pl-accent)]"
                        : "bg-[var(--pl-bg-hover)] border-[var(--pl-border)]"
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-4 h-4 rounded-full transition-all ${
                        prefs[o.k]
                          ? "left-[17px] bg-[var(--pl-accent-fg)]"
                          : "left-[2px] bg-[var(--pl-text-faint)]"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Hiển thị" sub="Cách bạn nhìn ProLearning.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Tuần bắt đầu vào</FieldLabel>
                <select
                  value={prefs.weekStart}
                  onChange={(e) => setPrefs((p) => ({ ...p, weekStart: e.target.value }))}
                  className={inputCls}
                >
                  <option value="mon">Thứ Hai</option>
                  <option value="sun">Chủ Nhật</option>
                </select>
              </label>
            </div>
          </Section>
        </>
      )}

      {/* ── Security tab ── */}
      {activeTab === "security" && (
        <>
          <Section
            title="Đổi mật khẩu"
            sub="Mật khẩu mới phải ≥ 8 ký tự, có chữ và số."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px] max-w-[720px]">
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Current password</FieldLabel>
                <div className="relative">
                  <Input
                    disabled={loading}
                    type={showOldPw ? "text" : "password"}
                    {...register("currentPassword")}
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]"
                  >
                    {showOldPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <FieldLabel>New password</FieldLabel>
                <div className="relative">
                  <Input
                    disabled={loading}
                    type={showNewPw ? "text" : "password"}
                    {...register("newPassword")}
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]"
                  >
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </label>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="px-[22px] py-2.5 rounded-full text-[13px] font-medium transition-opacity disabled:opacity-50 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]"
              >
                {loading ? "Đang lưu…" : "Đổi mật khẩu"}
              </button>
            </div>
          </Section>

          <Section
            title="Vùng nguy hiểm"
            sub="Hành động không thể hoàn tác."
          >
            <div className="flex justify-between items-center py-3.5 border-t border-[var(--pl-border)]">
              <div>
                <div className="text-[14px] font-medium text-[var(--pl-danger,_oklch(0.65_0.2_25))]">
                  Xoá tài khoản
                </div>
                <div className="text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]">
                  Mọi sets, bundles, ghi chú và tiến độ sẽ bị xoá vĩnh viễn.
                </div>
              </div>
              <button className="px-3.5 py-2 rounded-full text-[12px] transition-colors border border-[var(--pl-danger,_oklch(0.65_0.2_25))] text-[var(--pl-danger,_oklch(0.65_0.2_25))]">
                Xoá tài khoản
              </button>
            </div>
          </Section>
        </>
      )}

      {/* ── Billing tab ── */}
      {activeTab === "billing" && (
        <Section
          title="Gói hiện tại"
          sub={`Bạn đang dùng gói ${user?.accountType ?? "FREE"}.`}
        >
          <div className="rounded-[14px] mb-6 flex justify-between items-start p-6 bg-[linear-gradient(135deg,_var(--pl-accent-soft),_color-mix(in_oklch,_var(--pl-accent)_6%,_transparent))] border border-[var(--pl-accent-border)]">
            <div>
              <div className="text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-accent-strong)]">
                {user?.accountType ?? "FREE"} Plan
              </div>
              <div className="text-[44px] font-normal tracking-tight leading-none mb-1.5 font-[var(--font-display)] text-[var(--pl-text)]">
                {user?.accountType === "FREE" ? "Miễn phí" : "Pro"}
              </div>
              <div className="text-[13px] text-[var(--pl-text-muted)]">
                {user?.accountType === "FREE"
                  ? "Nâng cấp để mở khoá toàn bộ tính năng."
                  : "Cảm ơn bạn đã tin dùng ProLearning."}
              </div>
            </div>
            {user?.accountType === "FREE" && (
              <button className="px-3.5 py-2.5 rounded-full text-[12.5px] font-medium bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]">
                Nâng cấp Pro
              </button>
            )}
          </div>

          <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
            {[
              "Không giới hạn sets và flashcards",
              "AI generate từ note, file, web URL",
              "Spaced repetition + interval scheduling",
              "Xuất dữ liệu sang Markdown / Anki",
              "Hỗ trợ ưu tiên qua email",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[14px] text-[var(--pl-text)]">
                <svg
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  stroke="oklch(0.72 0.15 155)"
                  fill="none"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
