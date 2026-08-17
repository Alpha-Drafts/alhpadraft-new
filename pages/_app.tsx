import "vanilla-cookieconsent/dist/cookieconsent.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode, useEffect } from "react";
import * as CookieConsent from "vanilla-cookieconsent";
import { cookieconsentConfig } from "@/utils";
import { NextPage } from "next";
import { ToastContainer } from "react-toastify";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/others/ErrorBoundary";
import { AppProviders } from "@/context";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  useEffect(() => {
    if (!isProduction) return;

    CookieConsent.run(cookieconsentConfig);
  }, []);

  const getLayout =
    Component.getLayout ?? ((_page: ReactElement) => <>{_page}</>);

  return (
    <div className={inter.variable}>
      <AppProviders>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ToastContainer />
          {getLayout(<Component {...pageProps} />)}
        </ErrorBoundary>
      </AppProviders>
    </div>
  );
}
