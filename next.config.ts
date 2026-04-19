import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Allow Firebase Google OAuth popup to work correctly.
  // Without same-origin-allow-popups, COOP blocks window.closed checks
  // that Firebase uses to detect when the OAuth popup completes.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
