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

  // Close dropdowns when clicking outside
  useCloseMenuWhenClickedOutside({
    showMenu: isAccountMenuOpen,
    showMenuRef: accountMenuRef,
    setShowMenu: setIsAccountMenuOpen,
  });

  // Close mobile menu when clicking outside
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

  return (
    <>
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={closeCreateProjectModal}
      />

      <div
        className="sticky top-0 z-50 bg-white shadow-sm print:hidden"
        ref={navRef}
      >
        <nav className="relative mx-auto flex w-full max-w-6xl basis-full items-center justify-between gap-4 p-4 sm:px-7 sm:py-3">
          {/* Logo */}
          <div className="flex items-center justify-between gap-x-4 lg:gap-x-8">
            {isCitationPage ? (
              <div className="flex items-center gap-4">
                <Button
                  text="Back"
                  variant="secondary"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  onClick={onBackClick}
                  className="h-10 text-xs sm:text-sm"
                />
                <div className="hidden md:block">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-gray-500">
                    {subtitle}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <Link href={userRoutes?.dashboard}>
                  <Image
                    alt={`${site.title} logo`}
                    src={site.logo}
                    width={120}
                    height={40}
                    className="h-8 w-auto sm:h-10"
                  />
                </Link>
              </>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-x-2 lg:flex">
            {currentUser ? (
              <>
                {shouldUseDashboardNav ? (
                  /* Refined Dashboard Navigation Design */
                  <div className="flex items-center gap-x-4">
                    <div
                      className="flex items-center gap-1"
                      data-tour="nav-links"
                    >
                      {[
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
                      ].map(item => (
                        <Link
                          key={item.label}
                          href={item.href ?? "#"}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#111111] transition-all duration-150 hover:bg-blue-50/70"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    {/* Credit Balance Badge */}
                    <div
                      className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5"
                      data-tour="credit-balance"
                    >
                      <Coins className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-semibold text-blue-700">
                        {desktopBalanceText}
                      </span>
                    </div>

                    <div className="relative" ref={accountMenuRef}>
                      <button
                        onClick={() => setIsAccountMenuOpen(prev => !prev)}
                        className="flex items-center gap-x-3 rounded-full border border-gray-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        aria-label="Account menu"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500">
                          <User className="h-4 w-4 text-white" />
                        </span>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-semibold text-[#111111]">
                            {currentUser?.displayName || "User"}
                          </span>
                          <span className="text-xs text-[#646476]">
                            {currentUser?.email}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            isAccountMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isAccountMenuOpen && (
                        <div className="absolute top-full right-0 z-50 mt-3 w-56 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-2xl backdrop-blur">
                          <div className="space-y-2">
                            {[
                              {
                                label: "Settings",
                                href: userRoutes?.settings,
                                icon: <CogIcon className="h-4 w-4" />,
                              },
                            ].map(item => (
                              <Link
                                key={item.label}
                                href={item.href ?? "#"}
                                onClick={() => setIsAccountMenuOpen(false)}
                                className="flex items-center gap-x-3 rounded-xl border border-transparent px-3 py-2 text-sm text-[#14141A] transition-all duration-150 hover:border-blue-100 hover:bg-blue-50/70"
                              >
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                  {item.icon}
                                </span>
                                {item.label}
                              </Link>
                            ))}
                            <button
                              onClick={() => {
                                signOutUser();
                                setIsAccountMenuOpen(false);
                              }}
                              className="flex w-full items-center gap-x-3 rounded-xl border border-transparent px-3 py-2 text-sm text-red-600 transition-all duration-150 hover:border-red-100 hover:bg-red-50"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
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
                  /* Navigation for Other Pages (desktop) */
                  <div className="flex items-center gap-x-4">
                    <div className="flex items-center gap-1">
                      {[
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
                      ].map(item => (
                        <Link
                          key={item.label}
                          href={item.href ?? "#"}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#111111] transition-all duration-150 hover:bg-blue-50/70"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        signOutUser();
                      }}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  href={authRoutes?.login}
                  className="hover:text-primary-600 flex items-center gap-1 text-sm text-[#0A0A0A] transition-all"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="plain"
              className="!p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              icon={isMobileMenuOpen ? <X size="24" /> : <Menu size="24" />}
            />
          </div>

          {/* Mobile Menu */}
          <div
            className={`absolute top-full right-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out lg:hidden ${
              isMobileMenuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2 opacity-0"
            }`}
          >
            <div
              className={`space-y-4 p-4 transition-all duration-200 ${
                isMobileMenuOpen ? "delay-75" : ""
              }`}
            >
              {currentUser ? (
                <>
                  {shouldUseDashboardNav ? (
                    /* Refined Dashboard Mobile Navigation */
                    <div
                      className={`overflow-hidden rounded-3xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur transition-all duration-200 ${
                        isMobileMenuOpen
                          ? "translate-y-0 opacity-100 delay-100"
                          : "translate-y-1 opacity-0"
                      }`}
                    >
                      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 p-5 text-white">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                            <User className="h-5 w-5 text-white" />
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {currentUser?.displayName || "User"}
                            </span>
                            <span className="text-xs text-white/80">
                              {currentUser?.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 p-4">
                        {/* Credit Balance */}
                        <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">
                              {mobileBalanceLabel}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-blue-700">
                            {mobileBalanceText}
                          </span>
                        </div>

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
                            className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3 text-sm font-medium text-[#111111] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        ))}
                        <button
                          className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-red-600 transition-all hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50"
                          onClick={() => {
                            signOutUser();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <LogOut className="h-4 w-4" />
                          </span>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Old Mobile Navigation for Other Pages */
                    <>
                      {/* User Info */}
                      <div
                        className={`border-b border-gray-200 pb-4 transition-all duration-200 ${
                          isMobileMenuOpen
                            ? "translate-y-0 opacity-100 delay-100"
                            : "translate-y-1 opacity-0"
                        }`}
                      >
                        {isCitationPage ? (
                          <>
                            <p className="text-sm font-semibold text-[#0A0A0A]">
                              {title}
                            </p>
                            <p className="text-sm text-[#717182]">{subtitle}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-[#0A0A0A]">
                              <span className="font-medium">
                                {currentUser?.displayName}
                              </span>
                            </p>
                            <p className="text-sm text-[#717182]">
                              {currentUser?.email}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Navigation Links */}
                      {isCitationPage ? (
                        <button
                          className={`hover:text-primary-600 flex items-center gap-2 py-2 text-sm text-[#0A0A0A] transition-all duration-200 ${
                            isMobileMenuOpen
                              ? "translate-y-0 opacity-100 delay-150"
                              : "translate-y-1 opacity-0"
                          }`}
                          onClick={() => {
                            onBackClick?.();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <ArrowLeft size="20" /> Back
                        </button>
                      ) : (
                        <>
                          {[
                            {
                              href: userRoutes?.dashboard,
                              icon: <LayoutDashboard size="20" />,
                              label: "Dashboard",
                            },
                            {
                              href: userRoutes?.projects,
                              icon: <FileText size="20" />,
                              label: "Projects",
                            },
                            {
                              href: userRoutes?.settings,
                              icon: <CogIcon size="20" />,
                              label: "Settings",
                            },
                          ].map(({ href, icon, label }) => (
                            <Link
                              key={label}
                              href={href ?? "#"}
                              className={`hover:text-primary-600 flex items-center gap-2 py-2 text-sm text-[#0A0A0A] transition-all duration-200 ${
                                isMobileMenuOpen
                                  ? "translate-y-0 opacity-100 delay-150"
                                  : "translate-y-1 opacity-0"
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {icon} {label}
                            </Link>
                          ))}
                        </>
                      )}

                      <Button
                        variant="link"
                        className={`flex items-center justify-start gap-2 p-0 text-sm text-red-600 transition-all duration-200 hover:text-red-700 ${
                          isMobileMenuOpen
                            ? "translate-y-0 opacity-100 delay-200"
                            : "translate-y-1 opacity-0"
                        }`}
                        onClick={() => {
                          signOutUser();
                          setIsMobileMenuOpen(false);
                        }}
                        icon={<LogOut size="20" />}
                      >
                        Sign Out
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Link
                  href={authRoutes?.login}
                  className={`hover:text-primary-600 flex items-center gap-2 py-2 text-sm text-[#0A0A0A] transition-all duration-200 ${
                    isMobileMenuOpen
                      ? "translate-y-0 opacity-100 delay-100"
                      : "translate-y-1 opacity-0"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavBar;
