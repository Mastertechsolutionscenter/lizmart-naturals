import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { currentRole, currentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Commerce Dashboard",
  description: "Admin dashboard for managing products, orders, and customers.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const user = await currentUser();
  const role = await currentRole();
  

  
  if (!user) {
    redirect("dashboard/login"); 
  }

  
  if (role !== "ADMIN") {
    redirect("/"); 
  }
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}>
      <SessionProvider>
       
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <main className="w-full">
              <Navbar />
              <div className="px-4">{children}</div>
               <Toaster position="top-center" />
            </main>
          </SidebarProvider>
      
      </SessionProvider>
    </div>
  );
}
