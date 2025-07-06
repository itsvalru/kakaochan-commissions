import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "cdn.discordapp.com",
      "foeuyycjnftvfwfrqolx.supabase.co",
    ],
  },
};

export default nextConfig;
