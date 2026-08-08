/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from "next";
import path from "path";

const isAnalyze = process.env.ANALYZE === "true";

const withBundleAnalyzer = isAnalyze
  ? require("@next/bundle-analyzer")({ enabled: true })
  : (config: NextConfig) => config;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["pdfjs-dist"],
  images: {
    // Legacy avatar domains (Google) + R2 presigned file URLs from the
    // decoupled backend (firebase storage is gone).
    domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      ...(process.env.R2_PUBLIC_URL
        ? (() => {
            try {
              const host = new URL(process.env.R2_PUBLIC_URL).hostname;
              return [{ protocol: "https" as const, hostname: host }];
            } catch {
              return [];
            }
          })()
        : []),
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer && config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        yjs: path.resolve(__dirname, "node_modules/yjs"),
      };
    }

    return config;
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
    return [
      {
        source: "/v1/:path*",
        destination: `${backendUrl}/v1/:path*`,
      },
      {
        source: "/v2/:path*",
        destination: `${backendUrl}/v2/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
