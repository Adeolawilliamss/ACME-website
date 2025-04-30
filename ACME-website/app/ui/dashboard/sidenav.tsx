"use client";

import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import AcmeLogo from "@/app/ui/acme-logo";
import {
  PowerIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useRouter } from "next/navigation";
import DarkMode from "../darkmode/page";

export default function SideNav() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/users/logout",
        {},
        { withCredentials: true }
      );
      router.push("/"); // Redirect after successful logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const chatPage = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/isLoggedIn', {
        withCredentials: true,
      });
  
      const user = response.data.data.user;
  
      if (user.role === 'Admin') {
        router.push('/dashboard/chatPage'); // Admin can select users from chatPage
      } else {
        router.push(`/dashboard/chatPage?userId=${user.id}`); // Normal user
      }
    } catch (err) {
      console.log('Redirect to chat page failed:', err);
    }
  };
  

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-black md:block"></div>

      <div className=" flex pt-4 border-t justify-between mt-4 space-x-2 md:flex-col md:space-x-0 md:space-y-2 border-gray-200 dark:border-gray-700">
        <DarkMode />
      </div>

        <button
          onClick={chatPage}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <ChatBubbleBottomCenterIcon className="w-6" />
          <div className="hidden md:block">Chat With Us</div>
        </button>

        <button
          onClick={handleLogout}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <PowerIcon className="w-6" />
          <div className="hidden md:block">Sign Out</div>
        </button>
      </div>
    </div>
  );
}
