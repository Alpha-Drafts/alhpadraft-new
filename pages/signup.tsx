import React from "react";
import Head from "next/head";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";
import { useRouter } from "next/router";
import { publicRoutes } from "@/constants";
import site from "@/site.metadata";

const SignupPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Sign Up — {site.title}</title>
        <meta name="description" content="Create your DocAuditor account to start checking your work for AI flags, plagiarism, and missing requirements." />
      </Head>

      <AuthLayout
        heading="Start auditing your work for integrity."
        subheading="Run AI detection, plagiarism search, and alignment checks — all in one place."
      >
        <SignupForm onSwitchToLogin={() => router.push("/signin")} />

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href={publicRoutes?.home} className="font-medium text-primary-500 hover:underline">
            ← Back to home
          </Link>
        </p>
      </AuthLayout>
    </>
  );
};

export default SignupPage;
