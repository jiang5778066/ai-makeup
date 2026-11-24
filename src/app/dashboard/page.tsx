import type { Metadata } from "next";
export const metadata: Metadata = { title: "My creations", robots: { index: false, follow: true } };
import { PlatformCreationsPage } from "@/components/platform-creations-page";
export const dynamic = "force-dynamic";
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) { return <PlatformCreationsPage locale="en" path="/dashboard" filter={(await searchParams).filter}/>; }
