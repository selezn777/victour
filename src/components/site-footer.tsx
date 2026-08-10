import type { PrimaryGuide } from "@/lib/site-data"

const PHOTO_CREDITS = [
  { title: "Toyota Alphard (2023) interior", author: "芯正", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Toyota_Alphard(2023)_interior_2.jpg" },
  { title: "Po Nagar towers, Nha Trang", author: "Ms Sarah Welch", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:04052023_Ponagar_Hindu_temples_complex,_Nha_Trang_Vietnam_-_150.jpg" },
  { title: "Bai Mon Beach (у маяка Đại Lãnh)", author: "Christophe95", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Bai_Mon_Beach_1.jpg" },
  { title: "Hon Mun island", author: "Nguyen Hung Vu", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Hon_Mun_island_(H%C3%B2n_Mun),_Cam_Ranh,_Nha_Trang,_Vi%E1%BB%87t_Nam_20140518_105634_(taken_with_Samsung_Galaxy_Note_3).jpg" },
  { title: "Hon Tam Resort", author: "Phạm Thúy An", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Hon_Tam_Resort_-_Nha_Trang.jpg" },
  { title: "Da Lat — Xuan Huong Lake", author: "P. Hughes", license: "CC BY 4.0", url: "https://commons.wikimedia.org/wiki/File:Da_Lat_-_Xuan_Huong_Lake.jpg" },
]

export function SiteFooter({ guide }: { guide: PrimaryGuide | null }) {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {guide && (
          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="text-muted-foreground">Гид {guide.name}</span>
            {guide.whatsapp && (
              <a
                className="hover:underline"
                href={`https://wa.me/${guide.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
            {guide.telegram && (
              <a
                className="hover:underline"
                href={`https://t.me/${guide.telegram.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Telegram
              </a>
            )}
            {guide.instagram && (
              <a
                className="hover:underline"
                href={`https://instagram.com/${guide.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
          </div>
        )}

        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">Источники фотографий</summary>
          <ul className="mt-2 flex flex-col gap-1">
            {PHOTO_CREDITS.map((c) => (
              <li key={c.url}>
                <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline">
                  {c.title}
                </a>{" "}
                — {c.author}, {c.license} (Wikimedia Commons)
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  )
}
