import React, { useRef, useState, useEffect } from "react";
import { Eye, EyeOff, FileText, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/common";
import { apiClient, normalizePlanName, validateImageInputType } from "@/utils";
import { useRouter } from "next/router";
import { API_BASE_URL } from "@/constants";
import { toast } from "react-toastify";
import { useAccountStatistics } from "@/hooks/payment/useAccountStatistics";

import { useGetUser } from "@/hooks/auth/useGetUser";
import { AvatarUploader } from "./AvatarUploader";
import { useCurrentSubscription } from "@/hooks";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

/* ─── Shared card class constants ─── */
const CARD =
  "rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-6 transition-[box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]";

const LABEL = "text-body-medium-14 block text-[var(--color-text-primary)]";
const INPUT =
  "text-body-regular-14 mt-1 block w-full rounded-[var(--radius-input)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-background)] px-3 py-2.5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/20";
const HELPER = "text-body-regular-12 mt-1 text-[var(--color-text-tertiary)]";
const ERROR_TEXT = "text-body-regular-12 mt-1 text-[var(--color-error)]";

/* ==========================
   AccountStats
   ========================== */
const AccountStats = () => {
  const {
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError,
  } = useAccountStatistics();

  const { data: subscription } = useCurrentSubscription();
  const planName = subscription?.currentPlan;
  const normalizedPlan = normalizePlanName(planName);
  const isSubscription = normalizedPlan === "subscription";

  if (statisticsLoading) {
    return (
      <div className={`${CARD} animate-pulse`}>
        <div className="mb-4 h-5 w-1/3 rounded bg-[var(--color-surface-background)]" />
        <div className="mb-6 h-4 w-2/3 rounded bg-[var(--color-surface-background)]" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-3.5">
            <div className="mb-2 h-4 w-full rounded bg-[var(--color-surface-background)]" />
            <div className="h-2 w-full rounded-full bg-[var(--color-surface-background)]" />
          </div>
        ))}
      </div>
    );
  }

  if (statisticsError) {
    return (
      <div className={CARD}>
        <h4 className="text-body-medium-14 mb-5 text-[var(--color-text-primary)]">
          Account Statistics
        </h4>
        <p className="text-body-regular-12 text-[var(--color-error)]">
          {statisticsError?.message || "Failed to load user statistics."}
        </p>
      </div>
    );
  }

  return (
    <div className={CARD}>
      <h4 className="text-body-medium-14 mb-5 text-[var(--color-text-primary)]">
        Account Statistics
      </h4>
      <dl className="text-body-regular-14 grid grid-cols-2 gap-y-3.5 text-[var(--color-text-primary)]">
        <dt className="text-[var(--color-text-secondary)]">Member since</dt>
        <dd className="text-end">
          {statistics?.memberSince
            ? new Date(statistics.memberSince).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </dd>
        <dt className="text-[var(--color-text-secondary)]">Projects created</dt>
        <dd className="text-end">{statistics?.totalProjects}</dd>
        {isSubscription ? (
          <>
            <dt className="text-[var(--color-text-secondary)]">Renews</dt>
            <dd className="text-end">
              {subscription?.subscriptionRenewalDate
                ? new Date(
                    subscription.subscriptionRenewalDate,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </dd>
          </>
        ) : null}
      </dl>
    </div>
  );
};

/* ==========================
   SecurityCard
   ========================== */
type SecurityCardProps = {
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
};

const SecurityCard: React.FC<SecurityCardProps> = ({
  isProcessing,
  setIsProcessing,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sanitisedPassword = newPassword.trim();
    const sanitisedConfirmPassword = confirmPassword.trim();

    if (!sanitisedPassword || !sanitisedConfirmPassword) {
      setError("All fields are required");
      return;
    }

    if (sanitisedPassword !== sanitisedConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordPattern = /^.{8,}$/;
    if (!passwordPattern.test(sanitisedPassword)) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await apiClient.patch(`${API_BASE_URL}/v1/users/update-password`, {
        password: sanitisedPassword,
      });
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully");
    } catch (err: unknown) {
      console.error("Error changing password:", err);
      const message =
        (err as { message?: string })?.message ??
        "Failed to change password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={CARD}
      aria-busy={isProcessing}
    >
      <h4 className="text-body-medium-14 mb-6 text-[var(--color-text-primary)]">
        Security
      </h4>
      <div className="space-y-4">
        <div>
          <label className={LABEL}>New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={isProcessing}
              className={`${INPUT} ${error ? "!border-[var(--color-error)]" : ""}`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              disabled={isProcessing}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className={LABEL}>Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isProcessing}
              className={`${INPUT} ${error ? "!border-[var(--color-error)]" : ""}`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              disabled={isProcessing}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && <p className={ERROR_TEXT}>{error}</p>}

        <Button
          type="submit"
          text="Change Password"
          icon={<Lock className="mr-2 h-4 w-4" />}
          className="mt-2"
          disabled={isProcessing || !newPassword || !confirmPassword}
        />
      </div>
    </form>
  );
};

/* ==========================
   ReplayTourCard
   ========================== */
const ReplayTourCard: React.FC = () => {
  const router = useRouter();

  return (
    <div className={CARD}>
      <h4 className="text-body-medium-14 text-[var(--color-text-primary)]">
        Product Tour
      </h4>
      <p className="text-body-regular-14 mt-1 text-[var(--color-text-tertiary)]">
        Replay the guided walkthrough of the dashboard.
      </p>
      <Button
        text="Replay Tour"
        variant="secondary"
        icon={<RotateCcw className="mr-2 h-4 w-4" />}
        className="mt-4"
        onClick={() => {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith("docauditor_tour_completed_")) {
              localStorage.removeItem(key);
            }
          });
          router.push("/dashboard?tour=1");
        }}
      />
    </div>
  );
};

