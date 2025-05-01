'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

interface Message {
  sender: string;
  message: string;
}

interface User {
  id: string;
  name: string;
}

let socket: typeof Socket;

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId')!;

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/users/isLoggedIn`, {
          withCredentials: true,
        });
        const user = data.data.user;
        setCurrentUserName(user.name);
        setCurrentRole(user.role);

        if (user.role === 'Admin') {
          const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/users`, {
            withCredentials: true,
          });
          const mapped = usersRes.data.data.users
            .filter((u: any) => u.role !== 'Admin')
            .map((u: any) => ({ id: u._id, name: u.name }));
          setUsers(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;

    socket = io(`${process.env.NEXT_PUBLIC_API_BASE}/`, { withCredentials: true } as any);
    socket.emit('joinRoom', userId);

    const handleReceive = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('receiveMessage', handleReceive);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.disconnect();
    };
  }, [userId]);

  const getAutoReply = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('invoice')) return 'You can check the invoices or dashboard tab to see all your invoices😉';
    if (lower.includes('help')) return 'You need my help with what please?🙂';
    if (lower.includes('customers')) return 'You can check your customers tab to see all your customers😉';
    if (lower.includes('hello') || lower.includes('hi'))
      return 'Hi there! How can I help today?🤔';

    const fallback = [
      "You can only ask about invoices and customers😊"
    ];
    return fallback[Math.floor(Math.random() * fallback.length)];
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit('sendMessage', {
      roomId: userId,
      message,
      sender: currentUserName,
    });

    const outgoing = message;
    setMessage('');

    if (currentRole !== 'Admin') {
      setTimeout(() => {
        const reply = getAutoReply(outgoing);
        socket.emit('sendMessage', {
          roomId: userId,
          message: reply,
          sender: 'AdminBot',
        });
      }, 1000);
    }
  };

  const selectUser = (id: string) => {
    router.push(`/dashboard/chatPage?userId=${id}`);
  };

  const renderMessages = () => (
    <div className="flex flex-col space-y-2 mb-4 max-h-[80vh] overflow-y-auto p-2">
      {messages.map((m, i) => {
        const isUser = m.sender === currentUserName;
        const isBot = m.sender === 'AdminBot';
        return (
          <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow-md flex items-start space-x-2 ${
                isUser
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              {isBot && (
                <FontAwesomeIcon icon={faRobot} className="text-gray-500 pt-1" />
              )}
              <div>
                <div className="font-medium text-xs mb-1">
                  {isUser ? 'You' : m.sender}
                </div>
                {m.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderInputBar = () => (
    <div className="flex items-center border-t pt-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message..."
        className="flex-grow rounded-full border px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
      >
        Send
      </button>
    </div>
  );

  if (currentRole === 'Admin') {
    return (
      <div className="flex h-screen">
        <div className="w-64 bg-gray-100 p-4 space-y-2">
          <h2 className="text-lg font-bold mb-4">Users</h2>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => selectUser(u.id)}
              className={`block w-full text-left p-2 rounded hover:bg-blue-100 ${
                userId === u.id ? 'bg-blue-200 font-semibold' : ''
              }`}
            >
              {u.name}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          {userId ? (
            <>
              {renderMessages()}
              {renderInputBar()}
            </>
          ) : (
            <div className="text-gray-500">Select a user to start chatting</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-screen flex flex-col justify-between">
      {renderMessages()}
      {renderInputBar()}
    </div>
  );
}
