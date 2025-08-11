// components/message-modal.tsx

"use client"

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCookie, setCookie } from "cookies-next"
import { Loader, Paperclip, Info, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

// --- INTERFACE MODIFICATIONS START ---
interface Attachment {
  filename: string;
  contentType: string;
  content: string; // This will be the Base64 string from our backend
  size: number;
}

interface Message {
  id: string
  from: string
  to: string
  subject: string
  date: string
  body?: string
  html?: string
  attachments?: Attachment[] // Add attachments array
}
// --- INTERFACE MODIFICATIONS END ---


interface MessageModalProps {
  message: Message | null
  isOpen: boolean
  onClose: () => void
}

export function MessageModal({ message, isOpen, onClose }: MessageModalProps) {
  const [fullMessage, setFullMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    const storedToken = getCookie("authToken") as string | undefined;
    if (storedToken) {
      setToken(storedToken);
    } else {
      fetchToken();
    }
  }, []);

  const fetchToken = async () => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as { token?: string };
      if (data.token) {
        setToken(data.token);
        setCookie("authToken", data.token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 3600, // 1 hour in seconds
        });
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Failed to fetch token:", error);
    }
  };


  const fetchFullMessage = useCallback(async (messageId: string) => {
    if (!token || !message) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mailbox?fullMailboxId=${message.to}&messageId=${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json() as { success: boolean; data: Message; message?: string };
      if (data.success) {
        setFullMessage(data.data);
      } else {
        console.error('Failed to fetch full message:', data.message);
      }
    } catch (error) {
      console.error('Error fetching full message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [message, token]);

  useEffect(() => {
    if (message && isOpen && token) {
      setFullMessage(null);
      fetchFullMessage(message.id);
    }
  }, [message, isOpen, token, fetchFullMessage]);

  // Helper to format file size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-w-screen h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{fullMessage?.subject || message.subject}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-500">
          <p><strong>From:</strong> {fullMessage?.from || message.from}</p>
          <p><strong>To:</strong> {fullMessage?.to || message.to}</p>
          <p><strong>Date:</strong> {new Date(fullMessage?.date || message.date).toLocaleString()}</p>
        </div>

        {/* MODIFICATION START: Main content area */}
        <div className="mt-4 border rounded-md flex-grow overflow-hidden relative">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className='animate-spin' />
            </div>
          ) : fullMessage?.html ? (
            <iframe
              srcDoc={`<base target="_blank" />${fullMessage.html}`}
              className="w-full h-full border-none"
              title={fullMessage.subject}
              sandbox="allow-same-origin allow-popups"
            />
          ) : (
            <pre className="whitespace-pre-wrap p-4 overflow-y-auto">{fullMessage?.body || "No content"}</pre>
          )}
        </div>
        {/* MODIFICATION END */}

        {/* ATTACHMENT HANDLING START */}
        {fullMessage?.attachments && fullMessage.attachments.length > 0 && (
          <div className="mt-4 flex-shrink-0"> {/* Add flex-shrink-0 to prevent this from shrinking */}
            <h3 className="font-semibold mb-2">Attachments ({fullMessage.attachments.length})</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto"> {/* Add scroll for many attachments */}
              {fullMessage.attachments.map((att, index) => {
                const downloadUrl = `data:${att.contentType};base64,${att.content}`;
                return (
                  <a
                    key={index}
                    href={downloadUrl}
                    download={att.filename}
                    className="flex items-center p-2 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Paperclip className="h-5 w-5 mr-3 text-gray-600" />
                    <div className="flex-grow">
                      <p className="font-medium text-sm text-black">{att.filename}</p>
                      <p className="text-xs text-gray-500">{formatBytes(att.size)}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
        {/* ATTACHMENT HANDLING END */}

        {/* SCANNED BY DITMAIL NOTICE */}
        <div className="mt-4 pt-4 border-t text-center">
          <div className="flex items-center justify-center text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 mr-2" />
            <span>Scanned by DITMail</span>
            <Link href="/blog/about-mail-security" target="_blank" rel="noopener noreferrer" className="ml-1 flex items-center hover:underline">
              <Info className="h-3 w-3 mr-1" />
              Learn more
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}