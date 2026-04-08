/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-storefront/storefront-components', '@ai-storefront/types'],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
