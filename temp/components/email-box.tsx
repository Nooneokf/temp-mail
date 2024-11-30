"use client"

import { useState, useEffect } from 'react'
import { Mail, RefreshCw, Trash2, Edit, QrCode, Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { QRCodeModal } from "./qr-code-modal"
import { cn } from "@/lib/utils"
import { MessageModal } from "./message-modal"
import { ErrorPopup } from "./error-popup"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"

const DOMAIN = 'kodewith.me'

function generateRandomEmail() {
  return `user-${Math.floor(Math.random() * 1000000)}@${DOMAIN}`;
}

interface Message {
  id: string
  from: string
  to: string
  subject: string
  date: string
}

export function EmailBox() {
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [emailHistory, setEmailHistory] = useState<string[]>([])
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'email' | 'message', id?: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    } else {
      fetchToken();
    }
    setEmail(generateRandomEmail());
  }, []);

  useEffect(() => {
    const storedHistory = localStorage.getItem('emailHistory')
    if (storedHistory) {
      setEmailHistory(JSON.parse(storedHistory))
    }
    if (email) {
      refreshInbox()
    }
  }, [email])

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/auth', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setError('Failed to authenticate. Please try again later.');
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
        const newEmail = `${prefix}@${DOMAIN}`
        setEmail(newEmail)
        setIsEditing(false)
        
        const updatedHistory = [newEmail, ...emailHistory.filter(e => e !== newEmail)].slice(0, 5)
        setEmailHistory(updatedHistory)
        localStorage.setItem('emailHistory', JSON.stringify(updatedHistory))
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
      const newEmail = generateRandomEmail()
      setEmail(newEmail)
      setMessages([])
      
      const updatedHistory = [newEmail, ...emailHistory.filter(e => e !== newEmail)].slice(0, 5)
      setEmailHistory(updatedHistory)
      localStorage.setItem('emailHistory', JSON.stringify(updatedHistory))
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

  return (
    <Card className="border-dashed">
      <CardHeader>
        <h2 className="text-xl font-semibold">Your Temporary Email Address</h2>
        <p className="text-sm text-muted-foreground">
          Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              value={email.split('@')[0]}
              onChange={(e) => setEmail(`${e.target.value}@${DOMAIN}`)}
              className="flex-1"
            />
          ) : (
            <div className="flex-1 rounded-md bg-muted p-2">
              {email || 'Loading...'}
            </div>
          )}
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="icon"
              onClick={copyEmail}
              className="relative"
            >
              <Copy className={cn(
                "h-4 w-4 transition-all",
                copied ? "opacity-0" : "opacity-100"
              )} />
              <span className={cn(
                "absolute inset-0 flex items-center justify-center transition-all",
                copied ? "opacity-100" : "opacity-0"
              )}>
                ✓
              </span>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsQRModalOpen(true)}
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={refreshInbox} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing' : 'Refresh'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={changeEmail}>
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Save' : 'Change'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={deleteEmail}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
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
          <TableBody>
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
              messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.from}</TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell>{new Date(message.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="link" onClick={() => viewMessage(message)}>View</Button>
                    <Button variant="link" onClick={() => deleteMessage(message.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
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
                    onClick={() => setEmail(historyEmail)}
                  >
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
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

