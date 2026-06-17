import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.daewon469.com", pathname: "/**" },
      { protocol: "https", hostname: "smartgauge.co.kr", pathname: "/**" },
      { protocol: "https", hostname: "api.smartgauge.co.kr", pathname: "/**" },
    ],
  },
};

export default nextConfig;
