"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const Feature = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <span className="text-muted-foreground">{children}</span>
    </li>
);

export function AuthPopup({ isOpen, onClose }: AuthPopupProps) {
    const handleLogin = () => {
        // This is where you redirect to your WYI OAuth provider
        const wyiOAuthUrl = `https://whatsyour.info/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/wyi&response_type=code&scope=profile:read%20email:read`;
        window.location.href = wyiOAuthUrl;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">Unlock More Features</DialogTitle>
                    <DialogDescription className="text-center">
                        Choose a plan that works for you. Log in with your whatsyour.info account to upgrade.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                    {/* Free Plan */}
                    <div className="border rounded-lg p-6 flex flex-col">
                        <h3 className="text-xl font-bold">Free</h3>
                        <p className="text-muted-foreground mb-4">For casual use.</p>
                        <p className="text-3xl font-bold mb-6">$0 <span className="text-lg font-normal text-muted-foreground">/ forever</span></p>
                        <ul className="space-y-3 mb-8 flex-grow">
                            <Feature>10 Emails per Mailbox</Feature>
                            <Feature>24 Hour Email Storage</Feature>
                            <Feature>1MB Attachment Limit</Feature>
                            <Feature>Save to Browser Storage</Feature>
                            <Feature>Basic Keyboard Shortcuts</Feature>
                        </ul>
                        <Button variant="outline" onClick={handleLogin}><img src='/wyi.png' className="w-5 h-5" /> Login with WYI </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="border-2 border-primary rounded-lg p-6 flex flex-col relative">
                        <div className="absolute top-0 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 text-sm rounded-full">Most Popular</div>
                        <h3 className="text-xl font-bold">Pro</h3>
                        <p className="text-muted-foreground mb-4">For power users and developers.</p>
                        <div className="flex items-end gap-2 mb-6">
                           <p className="text-3xl font-bold">$6 <span className="text-lg font-normal text-muted-foreground">/ month</span></p>
                           <p className="text-muted-foreground">or $59/year</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-grow">
                           <Feature>Unlimited Mailbox Size</Feature>
                           <Feature>Permanent Email Storage on Cloud</Feature>
                           <Feature>25MB Attachment Limit</Feature>
                           <Feature>Custom Domains</Feature>
                           <Feature>Mute Senders & Full Shortcuts</Feature>
                           <Feature>Private Mailbox</Feature>
                        </ul>
                        <Button onClick={handleLogin}><img src='/wyi.png' className="w-5 h-5" />Upgrade with WYI</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}