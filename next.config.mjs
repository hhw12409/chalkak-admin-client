/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/admin',
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
