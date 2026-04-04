import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const email = "fazil9113201968@gmail.com";
    const user = await prisma.user.update({
      where: { email },
      data: { role: "FREELANCER" },
    });

    return NextResponse.json({
      success: true,
      message: `Role for ${email} reverted to FREELANCER`,
      role: user.role,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
