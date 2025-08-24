// components/email-box.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { getCookie, setCookie } from "cookies-next";
import { Mail, RefreshCw, Trash2, Edit, QrCode, Copy, Check, CheckCheck, Star, ListOrdered, RotateCwSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { QRCodeModal } from "./qr-code-modal";
import { cn } from "@/lib/utils";
import { MessageModal } from "./message-modal";
import { ErrorPopup } from "./error-popup";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { ShareDropdown } from "./ShareDropdown";
import { AnimatePresence, motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useTranslations } from "next-intl";
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Session } from "next-auth";
import { ManageInboxesModal } from "./manage-inboxes-modal";

const FREE_DOMAINS = [
  "saleis.live", "arrangewith.me", "areueally.info", "ditapi.info",
  "ditcloud.info", "ditdrive.info", "ditgame.info", "ditlearn.info",
  "ditpay.info", "ditplay.info", "ditube.info", "junkstopper.info"
];

function generateRandomEmail(domain: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const length = 6;
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

interface EmailBoxProps {
  initialSession: Session | null;
  initialCustomDomains: any[];
  initialInboxes: string[];
  initialCurrentInbox: string | null;
}

const getPreferredDomain = (
  availableDomains: string[],
  lastUsedDomain: string | null
): string => {
  if (lastUsedDomain && availableDomains.includes(lastUsedDomain)) {
    return lastUsedDomain;
  }
  const firstAvailableDomain = availableDomains[0];
  const isFirstDomainCustom = firstAvailableDomain && !FREE_DOMAINS.includes(firstAvailableDomain);
  if (isFirstDomainCustom) {
    return firstAvailableDomain;
  }
  return firstAvailableDomain || FREE_DOMAINS[0];
};

export function EmailBox({
  initialSession,
  initialCustomDomains,
  initialInboxes,
  initialCurrentInbox
}: EmailBoxProps) {
  const t = useTranslations('EmailBox');
  const [session] = useState(initialSession);
  const isAuthenticated = !!session;
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [emailHistory, setEmailHistory] = useState<string[]>(initialInboxes);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "email" | "message"; id?: string } | null>(null);
  const [blockButtons, setBlockButtons] = useState(false);
  const [oldEmailUsed, setOldEmailUsed] = useState(false);
  const [discoveredUpdates, setDiscoveredUpdates] = useState({ newDomains: false });
  const [showAttachmentNotice, setShowAttachmentNotice] = useState(false);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set()); // <-- NEW: State for saved messages

  const availableDomains = useMemo(() => {
    const verifiedCustomDomains = initialCustomDomains?.filter((d: any) => d.verified).map((d: any) => d.domain) ?? [];
    return [...new Set([...verifiedCustomDomains, ...FREE_DOMAINS])];
  }, [initialCustomDomains]);

  const updateUserInbox = async (newInbox: string) => {
    if (!isAuthenticated || !newInbox) return;
    try {
      await fetch('/api/user/inboxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inboxName: newInbox }),
      });
    } catch (err) {
      console.error("Error syncing inbox:", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchToken();
      const localHistory: string[] = JSON.parse(localStorage.getItem('emailHistory') || '[]');
      const lastUsedDomain: string | null = localStorage.getItem('lastUsedDomain');
      const initialDomain = getPreferredDomain(availableDomains, lastUsedDomain);
      let effectiveInitialEmail: string | null = null;
      let historyToDisplay: string[] = [];

      if (initialInboxes.length > 0) {
        historyToDisplay = initialInboxes;
        effectiveInitialEmail = initialCurrentInbox || initialInboxes[0];
      } else if (localHistory.length > 0) {
        historyToDisplay = localHistory;
        effectiveInitialEmail = localHistory[0];
      } else {
        effectiveInitialEmail = generateRandomEmail(initialDomain);
        historyToDisplay = [effectiveInitialEmail];
      }

      setEmail(effectiveInitialEmail);
      setEmailHistory(historyToDisplay);
      setSelectedDomain(effectiveInitialEmail.split('@')[1]);
    };
    initialize();
  }, []);

  useEffect(() => {
    if (!email) return;
    updateUserInbox(email);
    const currentLocalHistory: string[] = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    let newHistory = [email, ...currentLocalHistory.filter(e => e !== email)];

    if (session?.user?.plan === 'free') {
      newHistory = newHistory.slice(0, 7);
    } else if (!session?.user) {
      newHistory = newHistory.slice(0, 5);
    }
    localStorage.setItem('emailHistory', JSON.stringify(newHistory));
    setEmailHistory(newHistory);
  }, [email, session]);

  useEffect(() => {
    if (selectedDomain) {
      localStorage.setItem('lastUsedDomain', selectedDomain);
    }
  }, [selectedDomain]);

  useEffect(() => {
    if (!email || !token) return;
    refreshInbox();
    const socket = new WebSocket(`wss://api2.freecustom.email/?mailbox=${email}`);
    socket.onopen = () => console.log("WebSocket connection established");
    socket.onmessage = () => refreshInbox();
    return () => socket.close();
  }, [email, token]);

  // --- NEW: Helper to check local storage and update saved state ---
  const checkSavedMessages = (currentMessages: Message[]) => {
    const savedIds = new Set<string>();
    currentMessages.forEach(msg => {
      if (localStorage.getItem(`saved-msg-${msg.id}`)) {
        savedIds.add(msg.id);
      }
    });
    setSavedMessageIds(savedIds);
  };

  const useHistoryEmail = (historyEmail: string) => {
    setEmail(historyEmail);
    setSelectedDomain(historyEmail.split('@')[1]);
    setIsEditing(false);
  };

  const deleteEmail = () => {
    const lastUsedDomain = localStorage.getItem('lastUsedDomain');
    const domainToUse = getPreferredDomain(availableDomains, lastUsedDomain);
    const newEmail = generateRandomEmail(domainToUse);
    setEmail(newEmail);
    setSelectedDomain(domainToUse);
    setMessages([]);
  };

  const handleDomainChange = (newDomain: string) => {
    setSelectedDomain(newDomain);
    const prefix = email.split("@")[0];
    setEmail(`${prefix}@${newDomain}`);
  };

  const shortcuts = {
    'r': () => refreshInbox(),
    'c': () => copyEmail(),
    'd': () => deleteEmail(),
    'n': () => isAuthenticated && changeEmail(),
  };
  useKeyboardShortcuts(shortcuts, session?.user?.plan || 'anonymous');

  const fetchToken = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth", { method: "POST" });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json() as { token?: string };
      if (data.token) {
        setToken(data.token);
        setCookie("authToken", data.token, { maxAge: 3600 });
        return data.token;
      }
      throw new Error("No token received from server");
    } catch (error) {
      setError(`Error fetching token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const refreshInbox = async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/mailbox?fullMailboxId=${email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setShowAttachmentNotice(!!data.wasAttachmentStripped);
      const typedData = data as { success: boolean; data: Message[]; message?: string };
      if (typedData.success && Array.isArray(typedData.data)) {
        setMessages(typedData.data);
        checkSavedMessages(typedData.data); // <-- Check saved status on refresh
      } else {
        throw new Error(typedData.message || 'Failed to fetch messages');
      }
    } catch (error) {
      setError(`Error fetching inbox: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- REVISED: Toggle save/unsave without alert ---
  const toggleSaveMessage = async (message: Message) => {
    if (session?.user?.plan === 'free') return;

    const isSaved = savedMessageIds.has(message.id);
    const messageId = message.id;

    if (isSaved) {
      localStorage.removeItem(`saved-msg-${messageId}`);
      setSavedMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    } else {
      try {
        const response = await fetch(`/api/mailbox?fullMailboxId=${email}&messageId=${messageId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem(`saved-msg-${messageId}`, JSON.stringify(data.data));
          setSavedMessageIds(prev => new Set(prev).add(messageId));
        } else {
          setError('Failed to fetch message details for saving.');
        }
      } catch (err) {
        setError(`Error saving message: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const deleteMessage = (messageId: string) => {
    setItemToDelete({ type: 'message', id: messageId });
    setIsDeleteModalOpen(true);
  };

  const viewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setIsMessageModalOpen(true);
  };

  const handleDeleteConfirmation = async () => {
    if (itemToDelete?.type === 'email') {
      let domain = localStorage.getItem('primaryDomain') as string;
      if (!domain || !availableDomains.includes(domain)) {
        domain = availableDomains[Math.floor(Math.random() * availableDomains.length)];
      }
      const newEmail = generateRandomEmail(domain);
      setEmail(newEmail);
      setSelectedDomain(domain);
      setMessages([]);
      if (email && token) {
        refreshInbox();
      }
    } else if (itemToDelete?.type === 'message' && itemToDelete.id) {
      try {
        const response = await fetch(`/api/mailbox?fullMailboxId=${email}&messageId=${itemToDelete.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const typedData = data as { success: boolean; message?: string };
        if (typedData.success) {
          setMessages(messages.filter(m => m.id !== itemToDelete.id));
        } else {
          throw new Error(typedData.message || 'Failed to delete message');
        }
      } catch (error) {
        setError(`Error deleting message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleEmailInputChage = (newPrefix: string) => {
    newPrefix = newPrefix.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    setEmail(`${newPrefix}@${selectedDomain}`);
    setBlockButtons(newPrefix.length === 0);
  };

  const changeEmail = () => {
    if (!isAuthenticated) {
      const newEmail = generateRandomEmail(selectedDomain);
      setEmail(newEmail);
      return;
    }
    if (isEditing) {
      const [prefix] = email.split('@');
      if (prefix && prefix.length > 0) {
        setEmail(`${prefix}@${selectedDomain}`);
        setIsEditing(false);
      } else {
        setError('Please enter a valid email prefix.');
      }
    } else {
      setIsEditing(true);
    }
  };

  const handlePrimaryDomainChange = (domain: string) => {
    const current = localStorage.getItem('primaryDomain');
    if (current === domain) {
      localStorage.removeItem('primaryDomain');
      setPrimaryDomain(null);
    } else {
      localStorage.setItem('primaryDomain', domain);
      setPrimaryDomain(domain);
    }
  };

  const handleNewDomainUpdates = () => {
    setDiscoveredUpdates({ newDomains: true });
    localStorage.setItem('discoveredUpdates', JSON.stringify({ newDomains: true }));
  };

  return (
    <Card className="border-none shadow-xl dark:shadow-2xl bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="text-center pt-8 pb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Temp-Mail</h2>
        <p className="text-sm text-muted-foreground">Your disposable email solution</p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 px-6">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={email.split('@')[0]}
                onChange={(e) => handleEmailInputChage(e.target.value)}
                className="flex-1 text-lg p-3 border-2 border-blue-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter username"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-1/2 truncate text-lg p-3 rounded-lg border-2 border-blue-300 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700">
                    {selectedDomain || "Select Domain"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[min(100%,14rem)] max-h-[60vh] overflow-y-auto p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-lg border border-muted z-50 custom-scrollbar">
                  {availableDomains.map((domain) => {
                    const isCustom = !FREE_DOMAINS.includes(domain);
                    return (
                      <DropdownMenuItem
                        key={domain}
                        onSelect={() => handleDomainChange(domain)}
                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-muted dark:hover:bg-zinc-800"
                      >
                        <div className="flex items-center gap-2">
                          {isCustom && <Crown className="h-4 w-4 text-amber-500" />}
                          <span className="text-lg">{domain}</span>
                        </div>
                        <Button
                          title={primaryDomain === domain ? "Unset as primary" : "Set as primary"}
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handlePrimaryDomainChange(domain); }}
                          aria-label={`Set ${domain} as primary`}
                          className="hover:bg-transparent"
                        >
                          <Star className={`h-4 w-4 ${primaryDomain === domain ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                        </Button>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex-1 rounded-lg bg-blue-100 dark:bg-gray-700 p-3 text-center text-lg font-semibold text-blue-800 dark:text-white truncate">
              {email || "Loading..."}
            </div>
          )}
          <TooltipProvider delayDuration={200}>
            <div className="flex gap-2" role="group" aria-label="Email actions">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="relative border-2 border-blue-300 dark:border-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-700" onClick={copyEmail} disabled={blockButtons} aria-label="Copy email address" title="Copy email address">
                    <Copy className={cn("h-5 w-5 transition-all", copied && "opacity-0")} />
                    <span className={cn("absolute inset-0 flex items-center justify-center transition-all", copied ? "opacity-100" : "opacity-0")}>
                      <Check className="h-5 w-5 transition-all text-green-500" />
                    </span>
                    <span className="absolute top-[-2px] text-xs right-0 hidden sm:block">C</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isAuthenticated ? 'Press C to copy' : 'Login to use shortcuts'}</p></TooltipContent>
              </Tooltip>
              <Button className="hidden xs:flex" variant="outline" size="icon" onClick={() => setIsQRModalOpen(true)} disabled={blockButtons} title="Show QR Code" aria-label="Show QR Code" className="border-2 border-blue-300 dark:border-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-700">
                <QrCode className="h-5 w-5" />
              </Button>
              <ShareDropdown />
            </div>
          </TooltipProvider>
        </div>
        <TooltipProvider delayDuration={200}>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Email management actions">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled={blockButtons || isRefreshing} variant="outline" className="flex-1 border-2 border-blue-300 dark:border-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-700" onClick={refreshInbox} aria-label={isRefreshing ? 'Refreshing...' : 'Refresh Inbox'}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                  <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  <Badge variant="outline" className="ml-auto hidden sm:block">R</Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{isAuthenticated ? 'Press R to refresh' : 'Login to use shortcuts'}</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled={blockButtons} variant="outline" className="flex-1 border-2 border-blue-300 dark:border-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-700" onClick={() => { changeEmail(); handleNewDomainUpdates(); }} aria-label={isEditing ? 'Save Email' : 'Change Email'}>
                  {!session?.user ? <RotateCwSquare className="mr-2 h-4 w-4" /> : isEditing ? <CheckCheck className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                  <span className="hidden sm:inline">{!session?.user ? 'Change' : isEditing ? 'Save' : 'Change'}</span>
                  {isAuthenticated && <Badge variant="outline" className="ml-auto hidden sm:block">N</Badge>}
                  <AnimatePresence>
                    {!discoveredUpdates.newDomains && (
                      <motion.span key="new-badge" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="text-[10px] bg-blue-600 text-white rounded-full px-1.5 ml-1">New</motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{!isAuthenticated ? 'Login to edit and use its shortcut' : (session?.user?.plan === "pro") ? 'Press N to edit' : 'Only for PRO users'}</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled={blockButtons} variant="outline" className="flex-1 border-2 border-blue-300 dark:border-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-700" onClick={deleteEmail} aria-label="Delete Email Address">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                  <Badge variant="outline" className="ml-auto hidden sm:block">D</Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{!isAuthenticated ? 'Login to use shortcuts' : (session?.user?.plan === "pro") ? 'Press D to delete' : 'Only for PRO users'}</p></TooltipContent>
            </Tooltip>
            {(session?.user?.plan === 'pro') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 border-2 border-blue-300 dark:border-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-700" onClick={() => setIsManageModalOpen(true)} aria-label="Manage all inboxes">
                    <ListOrdered className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Manage Inboxes</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>View and manage your full inbox history.</p></TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
        <Table className="border-2 border-blue-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <TableHeader>
            <TableRow className="bg-blue-50 dark:bg-gray-800">
              <TableHead className="text-blue-700 dark:text-blue-300">{t('table_sender')}</TableHead>
              <TableHead className="text-blue-700 dark:text-blue-300">{t('table_subject')}</TableHead>
              <TableHead className="text-blue-700 dark:text-blue-300">{t('table_date')}</TableHead>
              <TableHead className="text-blue-700 dark:text-blue-300">{t('table_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Mail className="h-16 w-16 text-blue-400 dark:text-blue-500 mb-4" />
                    <div className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your inbox is empty</div>
                    <div className="text-sm text-muted-foreground">No new emails yet. Keep an eye on this space!</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message, index) => (
                <TableRow key={message.id} className={cn(index % 2 === 0 ? 'bg-blue-50 dark:bg-gray-850' : 'bg-white dark:bg-gray-900', 'hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors')}>
                  <TableCell className="py-4 px-4 text-gray-800 dark:text-gray-200">{message.from}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-800 dark:text-gray-200">{message.subject}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-600 dark:text-gray-300">{new Date(message.date).toLocaleString()}</TableCell>
                  <TableCell className="py-4 px-4 flex items-center space-x-2">
                    <Button variant="link" className="text-blue-600 hover:text-blue-800" onClick={() => viewMessage(message)}>{t('view')}</Button>
                    <Button variant="link" className="text-red-600 hover:text-red-800" onClick={() => deleteMessage(message.id)}>{t('delete')}</Button>
                    {/* --- REVISED: Save button with dynamic state --- */}
                    {(session?.user?.plan === 'free') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={savedMessageIds.has(message.id) ? "Unsave from Browser" : "Save to Browser"}
                        onClick={() => toggleSaveMessage(message)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Star className={cn("h-4 w-4", savedMessageIds.has(message.id) && "fill-yellow-500 text-yellow-500")} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="mt-8 bg-blue-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Inbox History</h3>
          <ul className="space-y-2">
            {emailHistory.map((historyEmail, index) => (
              <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-850 p-2 rounded-md">
                <span className="text-sm text-muted-foreground truncate">{historyEmail}</span>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" onClick={() => { setEmail(historyEmail); setOldEmailUsed(!oldEmailUsed); }}>Use</Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      {showAttachmentNotice && (
        <div className="p-3 mx-6 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 text-center border border-yellow-300">
          An email arrived with an attachment that exceeds your plan's limit. <button className="font-bold underline ml-2">Upgrade Now</button> to receive larger attachments.
        </div>
      )}
      <ManageInboxesModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} inboxes={initialInboxes} onSelectInbox={useHistoryEmail} />
      <QRCodeModal email={email} isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
      <MessageModal message={selectedMessage} isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} />
      {error && (<ErrorPopup message={error} onClose={() => setError(null)} />)}
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirmation} itemToDelete={itemToDelete?.type === 'email' ? 'email address' : 'message'} />
    </Card>
  );
}