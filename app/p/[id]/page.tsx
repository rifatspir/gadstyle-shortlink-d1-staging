export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OpenAppLanding } from "@/components/OpenAppLanding";
import { resolveLandingForDirectRoute } from "@/lib/web-landing";

export default async function ProductLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headerStore = await headers();
  const payload = await resolveLandingForDirectRoute({
    targetType: "product",
    targetId: id,
    request: new Request(`https://app.gadstyle.com/p/${id}`, { headers: headerStore }),
  });

  if (!payload) redirect("https://www.gadstyle.com/");

  return <OpenAppLanding appHost="app.gadstyle.com" appPath={payload.appPath} canonicalUrl={payload.canonicalUrl} headline={payload.headline} />;
}
