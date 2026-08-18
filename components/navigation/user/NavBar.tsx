import {
  LogOut,
  CogIcon,
  Menu,
  X,
  LayoutDashboard,
  ArrowLeft,
  FileText,
  ChevronDown,
  User,
  Coins,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { authRoutes, FREE_PLAN_LIMITS, userRoutes } from "@/constants";
import {
  useCurrentSubscription,
  useCurrentUser,
  useSignOutUser,
} from "@/hooks";
import { useCredits } from "@/context";
import { formatCredits, isFreePlan as checkIsFreePlan } from "@/utils";
import CreateProjectModal from "@/components/dashboard/overview/CreateProjectModal";
import site from "@/site.metadata";
import { Button } from "@/common";
import { useCloseMenuWhenClickedOutside } from "@/hooks";

const NavBar = ({
  isCitationPage,
  title,
  subtitle,
  onBackClick,
}: {
  isSettingPage?: boolean;
  isCitationPage?: boolean;
  title?: string;
  subtitle?: string;
  onBackClick?: () => void;
}) => {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const closeCreateProjectModal = () => setShowCreateProjectModal(false);
  const { currentUser } = useCurrentUser();
  const { signOutUser } = useSignOutUser();
  const { data: subscriptionUser, isLoading: subscriptionLoading } =
    useCurrentSubscription();
  const { balance } = useCredits();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const splittedPathName = router.pathname.split("/");
  const shouldUseDashboardNav =
    Object.values(userRoutes).includes(router.pathname) ||
    splittedPathName.includes("dashboard");
  const isFreePlan = checkIsFreePlan(subscriptionUser?.currentPlan);
  const freeChecksUsed = subscriptionUser?.freeChecksUsed ?? 0;
  const freeChecksLeft = Math.max(
    0,
    FREE_PLAN_LIMITS.checksPerMonth - freeChecksUsed,
  );
  const desktopBalanceText = isFreePlan
    ? subscriptionLoading
      ? "..."
      : `${freeChecksLeft} checks left`
    : formatCredits(balance);
  const mobileBalanceLabel = isFreePlan ? "Checks left" : "Credits";
  const mobileBalanceText = isFreePlan
    ? subscriptionLoading
      ? "..."
      : `${freeChecksLeft} / ${FREE_PLAN_LIMITS.checksPerMonth}`
    : formatCredits(balance);

  useCloseMenuWhenClickedOutside({
    showMenu: isAccountMenuOpen,
    showMenuRef: accountMenuRef,
    setShowMenu: setIsAccountMenuOpen,
  });

  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dashboardLinks = [
    {
      label: "Dashboard",
      href: userRoutes?.dashboard,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "All Projects",
      href: userRoutes?.projects,
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  const allLinks = [
    {
      label: "Dashboard",
      href: userRoutes?.dashboard,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Projects",
      href: userRoutes?.projects,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: userRoutes?.settings,
      icon: <CogIcon className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={closeCreateProjectModal}
      />

      <header className="nav-header" ref={navRef}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          {/* Logo / Back Button */}
          <div className="flex items-center gap-4">
            {isCitationPage ? (
              <div className="flex items-center gap-4">
                <Button
                  text="Back"
                  variant="secondary"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  onClick={onBackClick}
                  className="h-10 text-xs sm:text-sm"
                />
                {title && (
                  <div className="hidden md:block">
                    <span
                      className="block font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {title}
                    </span>
                    {subtitle && (
                      <span
                        className="block text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {subtitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link href={userRoutes?.dashboard}>
                <Image
                  alt={`${site.title} logo`}
                  src={site.logo}
                  width={120}
                  height={40}
                  className="h-8 w-auto sm:h-10"
                />
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 lg:flex">
            {currentUser ? (
              <>
                {shouldUseDashboardNav ? (
                  <div className="flex items-center gap-4">
                    {/* Nav Links */}
                    <nav className="flex items-center gap-1" data-tour="nav-links">
                      {dashboardLinks.map(item => (
                        <Link
                          key={item.label}
                          href={item.href ?? "#"}
                          className="nav-link"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                    </nav>

                    {/* Credit Balance Badge — Glass pill */}
                    <div
                      className="flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5"
                      style={{
                        background: "rgba(224, 242, 254, 0.7)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(224, 242, 254, 0.6)",
                        color: "var(--color-on-primary-container)",
                      }}
                      data-tour="credit-balance"
                    >
                      <Coins className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">
                        {desktopBalanceText}
                      </span>
                    </div>

                    {/* Account Menu — Glass trigger button */}
                    <div className="relative" ref={accountMenuRef}>
                      <button
                        onClick={() => setIsAccountMenuOpen(prev => !prev)}
                        className="flex items-center gap-3 rounded-[var(--radius-pill)] border px-4 py-2 transition-[var(--transition-premium)] hover:-translate-y-0.5 hover:shadow-[var(--elevation-1)]"
                        style={{
                          borderColor: "var(--glass-border)",
                          background: "var(--glass-bg)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                        }}
                        aria-label="Account menu"
                      >
                        <span className="nav-avatar">
                          <User className="h-4 w-4 text-white" />
                        </span>
                        <div className="flex flex-col text-left">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {currentUser?.displayName || "User"}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            {currentUser?.email}
                          </span>
                        </div>
                        <ChevronDown
                          className="h-4 w-4 transition-transform"
                          style={{
                            color: "var(--color-text-tertiary)",
                            transform: isAccountMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      </button>

                      {isAccountMenuOpen && (
                        <div
                          className="popover-premium absolute right-0 top-full z-50 mt-3 w-56"
                        >
                          <div className="flex flex-col gap-1">
                            <Link
                              href={userRoutes?.settings}
                              onClick={() => setIsAccountMenuOpen(false)}
                              className="nav-link"
                            >
                              <span
                                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)]"
                                style={{ backgroundColor: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
                              >
                                <CogIcon className="h-4 w-4" />
                              </span>
                              Settings
                            </Link>

                            <button
                              onClick={() => {
                                signOutUser();
                                setIsAccountMenuOpen(false);
                              }}
                              className="nav-link nav-link--danger w-full"
                            >
                              <span
                                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)]"
                                style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-error)" }}
                              >
                                <LogOut className="h-4 w-4" />
                              </span>
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Non-dashboard pages (desktop) */
                  <div className="flex items-center gap-4">
                    <nav className="flex items-center gap-1">
                      {allLinks.map(item => (
                        <Link
                          key={item.label}
                          href={item.href ?? "#"}
                          className="nav-link"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                    </nav>

                    <button
                      onClick={() => signOutUser()}
                      className="nav-link nav-link--danger"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={authRoutes?.login}
                className="nav-link"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <Button
              variant="plain"
              className="!p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              icon={isMobileMenuOpen ? <X size="24" /> : <Menu size="24" />}
            />
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className="overflow-hidden border-t transition-all duration-300 lg:hidden"
          style={{
            borderColor: "var(--color-border-subtle)",
            maxHeight: isMobileMenuOpen ? "600px" : "0",
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
        >
          <div className="p-4">
            {currentUser ? (
              <>
                {shouldUseDashboardNav ? (
                  /* Dashboard Mobile Menu */
                  <div
                    className="overflow-hidden"
                    style={{
                      borderRadius: "var(--radius-card-elevated)",
                      border: "1px solid var(--color-border-subtle)",
                      backgroundColor: "var(--color-surface-container)",
                    }}
                  >
                    {/* User Info Header */}
                    <div
                      className="p-5"
                      style={{
                        background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover), var(--color-surface-dark))",
                        borderRadius: "var(--radius-card-elevated) var(--radius-card-elevated) 0 0",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="nav-avatar" style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                          <User className="h-5 w-5 text-white" />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">
                            {currentUser?.displayName || "User"}
                          </span>
                          <span className="text-xs text-white/80">
                            {currentUser?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Balance & Links */}
                    <div className="flex flex-col gap-3 p-4">
                      {/* Credit Balance */}
                      <div
                        className="flex items-center justify-between rounded-[var(--radius-card)] px-4 py-3"
                        style={{
                          border: "1px solid rgba(224, 242, 254, 0.6)",
                          background: "rgba(224, 242, 254, 0.5)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                          <span
                            className="text-sm font-medium"
                            style={{ color: "var(--color-on-primary-container)" }}
                          >
                            {mobileBalanceLabel}
                          </span>
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: "var(--color-on-primary-container)" }}
                        >
                          {mobileBalanceText}
                        </span>
                      </div>

                      {/* Nav Links */}
                      {[
                        {
                          label: "Projects",
                          href: userRoutes?.projects,
                          icon: <FileText className="h-4 w-4" />,
                        },
                        {
                          label: "Settings",
                          href: userRoutes?.settings,
                          icon: <CogIcon className="h-4 w-4" />,
                        },
                      ].map(item => (
                        <Link
                          key={item.label}
                          href={item.href ?? "#"}
                          className="nav-link"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)]"
                            style={{ backgroundColor: "var(--color-primary-container)", color: "var(--color-primary)" }}
                          >
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      ))}

                      {/* Sign Out */}
                      <button
                        className="nav-link nav-link--danger w-full"
                        onClick={() => {
                          signOutUser();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)]"
                          style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-error)" }}
                        >
                          <LogOut className="h-4 w-4" />
                        </span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Non-dashboard Mobile Menu */
                  <div className="flex flex-col gap-3">
                    {/* User Info */}
                    {isCitationPage ? (
                      <div
                        className="border-b pb-3"
                        style={{ borderColor: "var(--color-border-subtle)" }}
                      >
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {title}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {subtitle}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="border-b pb-3"
                        style={{ borderColor: "var(--color-border-subtle)" }}
                      >
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {currentUser?.displayName}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {currentUser?.email}
                        </p>
                      </div>
                    )}

                    {/* Links */}
                    {isCitationPage ? (
                      <button
                        className="nav-link"
                        onClick={() => {
                          onBackClick?.();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <ArrowLeft size="20" /> Back
                      </button>
                    ) : (
                      <>
                        {allLinks.map(({ href, icon, label }) => (
                          <Link
                            key={label}
                            href={href ?? "#"}
                            className="nav-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {icon} {label}
                          </Link>
                        ))}
                      </>
                    )}

                    <Button
                      variant="link"
                      className="nav-link nav-link--danger mt-1"
                      onClick={() => {
                        signOutUser();
                        setIsMobileMenuOpen(false);
                      }}
                      icon={<LogOut size="20" />}
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={authRoutes?.login}
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default NavBar;
