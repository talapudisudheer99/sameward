import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Temporary: off while inspecting socket join/leave in DevTools.
  // Re-enable (or delete this line — default is true) after testing.
  reactStrictMode: true,
}

export default nextConfig
