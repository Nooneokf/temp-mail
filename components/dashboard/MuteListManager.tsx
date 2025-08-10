"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";


interface MuteListManagerProps {
    initialSenders: string[];
}

export function MuteListManager({ initialSenders }: MuteListManagerProps) {
    const {data: session, status: isAuthLoading} = useSession();
    const user = session?.user;
    const [mutedSenders, setMutedSenders] = useState<string[]>(initialSenders);
    const [newSender, setNewSender] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleMuteSender = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSender || !user) return;
        setIsLoading(true);
        const toastId = toast.loading(`Muting ${newSender}...`);

        try {
            const response = await fetch('/api/user/mute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderToMute: newSender, wyiUserId: user.id }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to mute sender.');

            setMutedSenders([...mutedSenders, newSender]);
            setNewSender("");
            toast.success('Sender muted.', { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUnmuteSender = async (senderToUnmute: string) => {
        if (!user) return;
        setIsLoading(true);
        const toastId = toast.loading(`Un-muting ${senderToUnmute}...`);

        try {
            const response = await fetch('/api/user/mute', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderToUnmute, wyiUserId: user.id }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to un-mute sender.');

            setMutedSenders(mutedSenders.filter(s => s !== senderToUnmute));
            toast.success('Sender un-muted.', { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mute Senders</CardTitle>
                <CardDescription>Block emails from specific senders or entire domains.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleMuteSender} className="flex gap-2 mb-4">
                    <Input
                        placeholder="sender@example.com or example.com"
                        value={newSender}
                        onChange={(e) => setNewSender(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !newSender}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mute
                    </Button>
                </form>
                <div className="rounded-md border p-4 min-h-[10rem]">
                    {mutedSenders.length > 0 ? (
                        <ul className="space-y-2">
                           {mutedSenders.map((sender) => (
                               <li key={sender} className="flex justify-between items-center bg-muted p-2 rounded">
                                   <span className="text-sm font-mono">{sender}</span>
                                   <Button variant="ghost" size="icon" onClick={() => handleUnmuteSender(sender)} disabled={isLoading}>
                                        <Trash2 className="h-4 w-4" />
                                   </Button>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Your mute list is empty.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}