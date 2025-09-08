import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false, // set true if you want 308 redirect
      },
    ];
  },
};

export default nextConfig;

