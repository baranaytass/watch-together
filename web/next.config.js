/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        appDir: true,
    },
    async rewrites() {
        return [
            {
                source: '/watch/:sessionId',
                destination: '/watch/:sessionId',
            },
            {
                source: '/api/:path*',
                destination: 'http://backend:5000/api/:path*',
                basePath: false
            },
        ]
    },
}

module.exports = nextConfig 