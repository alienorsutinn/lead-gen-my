/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@lead-gen-my/core", "@lead-gen-my/db"],
};

// Forced reload for Prisma client sync
module.exports = nextConfig;
