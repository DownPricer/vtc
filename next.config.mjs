/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Photos de flotte : servies par l'API centrale (`/media/vehicles/<tenant>/<fichier>.webp`).
   * La réécriture garde des URLs relatives (même origine que le site, domaines personnalisés inclus).
   */
  async rewrites() {
    const api = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
    return api ? [{ source: "/media/:path*", destination: `${api}/media/:path*` }] : [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        // Le navigateur doit toujours revalider le service worker pour détecter les mises à jour.
        source: "/pro/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
