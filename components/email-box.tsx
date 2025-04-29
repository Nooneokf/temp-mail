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
  const [oldEmailUsed, setOldEmailUsed] = useState(false); // State to trigger useEffect
  const [blockButtons, setBlockButtons] = useState(false); // Check if prefix is empty
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
         // Get existing email from history if available and use the first one
         const storedHistory = localStorage.getItem('emailHistory')
         if (storedHistory) {
           const history = JSON.parse(storedHistory) as string[];
           setEmailHistory(history);
           if (history.length > 0) {
              const [prefix, domainPart] = history[0].split('@');
              // Ensure the domain is one of the allowed ones, default if not
              const initialDomain = DOMAINS.includes(domainPart) ? domainPart : DOMAINS[0];
              setSelectedDomain(initialDomain);
              setEmail(history[0]);
              setOldEmailUsed(true); // Indicate an old email was used to trigger refresh
              return; // Stop here if history email is used
           }
         }
        // If no history or history is empty, generate a new email
        setEmail(generateRandomEmail(selectedDomain));
      }
    };

    initializeEmailBox();
  }, []); // Empty dependency array means this runs only once on mount

  useEffect(() => {
    // Save email to history whenever the email state changes, unless editing
    if (email && !isEditing && typeof window !== 'undefined') {
        const updatedHistory = [email, ...emailHistory.filter(e => e !== email)].slice(0, 5);
        setEmailHistory(updatedHistory);
        localStorage.setItem('emailHistory', JSON.stringify(updatedHistory));
    }
  }, [email, isEditing]); // Depends on email and isEditing state


  useEffect(() => {
    // Refresh inbox whenever email or token changes *after* initial load
    // This handles cases where token is fetched or email is manually changed/used from history
    if (email && token) {
      refreshInbox();
    }
  }, [email, token, oldEmailUsed]); // Trigger refresh on email, token, or oldEmailUsed change

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
        // Use cookies-next setCookie for server-side readable cookies
        setCookie("authToken", data.token, {
          maxAge: 3600, // 1 hour in seconds
          path: '/', // Make it available on all paths
          // httpOnly: true, // Cannot set httpOnly from client-side JS
          secure: process.env.NODE_ENV === 'production', // Use secure in production
          sameSite: 'strict' // Or 'lax' depending on requirements
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
    if (!token || !email) {
      setError('Authentication token or email not available.');
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
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(`HTTP error! status: ${response.status}. ${errorData.message || ''}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      setError(`Error fetching messages: ${error.message || 'Please try again later.'}`);
      setMessages([]); // Clear messages on error
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
        // No need to explicitly save history here, useEffect handles it

      } else {
        setError('Please enter a valid email prefix')
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
      const newEmail = generateRandomEmail(selectedDomain); // Generate using current domain
      setEmail(newEmail);
      setMessages([]);
      // oldEmailUsed toggled implicitly by setting new email state which triggers useEffect
      // No need to call refreshInbox directly here, the useEffect on [email, token] will handle it
    } else if (itemToDelete?.type === 'message' && itemToDelete.id) {
      try {
        const response = await fetch(`/api/mailbox?mailbox=${email.split('@')[0]}&messageId=${itemToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
           const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          throw new Error(`HTTP error! status: ${response.status}. ${errorData.message || ''}`);
        }
        const data = await response.json()
        if (data.success) {
          setMessages(messages.filter(m => m.id !== itemToDelete.id))
        } else {
          throw new Error(data.message || 'Failed to delete message');
        }
      } catch (error: any) {
        console.error('Error deleting message:', error);
        setError(`Error deleting message: ${error.message || 'Please try again later.'}`);
      }
    }
    setIsDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const handleEmailInputChage = (newPrefix: string) => {
    // only small alphabets allowed, change uppercase to lowercase
    newPrefix = newPrefix.toLowerCase();
    // remove any characters that are not lowercase letters or numbers (allowing numbers is common for email prefixes)
    // Let's stick to only lowercase letters as per the generate function for simplicity, but numbers might be needed later.
    newPrefix = newPrefix.replace(/[^a-z]/g, '');

    setEmail(`${newPrefix}@${selectedDomain}`);

    // Block action buttons if prefix is empty
    if (newPrefix.length === 0) {
      setBlockButtons(true);
    } else {
      setBlockButtons(false);
    }
  }

  const handleDomainChange = (newDomain: string) => {
    setSelectedDomain(newDomain);
    const prefix = email.split("@")[0];
    setEmail(`${prefix}@${newDomain}`);
    // The useEffect on [email, token] will handle the refresh
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
                placeholder="Enter email prefix"
                aria-label="Email prefix" // Added aria-label for the input
              />
              <select
                value={selectedDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="border rounded-md w-1/2 p-2"
                aria-label="Select email domain" // Added aria-label for the select
              >
                {DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    @{domain} {/* Show domain with @ prefix */}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex-1 rounded-md bg-muted p-2" aria-live="polite"> {/* Added aria-live */}
              {email || 'Loading...'}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={copyEmail}
              className="relative"
              disabled={blockButtons || !email} // Also disable if email isn't loaded/set
              aria-label="Copy email address" // Added aria-label
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
              disabled={blockButtons || !email} // Also disable if email isn't loaded/set
              aria-label="Show QR code for email address" // Added aria-label
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button disabled={blockButtons || isRefreshing || !email} variant="outline" className="flex-1" onClick={refreshInbox} aria-label="Refresh inbox"> {/* Added aria-label */}
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
          </Button>
          <Button disabled={blockButtons || isRefreshing} variant="outline" className="flex-1" onClick={changeEmail} aria-label={isEditing ? 'Save email address' : 'Change email address'}> {/* Dynamic aria-label */}
            {!isEditing ? <Edit className="mr-2 h-4 w-4" /> : <CheckCheck className="mr-2 h-4 w-4" />}
            <span className="hidden sm:inline">{isEditing ? 'Save' : 'Change'}</span>
          </Button>
          <Button disabled={blockButtons || isRefreshing} variant="outline" className="flex-1" onClick={deleteEmail} aria-label="Delete current email address"> {/* Added aria-label */}
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
                    <TableCell className="flex gap-1"> {/* Use flex and gap for buttons */}
                      <Button variant="link" size="sm" onClick={() => viewMessage(message)} aria-label={`View message from ${message.from}: ${message.subject}`}>View</Button> {/* Added specific aria-label */}
                      <Button variant="link" size="sm" onClick={() => deleteMessage(message.id)} aria-label={`Delete message from ${message.from}: ${message.subject}`}>Delete</Button> {/* Added specific aria-label */}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Fill blank rows if messages count is less than 5 */}
                {messages.length < 5 && Array.from({ length: 5 - messages.length }).map((_, index) => (
                  <TableRow key={`blank-${index}`} >
                    <TableCell colSpan={4}> </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>

        </Table>

        {emailHistory.length > 0 && (
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
                      setOldEmailUsed(prev => !prev); // Toggle state to trigger useEffect
                    }}
                    aria-label={`Use email address ${historyEmail}`} // Added dynamic aria-label
                  >
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {/* Moved CardHeader to the bottom as it appears last in the original code snippet structure */}
       <CardHeader>
        <h2 className="text-xl font-semibold">Your Temporary Email Address</h2>
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