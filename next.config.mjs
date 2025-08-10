/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.freecellwithfriends.com' }],
        destination: 'https://freecellwithfriends.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;