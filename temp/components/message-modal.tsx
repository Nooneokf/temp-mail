"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Message {
  id: string
  from: string
  to: string
  subject: string
  date: string
  body?: string
  html?: string
}

interface MessageModalProps {
  message: Message | null
  isOpen: boolean
  onClose: () => void
}

export function MessageModal({ message, isOpen, onClose }: MessageModalProps) {
  const [fullMessage, setFullMessage] = useState<Message | null>(null)
  const [token, setToken] = useState<string | null>(null)
  
  if (typeof window !== 'undefined') {

    setToken(localStorage.getItem('authToken'));
  }

  useEffect(() => {
    if (message && isOpen) {
      fetchFullMessage(message.id)
    }
  }, [message, isOpen])

  const fetchFullMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/mailbox?mailbox=${message?.to.split('@')[0]}&messageId=${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json()
      console.log('Full message data:', data)
      if (data.success) {
        setFullMessage(data.data)
      } else {
        console.error('Failed to fetch full message:', data.message)
      }
    } catch (error) {
      console.error('Error fetching full message:', error)
    }
  }

  if (!message) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p><strong>From:</strong> {message.from}</p>
          <p><strong>To:</strong> {message.to}</p>
          <p><strong>Date:</strong> {new Date(message.date).toLocaleString()}</p>
        </div>
        <div className="mt-4">
          {fullMessage?.html ? (
            <div dangerouslySetInnerHTML={{ __html: fullMessage.html }} />
          ) : (
            <pre className="whitespace-pre-wrap">{fullMessage?.body || 'Loading...'}</pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

