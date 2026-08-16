/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'freecellwithfriends.com' }],
        destination: 'https://www.freecellwithfriends.com/:path*',
        permanent: true,
      },
    ];
  }
};

export default nextConfig;