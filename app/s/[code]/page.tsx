export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OpenAppLanding } from "@/components/OpenAppLanding";
import { resolveLandingForShortCode } from "@/lib/web-landing";

export default async function ShortCodeLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const headerStore = await headers();
  const payload = await resolveLandingForShortCode({
    code,
    request: new Request(`https://app.gadstyle.com/s/${code}`, { headers: headerStore }),
  });

  if (!payload) redirect("https://www.gadstyle.com/");

  return <OpenAppLanding appHost="app.gadstyle.com" appPath={payload.appPath} canonicalUrl={payload.canonicalUrl} headline={payload.headline} />;
}
