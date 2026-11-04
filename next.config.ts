import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Оптимизированные фото кэшируются на CDN Vercel 31 день (по умолчанию 4 часа:
    // после этого заход снова ждал пережатия ~1-2 с на фото). Фото в Blob
    // загружаются под новыми именами, коллаж с ?v=N, так что устаревать нечему.
    minimumCacheTTL: 2678400,
    // Меньше вариантов ширины -> чаще попадание в готовый кэш у разных телефонов
    deviceSizes: [640, 828, 1200, 1920],
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
        search: "?v=4",
      },
    ],
  },
};

export default nextConfig;
