import React from "react";
import Head from "next/head";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useRouter } from "next/router";
import { publicRoutes } from "@/constants";
import site from "@/site.metadata";

const SigninPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Sign In — {site.title}</title>
        <meta name="description" content="Sign in to your DocAuditor account to continue your integrity audits." />
      </Head>

      <AuthLayout
        heading="Welcome back to your integrity workspace."
        subheading="Pick up right where you left off — your audits are waiting."
      >
        <LoginForm
          onSwitchToSignup={() => router.push("/signup")}
          onSwitchToForgotPassword={() => router.push("/auth?mode=resetPassword")}
        />

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href={publicRoutes?.home} className="font-medium text-primary-500 hover:underline">
            ← Back to home
          </Link>
        </p>
      </AuthLayout>
    </>
  );
};

export default SigninPage;
