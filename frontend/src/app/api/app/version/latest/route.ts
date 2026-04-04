import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "1.0.0",
    forceUpdate: false,
    message: "App is up to date",
    downloadUrl: "https://contractual.app"
  });
}
