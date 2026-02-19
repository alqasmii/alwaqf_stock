import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "الوقف مسقط – متتبع المحفظة الاستثمارية",
  description: "نظام تتبع محفظة الأسهم الحية في سوق مسقط للأوراق المالية",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* شريط علوي */}
        <header
          style={{
            background: "#5C2D91",
            borderBottom: "3px solid #4A2478",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 2px 12px rgba(92,45,145,0.18)",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.85rem 1.5rem",
              gap: "1rem",
            }}
          >
            {/* الشعار */}
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                textDecoration: "none",
              }}
            >
              <Image
                src="/logo.png"
                alt="مؤسسة الوقف الخيري"
                width={130}
                height={48}
                style={{
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                }}
                priority
              />
            </a>

            {/* روابط التنقل */}
            <nav
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <a
                href="/"
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "8px",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "0.87rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                لوحة التحكم
              </a>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>|</span>
              <div
                style={{
                  padding: "0.35rem 0.8rem",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#6EE7B7",
                    display: "inline-block",
                    boxShadow: "0 0 6px #6EE7B7",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                مباشر
              </div>
            </nav>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <main style={{ minHeight: "calc(100vh - 60px)", paddingBottom: "4rem", background: "var(--section-bg)" }}>
          {children}
        </main>

        {/* تذييل */}
        <footer
          style={{
            borderTop: "1px solid var(--card-border)",
            padding: "1.2rem 1.5rem",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            background: "var(--card-bg)",
          }}
        >
          مؤسسة الوقف الخيري © {new Date().getFullYear()} · سوق مسقط للأوراق المالية
        </footer>
      </body>
    </html>
  );
}
