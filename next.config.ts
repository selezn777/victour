import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    // Коллаж на главной шлёт src с ?v=N (cache-bust при замене/переименовании
    // фото в public/images/collage — имя файла не меняется, а содержимое
    // может, и без этого браузер/CDN могли кэшировать старую картинку под тем
    // же именем). Next 16 по умолчанию блокирует query string у локальных
    // /_next/image src, если путь явно не разрешён здесь.
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
      {
        pathname: "/images/collage/**",
        search: "?v=2",
      },
    ],
  },
};

export default nextConfig;
