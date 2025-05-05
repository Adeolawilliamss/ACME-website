import "@/app/ui/global.css";
import { Metadata } from "next";
import { inter } from "@/app/ui/fonts";
import { AlertProvider } from "./context/alertContext";
import Alert from "./ui/alert";

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
        <AlertProvider>
          <Alert />
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}
