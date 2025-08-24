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
            <div className="min-h-screen max-w-[100vw] bg-background">
                <AppHeader initialSession={session} />
                {accessLevel === "unauth" && <UnauthView />}
                {accessLevel === "notpro" && <NotProView />}
                {accessLevel === "pro" && data && (
                    <>
                        <h1 className="text-3xl w-full text-center font-bold my-8">Pro Dashboard</h1>
                        <div className="grid gap-8">
                            <CustomDomainManager initialDomains={data.customDomains} />
                            <MuteListManager initialSenders={data.mutedSenders} />
                        </div>
                    </>
                )}
            </div>
        </ThemeProvider>
    );
}
