import type { Metadata } from "next";
import "./globals.css";
import { ProtoScheduleProvider } from "@/context/ProtoScheduleContext";

export const metadata: Metadata = {
  title: "Volvo ProtoSchedule | Prototype Test Drive Scheduler",
  description: "Volvo Group Connected Services - Prototype Vehicle Scheduling & Validation Coverage Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B111E] text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-black">
        <ProtoScheduleProvider>
          {children}
        </ProtoScheduleProvider>
      </body>
    </html>
  );
}