/* ==========================
   Accounts
   ========================== */
const Accounts: React.FC = () => {
  const { data: user, refetch } = useGetUser();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const userAvatarUrl = user?.avatar;
  const displayImageUrl = selectedImageUrl || userAvatarUrl;

  useEffect(() => {
    if (user) {
      setFullName(user?.name || "");
      setEmail(user?.email || "");
      setPhotoChanged(false);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (selectedImageUrl && selectedImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImageUrl);
      }
    };
  }, [selectedImageUrl]);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const onClickChange = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const typeError = validateImageInputType(file);
    if (typeError) {
      setError(typeError);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`Max file size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedImageUrl(url);
    setPhotoChanged(true);
  };

  const removeSelection = () => {
    if (isProcessing) return;
    setSelectedFile(null);
    if (selectedImageUrl && selectedImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImageUrl);
    }
    setSelectedImageUrl(null);
    setError(null);
    setPhotoChanged(true);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    return newErrors;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName);

      if (photoChanged) {
        if (selectedFile) {
          formData.append("file", selectedFile, selectedFile.name);
        } else {
          formData.append("removePhoto", "true");
        }
      }

      await apiClient.patch(
        `${API_BASE_URL}/v1/users/update-profile`,
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        },
      );

      await refetch();

      setPhotoChanged(false);
      setSelectedFile(null);
      if (selectedImageUrl && selectedImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImageUrl);
      }
      setSelectedImageUrl(null);

      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      const message =
        (err as { message?: string })?.message ??
        "Failed to update profile. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Profile card */}
      <div className={`mx-auto w-full max-w-2xl flex-1 lg:mx-0 ${CARD}`}>
        <div className="mb-6">
          <h2 className="text-body-semibold-14 text-[var(--color-text-primary)]">
            Profile Information
          </h2>
          <p className="text-body-regular-14 mt-1 text-[var(--color-text-tertiary)]">
            Update your personal details and profile information.
          </p>
        </div>

        <AvatarUploader
          displayImageUrl={displayImageUrl || ""}
          selectedFile={selectedFile}
          isProcessing={isProcessing}
          onClickChange={onClickChange}
          onRemove={removeSelection}
          error={error}
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileChange}
          disabled={isProcessing}
        />

        <form
          onSubmit={onSubmit}
          className="space-y-5"
          aria-busy={isProcessing}
        >
          <div>
            <label className={LABEL}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={isProcessing}
              className={`${INPUT} ${errors.fullName ? "!border-[var(--color-error)]" : ""}`}
            />
            {errors.fullName && (
              <p className={ERROR_TEXT}>{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className={LABEL}>Email Address</label>
            <input
              type="email"
              value={email}
              readOnly
              disabled
              className={`${INPUT} opacity-60`}
            />
            <p className={HELPER}>Email cannot be changed here.</p>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              text="Save Changes"
              icon={<FileText className="mr-2 h-4 w-4" />}
              disabled={isProcessing || !fullName}
            />
          </div>
        </form>
      </div>

      {/* Sidebar cards */}
      <div className="mx-auto w-full max-w-md space-y-6 lg:mx-0">
        <AccountStats />
        <SecurityCard
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
        <ReplayTourCard />
      </div>
    </div>
  );
};

export default Accounts;
