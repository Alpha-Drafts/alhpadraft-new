import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  TwitterIcon,
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
} from "@/common";
import { publicRoutes } from "@/constants";
import site from "@/site.metadata";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative">
      {/* Gradient fade from page bg to dark footer */}
      <div
        className="h-px bg-gradient-to-r from-transparent to-transparent"
        style={{ "--tw-gradient-via-position": "50%", "--tw-gradient-from": "transparent", "--tw-gradient-to": "transparent", "--tw-gradient-stops": "transparent, var(--color-border-subtle), transparent" } as React.CSSProperties}
      />
      <div style={{ backgroundColor: "var(--color-surface-dark)" }}>
        <footer className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
            <div>
              <Link href={publicRoutes?.home} className="inline-flex items-center">
                <Image
                  src={site.logo}
                  alt={site.title}
                  width={180}
                  height={48}
                  className="object-contain brightness-0 invert"
                />
              </Link>
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "var(--color-text-on-dark-muted)" }}
              >
                Check your work for originality, source matches, and requirement
                coverage before you submit.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--color-text-on-dark)" }}
              >
                Product
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                <li>
                  <Link
                    href={publicRoutes?.features}
                    className="text-sm transition-colors duration-200"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    <span className="hover:text-white">Features</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={publicRoutes?.pricing}
                    className="text-sm transition-colors duration-200"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    <span className="hover:text-white">Pricing</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--color-text-on-dark)" }}
              >
                Support
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                <li>
                  <Link
                    href={publicRoutes?.help}
                    className="text-sm transition-colors duration-200"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    <span className="hover:text-white">Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`mailto:${site?.contact?.emails?.info}`}
                    className="text-sm transition-colors duration-200"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    <span className="hover:text-white">Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--color-text-on-dark)" }}
              >
                Legal
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                <li>
                  <Link
                    href={publicRoutes?.privacy}
                    className="text-sm transition-colors duration-200"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    <span className="hover:text-white">Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={publicRoutes?.terms}
                    className="text-sm transition-colors duration-200"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    <span className="hover:text-white">Terms of Service</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={site?.blog?.url}
                    className="text-sm transition-colors duration-200"
                    style={{ color: "var(--color-text-on-dark-muted)" }}
                  >
                    <span className="hover:text-white">Blog</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-12 flex flex-col items-center justify-between border-t pt-8 md:flex-row"
            style={{ borderColor: "var(--color-surface-dark-container)" }}
          >
            <p
              className="text-sm"
              style={{ color: "var(--color-text-on-dark-muted)" }}
            >
              &copy; {currentYear} Alpha Drafts. All rights reserved.
            </p>
            <div className="mt-5 flex gap-5 md:mt-0">
              {[
                { href: site?.social_handles?.facebook, label: "Facebook", Icon: FacebookIcon },
                { href: site?.social_handles?.twitter, label: "Twitter", Icon: TwitterIcon },
                { href: site?.social_handles?.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
                { href: site?.social_handles?.instagram, label: "Instagram", Icon: InstagramIcon },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="transition-colors duration-200"
                  style={{ color: "var(--color-text-on-dark-muted)" }}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
