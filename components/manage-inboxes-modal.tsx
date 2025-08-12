// components/manage-inboxes-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";

interface ManageInboxesModalProps {
  isOpen: boolean;
  onClose: () => void;
  inboxes: string[];
  onSelectInbox: (inbox: string) => void;
}

export function ManageInboxesModal({ isOpen, onClose, inboxes, onSelectInbox }: ManageInboxesModalProps) {
  const handleUseClick = (inbox: string) => {
    onSelectInbox(inbox);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Your Inboxes</DialogTitle>
          <DialogDescription>
            Select an inbox from your history to make it active.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          <div className="space-y-2">
            {inboxes.length > 0 ? (
              inboxes.map((inbox) => (
                <div key={inbox} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate pr-2">{inbox}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseClick(inbox)}
                  >
                    Use
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                <List className="mx-auto h-8 w-8 mb-2" />
                No saved inboxes found.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}