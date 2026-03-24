import { NextResponse } from "next/server";

const statements = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.gadstylebd.app",
      sha256_cert_fingerprints: [
        // 1) Replace with the Google Play App Signing SHA-256 from:
        // Play Console -> Setup -> App integrity -> App signing key certificate
        "6C:AE:FD:1C:99:B4:A9:91:6B:07:24:90:03:EA:19:F3:6D:9B:05:DA:83:AE:71:62:EC:8B:15:AA:8E:43:0D:D0",

        // 2) Replace with your local upload/release keystore SHA-256.
        // Keep this if you also test manually installed release builds.
        "20:FB:2C:57:7A:5F:2E:C9:0E:61:63:B2:B5:B6:DB:FD:D2:16:F4:6E:FE:38:EC:C0:76:B4:52:F6:D6:35:81:C6",

        // Optional temporary value: current debug SHA-256 used for local testing only.
        // Remove this before production if you do not want debug builds to verify.
        "C3:01:7E:09:8E:5A:D4:7A:47:8D:D6:D9:71:99:AD:30:46:C0:B7:59:E5:91:7C:15:5E:F5:83:53:41:80:C6:21",
      ],
    },
  },
];

export async function GET() {
  return NextResponse.json(statements, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
