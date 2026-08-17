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

      <div
        className={`sticky top-0 left-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-slate-200/50 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-2xl"
            : "border-b border-transparent bg-white/40 backdrop-blur-xl"
        }`}
      >
        {/* Subtle bottom glow line when scrolled */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        )}

        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href={publicRoutes?.home} className="flex items-center">
            <Image
              src={site.logo}
              alt={site.title}
              width={150}
              height={48}
              className="object-contain"
            />
          </Link>

          <div className="hidden items-center space-x-8 md:flex">
            <ul className="flex space-x-8">
              {navLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {currentUser ? (
              <div className="flex items-center space-x-2">
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
              </div>
            ) : (
              <Button
                text="Get Started"
                onClick={() => openAuthModal("signup")}
                size="sm"
              />
            )}
          </div>

          <button
            className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
            onClick={toggleMobile}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <XIcon className="h-6 w-6 text-slate-700" />
            ) : (
              <MenuIcon className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <nav className="border-t border-slate-100 bg-white/95 backdrop-blur-2xl md:hidden">
            <div className="flex flex-col space-y-4 px-4 py-5">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {currentUser ? (
                <>
                  <Button
                    text="Dashboard"
                    onClick={() => router.push("/dashboard")}
                    size="sm"
                  />
                  <Button
                    text="Logout"
                    variant="outline"
                    onClick={signOutUser}
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
        )}
      </div>
    </>
  );
};

export default NavBar;
