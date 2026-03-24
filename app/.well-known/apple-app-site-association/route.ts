import { NextResponse } from "next/server";

const aasa = {
  applinks: {
    details: [
      {
        appIDs: ["APPLE_TEAM_ID.com.gadstylebd.app"],
        components: [
          { "/": "/p/*" },
          { "/": "/c/*" },
          { "/": "/b/*" },
          { "/": "/s/*" },
        ],
      },
    ],
  },
};

export async function GET() {
  return NextResponse.json(aasa, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
