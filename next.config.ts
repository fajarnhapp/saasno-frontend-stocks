import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    reactStrictMode: true,
    productionBrowserSourceMaps: false,
    output: 'standalone',
    poweredByHeader: false,

    experimental: {
        optimizePackageImports: ['lodash', 'date-fns'],
    },

    modularizeImports: {
        lodash: {
            transform: 'lodash/{{member}}',
        },
    },
}

module.exports = nextConfig