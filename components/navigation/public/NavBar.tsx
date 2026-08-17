"use client";

import { Button } from "@/common";
import AuthModal, { AuthFormType } from "@/components/auth/AuthModal";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon, XIcon, LogOut } from "lucide-react";
import { publicRoutes } from "@/constants";
import site from "@/site.metadata";
import { useAuthModal } from "@/context";
import { useCurrentUser, useSignOutUser } from "@/hooks";

const NavBar = () => {
  const { currentUser } = useCurrentUser();
  const { signOutUser } = useSignOutUser();

  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isOpen, initialForm, openAuthModal, closeAuthModal } = useAuthModal();

  useEffect(() => {
    const { auth } = router.query;

    if (auth) {
      const formType = auth as AuthFormType;
      if (["signup", "login", "forgot-password"].includes(formType)) {
        openAuthModal(formType);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { auth, ...restQuery } = router.query;
        router.replace(
          {
            pathname: router.pathname,
            query: restQuery,
          },
          undefined,
          { shallow: true },
        );
      }
    }
  }, [router, openAuthModal]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobile = () => setMobileOpen(prev => !prev);

  const navLinks = [
    { label: "Features", href: publicRoutes?.features },
    { label: "How It Works", href: publicRoutes?.how_it_works },
    { label: "Pricing", href: publicRoutes?.pricing },
  ];

  return (
    <>
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        initialForm={initialForm}
      />

      <header
        className={`nav-header ${scrolled ? "nav-header--scrolled" : ""}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href={publicRoutes?.home} className="flex items-center">
            <Image
              src={site.logo}
              alt={site.title}
              width={150}
              height={48}
              className="h-8 w-auto object-contain sm:h-10"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            <nav className="flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.label} href={link.href} className="nav-link">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="ml-2 flex items-center gap-2">
              {currentUser ? (
                <>
                  <Button
                    text="Dashboard"
                    onClick={() => router.push("/dashboard")}
                    size="sm"
                  />
                  <Button
                    text="Logout"
                    variant="secondary"
                    onClick={signOutUser}
                    icon={<LogOut className="h-4 w-4" />}
                    size="sm"
                  />
                </>
              ) : (
                <Button
                  text="Get Started"
                  onClick={() => openAuthModal("signup")}
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="rounded-[var(--radius-button)] p-2 md:hidden"
            onClick={toggleMobile}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <XIcon className="h-6 w-6" style={{ color: "var(--color-text-primary)" }} />
            ) : (
              <MenuIcon className="h-6 w-6" style={{ color: "var(--color-text-primary)" }} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden border-t transition-all duration-300 md:hidden ${
            mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{
            borderColor: "var(--color-border-subtle)",
            backgroundColor: "var(--color-surface-container)",
          }}
        >
          <nav className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--color-border-subtle)" }}>
              {currentUser ? (
                <>
                  <Button
                    text="Dashboard"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/dashboard");
                    }}
                    size="sm"
                  />
                  <Button
                    text="Logout"
                    variant="secondary"
                    onClick={() => {
                      setMobileOpen(false);
                      signOutUser();
                    }}
                    icon={<LogOut className="h-4 w-4" />}
                    size="sm"
                  />
                </>
              ) : (
                <Button
                  text="Get Started"
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal("signup");
                  }}
                  size="sm"
                />
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default NavBar;
