import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        rows: true,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch file", details: error.message },
      { status: 500 }
    );
  }
}
