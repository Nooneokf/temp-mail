"use client";

import { useState, useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";
import { Mail, RefreshCw, Trash2, Edit, QrCode, Copy, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { QRCodeModal } from "./qr-code-modal";
import { cn } from "@/lib/utils";
import { MessageModal } from "./message-modal";
import { ErrorPopup } from "./error-popup";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import Link from "next/link";

const DOMAINS = ["saleis.live", "arrangewith.me"];

function generateRandomEmail(domain: string = DOMAINS[0]): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const length = 6; // Define the desired length of the email prefix
  let prefix = "";

  for (let i = 0; i < length; i++) {
    prefix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `${prefix}@${domain}`;
}

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
}

export function EmailBox() {
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [emailHistory, setEmailHistory] = useState<string[]>([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "email" | "message"; id?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [oldEmailUsed, setOldEmailUsed] = useState(false);
  const [blockButtons, setBlockButtons] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0]); // Default to the first domain

  useEffect(() => {
    const initializeEmailBox = async () => {
      // Check for stored token or fetch a new one
      const storedToken = getCookie("authToken") as string | undefined;
      if (storedToken) {
        console.log("Using stored token:", storedToken);
        setToken(storedToken);
      } else {
        await fetchToken(); // Fetches and sets token in state
      }

      // Generate a random email after ensuring the token is set
      if (typeof window !== 'undefined') {
        setEmail(generateRandomEmail(selectedDomain));
      }
    };

    initializeEmailBox();
  }, [selectedDomain]);

  useEffect(() => {
    if (email && token) {
      refreshInbox(); // Refresh inbox only when both email and token are available
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldEmailUsed, email, token]); // Add all dependencies

    // eslint-disable-next-line react-hooks/exhaustive-deps
  
  // 1. Load history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('emailHistory');
      if (storedHistory) {
        setEmailHistory(JSON.parse(storedHistory));
      }
    }
  }, []);
  
  // 2. Update history when email changes and not editing
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      email &&
      !isEditing
    ) {
      const updatedHistory = [email, ...emailHistory.filter(e => e !== email)].slice(0, 5);
      setEmailHistory(updatedHistory);
      localStorage.setItem('emailHistory', JSON.stringify(updatedHistory));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, isEditing]);
  

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
      const data = await response.json();
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
      setError("Failed to authenticate. Please try again later.");
    }
  };


  const refreshInbox = async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/mailbox?mailbox=${email.split('@')[0]}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Error fetching messages. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const changeEmail = () => {
    if (isEditing) {
      const [prefix] = email.split('@')
      if (prefix && prefix.length > 0) {
        const newEmail = `${prefix}@${selectedDomain}`
        setEmail(newEmail)
        setIsEditing(false)

      } else {
        setError('Please enter a valid email prefix')
      }
      if (prefix && token) {
        refreshInbox(); // Refresh inbox only when both email and token are available
        const updatedHistory = [email, ...emailHistory.filter(e => e !== email)].slice(0, 5)
        setEmailHistory(updatedHistory)
        if (typeof window !== 'undefined') {

          localStorage.setItem('emailHistory', JSON.stringify(updatedHistory))
        }
      }
    } else {
      setIsEditing(true)

    }
  }

  const deleteEmail = () => {
    setItemToDelete({ type: 'email' })
    setIsDeleteModalOpen(true)
  }

  const deleteMessage = (messageId: string) => {
    setItemToDelete({ type: 'message', id: messageId })
    setIsDeleteModalOpen(true)
  }

  const viewMessage = async (message: Message) => {
    setSelectedMessage(message)
    setIsMessageModalOpen(true)
  }

  const handleDeleteConfirmation = async () => {
    if (itemToDelete?.type === 'email') {
      const newEmail = generateRandomEmail()
      setEmail(newEmail)
      setMessages([])
      if (email && token) {
        refreshInbox(); // Refresh inbox only when both email and token are available
      }

    } else if (itemToDelete?.type === 'message' && itemToDelete.id) {
      try {
        const response = await fetch(`/api/mailbox?mailbox=${email.split('@')[0]}&messageId=${itemToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json()
        if (data.success) {
          setMessages(messages.filter(m => m.id !== itemToDelete.id))
        } else {
          throw new Error(data.message || 'Failed to delete message');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        setError('Error deleting message. Please try again later.');
      }
    }
    setIsDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const handleEmailInputChage = (newPrefix: string) => {
    // only small aplhabets allowed if upper then change to lower
    newPrefix = newPrefix.toLowerCase()
    // remove any special characters
    newPrefix = newPrefix.replace(/[^a-z]/g, '')
    setEmail(`${newPrefix}@${selectedDomain}`)
    if (newPrefix.length === 0) {
      setBlockButtons(true)
    } else {
      setBlockButtons(false)
    }
  }
  const handleDomainChange = (newDomain: string) => {
    setSelectedDomain(newDomain);
    const prefix = email.split("@")[0];
    setEmail(`${prefix}@${newDomain}`);
  };

  return (
    <Card className="border-dashed">

      <CardContent className="space-y-4 pt-10">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={email.split("@")[0]}
                onChange={(e) => handleEmailInputChage(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="border rounded-md w-1/2 p-2"
              >
                {DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex-1 rounded-md bg-muted p-2">
              {email || 'Loading...'}
            </div>
          )}
          <div className="flex gap-2" role="group" aria-label="Email actions">
            <Button
              variant="secondary"
              size="icon"
              onClick={copyEmail}
              className="relative"
              disabled={blockButtons}
              aria-label="Copy email address"
            >
              <Copy className={cn(
                "h-4 w-4 transition-all",
                copied ? "opacity-0" : "opacity-100"
              )} />
              <span className={cn(
                "absolute inset-0 flex items-center justify-center transition-all",
                copied ? "opacity-100" : "opacity-0"
              )}>
                <Check className="h-4 w-4 transition-all" />
              </span>
            </Button>
            <Button
              className="hidden xs:flex"
              variant="secondary"
              size="icon"
              onClick={() => setIsQRModalOpen(true)}
              disabled={blockButtons}
              aria-label="Show QR code"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Email management actions">
          <Button
            disabled={blockButtons || isRefreshing}
            variant="outline"
            className="flex-1"
            onClick={refreshInbox}
            aria-label={isRefreshing ? "Refreshing inbox" : "Refresh inbox"}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
          </Button>
          <Button
            disabled={blockButtons}
            variant="outline"
            className="flex-1"
            onClick={changeEmail}
            aria-label={isEditing ? "Save email changes" : "Change email"}
          >
            {!isEditing ? <Edit className="mr-2 h-4 w-4" /> : <CheckCheck className="mr-2 h-4 w-4" />}
            <span className="hidden sm:inline">{isEditing ? 'Save' : 'Change'}</span>
          </Button>
          <Button
            disabled={blockButtons}
            variant="outline"
            className="flex-1"
            onClick={deleteEmail}
            aria-label="Delete email address"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SENDER</TableHead>
              <TableHead>SUBJECT</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody >
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <div className="py-12">
                    <div className="mb-4 flex justify-center">
                      <Mail className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="text-lg font-medium">Your inbox is empty</div>
                    <div className="text-sm text-muted-foreground">Waiting for incoming emails</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {messages.map((message, index) => (
                  <TableRow key={message.id} className={index % 2 === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}>
                    <TableCell>{message.from}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>{new Date(message.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="link" onClick={() => viewMessage(message)}>View</Button>
                      <Button variant="link" onClick={() => deleteMessage(message.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {Array.from({ length: 5 - messages.length }).map((_, index) => (
                  <TableRow key={`blank-${index}`} >
                    <TableCell colSpan={4}>&nbsp;</TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>

        </Table>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Email History</h3>
            <ul className="space-y-2">
              {emailHistory.map((historyEmail, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{historyEmail}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEmail(historyEmail);
                      setOldEmailUsed(!oldEmailUsed);
                    }}
                  >
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          </div>
      </CardContent>
      <CardHeader>
        <h2 className="text-xl font-semibold">Your Best Temporary Email Address</h2>
        <p className="text-sm text-muted-foreground">
          Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.
        </p>
      </CardHeader>
      <QRCodeModal
        email={email}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
      <MessageModal
        message={selectedMessage}
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
      {error && (
        <ErrorPopup
          message={error}
          onClose={() => setError(null)}
        />
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirmation}
        itemToDelete={itemToDelete?.type === 'email' ? 'email address' : 'message'}
      />
    </Card>
  )
}