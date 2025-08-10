"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Copy, Trash2, CheckCircle, HelpCircle } from "lucide-react";
import { RefreshCw } from "lucide-react"; // <-- Add RefreshCw
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface CustomDomain {
    domain: string;
    verified: boolean;
    mxRecord: string;
    txtRecord: string;
}

interface CustomDomainManagerProps {
    initialDomains: CustomDomain[];
}

export function CustomDomainManager({ initialDomains }: CustomDomainManagerProps) {
    const {data: session, status: isAuthLoading} = useSession();
    const user = session?.user;
    const [domains, setDomains] = useState<CustomDomain[]>(initialDomains);
    const [newDomain, setNewDomain] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain || !user) return;
        setIsLoading(true);
        const toastId = toast.loading('Adding domain...');

        try {
            // This is a NEW API endpoint we will create
            const response = await fetch('/api/user/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newDomain, wyiUserId: user.id }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to add domain.');

            setDomains([...domains, result.data]);
            setNewDomain("");
            toast.success('Domain added successfully!', { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDomain = async (domainToDelete: string) => {
        if (!user) return;
        setIsLoading(true);
        const toastId = toast.loading(`Deleting ${domainToDelete}...`);

        try {
            const response = await fetch('/api/user/domains', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: domainToDelete, wyiUserId: user.id }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to delete domain.');

            setDomains(domains.filter(d => d.domain !== domainToDelete));
            toast.success('Domain deleted.', { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyDomain = async (domainToVerify: string) => {
        if (!user) return;
        setVerifyingDomain(domainToVerify);
        const toastId = toast.loading(`Verifying ${domainToVerify}...`);

        try {
            // This is a NEW API endpoint we will create
            const response = await fetch('/api/user/domains/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: domainToVerify, wyiUserId: user.id }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Verification failed.');

            if (result.success && result.verified) {
                // Update the state to reflect the change
                setDomains(domains.map(d =>
                    d.domain === domainToVerify ? { ...d, verified: true } : d
                ));
                toast.success('Domain verified successfully!', { id: toastId });
            } else {
                throw new Error('DNS record not found or not propagated yet. Please try again in a few minutes.');
            }
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            setVerifyingDomain(null);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Custom Domains</CardTitle>
                <CardDescription>Add and verify your custom domains to receive emails.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddDomain} className="flex gap-2 mb-6">
                    <Input
                        placeholder="your-domain.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !newDomain}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Domain
                    </Button>
                </form>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Domain</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Required DNS Records</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {domains.length > 0 ? domains.map((d) => (
                                <TableRow key={d.domain}>
                                    <TableCell className="font-medium">{d.domain}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {d.verified ? <CheckCircle className="mr-1 h-3 w-3" /> : <HelpCircle className="mr-1 h-3 w-3" />}
                                            {d.verified ? 'Verified' : 'Pending Verification'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span><strong>Type:</strong> MX, <strong>Value:</strong> {d.mxRecord}</span>
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(d.mxRecord, 'MX Record')}><Copy className="h-3 w-3" /></Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span><strong>Type:</strong> TXT, <strong>Value:</strong> {d.txtRecord}</span>
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(d.txtRecord, 'TXT Record')}><Copy className="h-3 w-3" /></Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* --- VERIFY BUTTON LOGIC --- */}
                                        {!d.verified && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleVerifyDomain(d.domain)}
                                                disabled={verifyingDomain === d.domain}
                                                className="mr-2"
                                            >
                                                {verifyingDomain === d.domain ? (
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                ) : null}
                                                Verify
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDomain(d.domain)} disabled={isLoading}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">No custom domains added yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}