import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ImageKitProvider } from "@imagekit/next";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <html lang="en">
          <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}>
            <body>{children}</body>
          </ImageKitProvider>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}
