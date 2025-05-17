"use client";

import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import AcmeLogo from "@/app/ui/acme-logo";
import {
  PowerIcon,
  ChatBubbleBottomCenterIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DarkMode from "../darkmode/page";
import { useEffect, useRef, useState } from "react";

export default function SideNav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // slide in/out from left
  const backgroundVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  // semi‑transparent overlay
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { duration: 0.3 } },
  };

  // staggered menu items
  const listVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

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
      const url =
        user.role === "Admin"
          ? "/dashboard/chatPage"
          : `/dashboard/chatPage?userId=${user.id}`;
      router.push(url);
    } catch (err) {
      console.log("Redirect to chat page failed:", err);
    }
  };

  // Close on outside click
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen]);

  return (
    <>
      {/* ─── Desktop (always visible, no animation) ─── */}
      <div className="hidden md:flex md:flex-col md:h-full md:w-64 md:shadow-none">
        <Link
          href="/dashboard"
          className="mb-4 flex h-40 items-end justify-start bg-blue-600 p-4 rounded-md"
        >
          <div className="w-40 text-white">
            <AcmeLogo />
          </div>
        </Link>

        <div className="flex flex-col grow space-y-4 bg-white px-3 py-4 dark:bg-gray-900">
          <NavLinks />

          <div className="h-auto w-full grow rounded-md bg-gray-50 dark:bg-black" />

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <DarkMode />
          </div>

          <button
            onClick={chatPage}
            className="flex w-full items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 dark:bg-gray-800 dark:text-white"
          >
            <ChatBubbleBottomCenterIcon className="w-6" />
            Chat With Us
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 dark:bg-gray-800 dark:text-white"
          >
            <PowerIcon className="w-6" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ─── Mobile ─── */}
      {/* Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 rounded-md bg-blue-600 p-2 text-white shadow-lg"
        onClick={() => setIsOpen((o) => !o)}
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-30 bg-black"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
        )}
      </AnimatePresence>

      {/* Animated Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-nav"
            ref={menuRef}
            className="fixed top-0 left-0 z-40 h-full w-64 overflow-y-auto bg-white px-3 py-4 shadow-lg dark:bg-gray-900"
            variants={backgroundVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Link
              href="/dashboard"
              className="mb-4 flex h-16 items-center justify-start bg-blue-600 p-4 rounded-md"
            >
              <div className="w-32 text-white">
                <AcmeLogo />
              </div>
            </Link>

            <div className="flex flex-col justify-between space-y-2">
              {/* Staggered NavLinks */}
              <motion.div
                custom={0}
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <NavLinks />
              </motion.div>

              <motion.div
                custom={1}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="h-auto w-full grow rounded-md bg-gray-50 dark:bg-black"
              />

              <motion.div
                custom={2}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <DarkMode />
              </motion.div>

              <motion.button
                custom={3}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                onClick={chatPage}
                className="flex items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 dark:bg-gray-800 dark:text-white"
              >
                <ChatBubbleBottomCenterIcon className="w-6" />
                Chat With Us
              </motion.button>

              <motion.button
                custom={4}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 dark:bg-gray-800 dark:text-white"
              >
                <PowerIcon className="w-6" />
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}




// "use client";

// import Link from "next/link";
// import NavLinks from "@/app/ui/dashboard/nav-links";
// import AcmeLogo from "@/app/ui/acme-logo";
// import {
//   PowerIcon,
//   ChatBubbleBottomCenterIcon,
// } from "@heroicons/react/24/outline";
// import axiosInstance from "@/app/lib/axios";
// import { useRouter } from "next/navigation";
// import DarkMode from "../darkmode/page";

// export default function SideNav() {
//   const router = useRouter();

//   const handleLogout = async () => {
//     try {
//       await axiosInstance.post(`/users/logout`, {});
//       router.push("/");
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   const chatPage = async () => {
//     try {
//       const response = await axiosInstance.get(`/users/isLoggedIn`);

//       const user = response.data.data.user;

//       if (user.role === "Admin") {
//         router.push("/dashboard/chatPage"); // Admin can select users from chatPage
//       } else {
//         router.push(`/dashboard/chatPage?userId=${user.id}`); // Normal user
//       }
//     } catch (err) {
//       console.log("Redirect to chat page failed:", err);
//     }
//   };

//   return (
//     <div className="flex h-full flex-col px-3 py-4 md:px-2">
//       <Link
//         className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
//         href="/"
//       >
//         <div className="w-32 text-white md:w-40">
//           <AcmeLogo />
//         </div>
//       </Link>
//       <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
//         <NavLinks />
//         <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-black md:block"></div>

//         <div className=" flex pt-4 border-t justify-between mt-4 space-x-2 md:flex-col md:space-x-0 md:space-y-2 border-gray-200 dark:border-gray-700">
//           <DarkMode />
//         </div>

//         <button
//           onClick={chatPage}
//           className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
//         >
//           <ChatBubbleBottomCenterIcon className="w-6" />
//           <div className="hidden md:block">Chat With Us</div>
//         </button>

//         <button
//           onClick={handleLogout}
//           className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
//         >
//           <PowerIcon className="w-6" />
//           <div className="hidden md:block">Sign Out</div>
//         </button>
//       </div>
//     </div>
//   );
// }
