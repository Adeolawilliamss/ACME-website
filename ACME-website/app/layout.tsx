import "@/app/ui/global.css";
import { Metadata } from "next";
import { inter } from "@/app/ui/fonts";
import { Providers } from "./providers";
import 'nprogress/nprogress.css';

export const metadata: Metadata = {
  title: {
    template: "%s | Acme Dashboard",
    default: "Acme Dashboard",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
