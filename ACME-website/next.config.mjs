/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'acme-website-115r.onrender.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
