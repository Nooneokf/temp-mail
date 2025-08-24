
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CustomDomainManager } from "@/components/dashboard/CustomDomainManager";
import { MuteListManager } from "@/components/dashboard/MuteListManager";
import UnauthView from "@/components/dashboard/UnauthView";
import NotProView from "@/components/dashboard/NotProView";
import { fetchFromServiceAPI } from "@/lib/api";
import { ThemeProvider } from "@/components/theme-provider";
import { AppHeader } from "@/components/app-header";

interface DashboardData {
    customDomains: any[];
    mutedSenders: string[];
}

export default async function DashboardPage({
    params,
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);

    let data: DashboardData | null = null;
    let accessLevel: "unauth" | "notpro" | "pro" = "unauth";

    if (session?.user) {
        console.log(session.user)
        if (session.user.plan === "pro") {
            accessLevel = "pro";
            try {
                data = await fetchFromServiceAPI(`/user/${session.user.id}/dashboard-data`)
            } catch (e) {
                accessLevel = 'unauth'
            }
        } else {
            accessLevel = "notpro";
        }
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <AppHeader initialSession={session} />
                
                {accessLevel === "unauth" && <UnauthView />}
                {accessLevel === "notpro" && <NotProView />}
                {accessLevel === "pro" && data && (
                    <div className="container mx-auto px-4 py-8">
                        {/* Pro Dashboard Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Pro Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Manage your premium temp mail features
                            </p>
                        </div>

                        {/* Dashboard Grid */}
                        <div className="grid gap-8 max-w-6xl mx-auto">
                            {/* Custom Domain Manager */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                        </svg>
                                        Custom Domains
                                    </h2>
                                    <p className="text-blue-100 text-sm mt-1">Use your own domains for professional temp mail</p>
                                </div>
                                <div className="p-6">
                                    <CustomDomainManager initialDomains={data.customDomains} />
                                </div>
                            </div>

                            {/* Mute List Manager */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 18M6 6l12 12" />
                                        </svg>
                                        Spam Management
                                    </h2>
                                    <p className="text-red-100 text-sm mt-1">Block unwanted senders and manage your mute list</p>
                                </div>
                                <div className="p-6">
                                    <MuteListManager initialSenders={data.mutedSenders} />
                                </div>
                            </div>
                        </div>

                        {/* Pro Features Info */}
                        <div className="mt-12 text-center">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800 max-w-2xl mx-auto">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    🎉 You're a Pro Member!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Enjoy unlimited temp mail addresses, extended storage, custom domains, and priority support.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4 text-sm">
                                    <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                                        ✓ Custom Domains
                                    </span>
                                    <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                                        ✓ Extended Storage
                                    </span>
                                    <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                                        ✓ Priority Support
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
}
