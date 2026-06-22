import { validateEnv } from "./lib/env";

validateEnv();

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
