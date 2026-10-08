import type { Metadata } from "next";
import { creativeLabStyles } from "@creative-lab/ui";

export const metadata: Metadata = { title: "Creative Lab", description: "Creative operations workspace" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <style>{creativeLabStyles}</style>
        {children}
      </body>
    </html>
  );
}
