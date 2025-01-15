/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/ace/:path*",
        destination: `${process.env.NEXT_PUBLIC_ACE_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
