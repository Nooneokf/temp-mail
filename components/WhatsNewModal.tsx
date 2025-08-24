"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { changelogData, ChangelogEntry, ChangelogFeature } from '@/lib/changelog';
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tag = ({ type }: { type: ChangelogFeature['tag'] }) => {
    const styles = {
        New: 'border-blue-300/50 bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-500/30',
        Improved: 'border-green-300/50 bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-300 dark:border-green-500/30',
        Fixed: 'border-gray-300/50 bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-500/30',
        Pro: 'border-amber-300/50 bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-500/30',
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${styles[type]}`}>
            {type}
        </span>
    );
};


const FeatureCard = ({ feature }: { feature: ChangelogFeature }) => {
    const Icon = feature.icon;
    return (
        <div className="flex flex-col p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-muted rounded-md">
                   <Icon className="h-5 w-5 text-muted-foreground"/>
                </div>
                <Tag type={feature.tag} />
            </div>
            <h4 className="font-semibold mb-1">{feature.title}</h4>
            <p className="text-sm text-muted-foreground flex-grow">{feature.description}</p>
            {feature.link && (
                <Link href={feature.link} className="mt-3 text-primary hover:underline inline-flex items-center text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            )}
        </div>
    );
};


export function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl">What's New in tempmail.encorebot.me</DialogTitle>
          <DialogDescription>
            We're constantly working to improve your experience. Here are the latest updates.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-10 custom-scrollbar">
            {changelogData.map((entry) => (
                <section key={entry.version}>
                    <div className="flex items-baseline gap-4 mb-4">
                        <h3 className="text-xl font-bold">{entry.title}</h3>
                        <p className="text-sm text-muted-foreground">{entry.date} (v{entry.version})</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {entry.features.map((feature, index) => (
                           <FeatureCard key={index} feature={feature} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}