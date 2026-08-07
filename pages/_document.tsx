import site from "@/site.metadata";
import { Html, Head, Main, NextScript } from "next/document";
import { Fragment } from "react";

const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        <meta name="view-transition" content="same-origin" />
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        {isProduction && site?.analytics && (
          <Fragment>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${site.analytics}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', ${site.analytics}, {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </Fragment>
        )}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
