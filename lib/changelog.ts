export interface ChangelogFeature {
    icon: React.ElementType; // We will use Lucide icons directly
    tag: 'New' | 'Improved' | 'Fixed' | 'Pro';
    title: string;
    description: string;
    link?: string;
}

export interface ChangelogEntry {
    version: string;
    date: string;
    title: string;
    features: ChangelogFeature[];
}

// Import Lucide icons
import {
    Sparkles, Crown, Server, Lock, LogIn, Mail, Paperclip, Clock,
    Bot, Keyboard, BookOpen, GitBranch
} from 'lucide-react';

export const changelogData: ChangelogEntry[] = [
    {
        version: "3.0.0",
        date: "August 2025",
        title: "The Pro Update & Complete Overhaul",
        features: [
            {
                icon: Crown,
                tag: 'Pro',
                title: "Pro & Free Tiers Introduced",
                description: "Log in with your whatsyour.info account to unlock a suite of powerful new features.",
                link: '/#pricing'
            },
            {
                icon: BookOpen,
                tag: 'Pro',
                title: "Custom Domain Support",
                description: "Pro users can now add, verify, and receive emails on their own personal domains.",
                link: '/dashboard'
            },
            {
                icon: Server,
                tag: 'Pro',
                title: "Permanent Cloud Storage",
                description: "Get 5GB of permanent email storage and a 25MB attachment limit as a Pro user.",
            },
            {
                icon: Bot,
                tag: 'Pro',
                title: "Mute Senders",
                description: "Tired of spam? Pro users can now block emails from specific senders or entire domains.",
                link: '/dashboard'
            },
            {
                icon: LogIn,
                tag: 'New',
                title: "Login with WYI",
                description: "Securely log in using your whatsyour.info account to access enhanced features.",
            },
            {
                icon: Lock,
                tag: 'New',
                title: "Domain-Specific Inboxes",
                description: "Mailboxes are now fully separate for each domain, enhancing privacy and security.",
            },
            {
                icon: Paperclip,
                tag: 'Improved',
                title: "Tiered Attachment Handling",
                description: "Limits are now based on your plan (0MB for anonymous, 1MB for Free, 25MB for Pro).",
            },
            {
                icon: Clock,
                tag: 'Improved',
                title: "Smarter Storage Limits",
                description: "Email storage and auto-deletion times are now tiered based on user plan.",
            },
            {
                icon: Keyboard,
                tag: 'Improved',
                title: "Advanced Keyboard Shortcuts",
                description: "Pro users get full shortcut access, while Free users get basic navigation.",
            }
        ]
    },
    {
        version: "2.5.0",
        date: "June 2025",
        title: "Quality of Life",
        features: [
            {
                icon: Mail,
                tag: 'New',
                title: "More Free Domains",
                description: "We've added a new batch of free domains for you to choose from.",
            },
            {
                icon: GitBranch,
                tag: 'Improved',
                title: "Backend Overhaul",
                description: "The service was migrated to a faster, more reliable server architecture.",
            }
        ]
    }
];

export const LATEST_CHANGELOG_VERSION = changelogData[0].version;