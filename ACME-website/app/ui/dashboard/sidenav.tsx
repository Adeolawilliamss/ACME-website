"use client";

import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import AcmeLogo from "@/app/ui/acme-logo";
import {
  PowerIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import DarkMode from "../darkmode/page";

export default function SideNav() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.post(`/users/logout`, {});
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const chatPage = async () => {
    try {
      const response = await axiosInstance.get(`/users/isLoggedIn`);
      const user = response.data.data.user;
      if (user.role === "Admin") {
        router.push("/dashboard/chatPage");
      } else {
        router.push(`/dashboard/chatPage?userId=${user.id}`);
      }
    } catch (err) {
      console.log("Redirect to chat page failed:", err);
    }
  };

  return (
    <>
      {/* Sidebar for md+ */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:shadow-lg md:bg-white dark:md:bg-gray-900">
        <Link
          href="/"
          className="flex items-center justify-center h-20 bg-blue-600 p-4"
        >
          <div className="w-32 text-white">
            <AcmeLogo />
          </div>
        </Link>
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
          <DarkMode />
          <button
            onClick={chatPage}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-50 hover:bg-sky-100"
          >
            <ChatBubbleBottomCenterIcon className="w-6" />
            <span>Chat With Us</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-50 hover:bg-sky-100"
          >
            <PowerIcon className="w-6" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-white dark:bg-gray-900 shadow-t py-2 md:hidden">
        <Link href="/" className="flex flex-col items-center">
          <AcmeLogo />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <button
          onClick={chatPage}
          className="flex flex-col items-center"
        >
          <ChatBubbleBottomCenterIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Chat</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center">
          <PowerIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </nav>
    </>
  );
}
