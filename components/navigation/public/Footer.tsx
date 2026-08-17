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
  const title = "text-sm font-bold text-white";
  const linkClass =
    "text-sm text-slate-400 transition-colors duration-200 hover:text-white";

  const currentYear = new Date().getFullYear();
  return (
    <div className="relative">
      {/* Gradient fade from page bg to dark footer */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="bg-slate-900">
        <footer className="container mx-auto w-full max-w-7xl px-4 py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Link
                href={publicRoutes?.home}
                className="inline-flex items-center space-x-2"
              >
                <Image
                  src={site.logo}
                  alt={site.title}
                  width={180}
                  height={48}
                  className="object-contain brightness-0 invert"
                />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Check your work for originality, source matches, and requirement
                coverage before you submit.
              </p>
            </div>

            <div>
              <h3 className={title}>Product</h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href={publicRoutes?.features} className={linkClass}>
                    Features
                  </Link>
                </li>
                <li>
                  <Link href={publicRoutes?.pricing} className={linkClass}>
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={title}>Support</h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href={publicRoutes?.help} className={linkClass}>
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href={`mailto:${site?.contact?.emails?.info}`}
                    className={linkClass}
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={title}>Legal</h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href={publicRoutes?.privacy} className={linkClass}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href={publicRoutes?.terms} className={linkClass}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href={site?.blog?.url} className={linkClass}>
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-sm text-slate-500">
              &copy; {currentYear} Alpha Drafts. All rights reserved.
            </p>
            <div className="mt-5 flex space-x-5 md:mt-0">
              <Link
                href={site?.social_handles?.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5 text-slate-500 transition-colors duration-200 hover:text-white" />
              </Link>
              <Link
                href={site?.social_handles?.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <TwitterIcon className="h-5 w-5 text-slate-500 transition-colors duration-200 hover:text-white" />
              </Link>
              <Link
                href={site?.social_handles?.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5 text-slate-500 transition-colors duration-200 hover:text-white" />
              </Link>
              <Link
                href={site?.social_handles?.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5 text-slate-500 transition-colors duration-200 hover:text-white" />
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
