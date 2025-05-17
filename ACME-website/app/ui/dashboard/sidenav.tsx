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
  const menuRef = useRef(null);

  const backgroundVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.5,
      transition: { duration: 0.3 },
    },
  };

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

      if (user.role === "Admin") {
        router.push("/dashboard/chatPage");
      } else {
        router.push(`/dashboard/chatPage?userId=${user.id}`);
      }
    } catch (err) {
      console.log("Redirect to chat page failed:", err);
    }
  };

  // Detect outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        menuRef.current &&
        !(menuRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 rounded-md bg-blue-600 p-2 text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-30 bg-black md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Side Navigation */}
      <AnimatePresence>
        {(isOpen || typeof window !== "undefined") && (
          <motion.div
            key="sidenav"
            ref={menuRef}
            variants={backgroundVariants}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            exit="hidden"
            className="fixed top-0 left-0 z-40 h-full w-64 overflow-y-auto bg-white px-3 py-4 shadow-lg dark:bg-gray-900 md:relative md:translate-x-0 md:shadow-none"
          >
            <Link
              className="mb-4 flex h-16 items-center justify-start rounded-md bg-blue-600 p-4 md:h-40"
              href="/"
            >
              <div className="w-32 text-white md:w-40">
                <AcmeLogo />
              </div>
            </Link>

            <div className="flex flex-col justify-between space-y-2">
              <motion.div custom={0} variants={listVariants} initial="hidden" animate="visible">
                <NavLinks />
              </motion.div>

              <motion.div
                className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-black md:block"
                custom={1}
                variants={listVariants}
                initial="hidden"
                animate="visible"
              />

              <motion.div
                className="flex pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2"
                custom={2}
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <DarkMode />
              </motion.div>

              <motion.button
                onClick={chatPage}
                className="flex items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 dark:bg-gray-800 dark:text-white"
                custom={3}
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <ChatBubbleBottomCenterIcon className="w-6" />
                <span className="hidden md:inline">Chat With Us</span>
              </motion.button>

              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 dark:bg-gray-800 dark:text-white"
                custom={4}
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <PowerIcon className="w-6" />
                <span className="hidden md:inline">Sign Out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
