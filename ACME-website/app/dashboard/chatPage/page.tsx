import dynamic from "next/dynamic";
import { Suspense } from "react";

const ChatPage = dynamic(() => import("./chatpage"));

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="p-4">Loading chat...</div>}>
      <ChatPage />
    </Suspense>
  );
}
