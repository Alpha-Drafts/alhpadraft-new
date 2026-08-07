import Link from "next/link";
import React from "react";
import Image from "next/image";
import image from "@/public/403.svg";
import { useSignOutUser } from "@/hooks";
import site from "@/site.metadata";
import { userRoutes } from "@/constants";

const UnauthorisedPage = () => {
  const { signOutUser } = useSignOutUser();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-screen-tablet mx-auto space-y-10 px-[36px] py-6 lg:px-[72px] lg:py-12">
        <div className="flex items-center justify-center">
          <Image src={site.logo} alt="Logo" width={77} height={41} />
        </div>

        <Image
          className="mx-auto block aspect-square"
          src={image}
          width={350}
          height={350}
          objectFit="contain"
          alt="Unauthorized Access"
        />

        <div className="space-y-4 text-center">
          <h1 className="text-primary-700 text-4xl font-bold">
            Unauthorized Access
          </h1>
          <p className="font-medium">
            You do not have permission to access this page. Please contact your
            administrator or sign in with an authorized account.
          </p>
          <div className="mx-auto inline-flex gap-x-2">
            <Link
              href={userRoutes?.dashboard}
              className="text-body-bold-20 text-primary-600 underline"
            >
              Back to Home
            </Link>
            <button
              onClick={() => signOutUser()}
              className="text-body-bold-20 text-red-500 underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorisedPage;
