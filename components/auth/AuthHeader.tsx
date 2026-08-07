import { publicRoutes } from "@/constants";
import site from "@/site.metadata";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const AuthHeader = () => {
  return (
    <nav className="auth-nav">
      <Link href={publicRoutes?.home} className="logo">
        <Image
          alt={`${site.title} logo`}
          src={site.logo}
          width={120}
          height={40}
        />
      </Link>
    </nav>
  );
};

export default AuthHeader;
