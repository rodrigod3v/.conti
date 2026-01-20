import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileId, rows } = body;

    // Delete existing rows for this file (full replacement strategy for simplicity)
    await prisma.row.deleteMany({
      where: { fileId },
    });

    // Create new rows
    await prisma.row.createMany({
      data: rows.map((row: any) => ({
        fileId,
        data: JSON.stringify(row),
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving rows:", error);
    return NextResponse.json(
      { error: "Failed to save rows" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "File ID required" }, { status: 400 });
  }

  try {
    const rows = await prisma.row.findMany({
      where: { fileId },
    });

    // Parse JSON data back to object
    const parsedRows = rows.map((row) => ({
      ...JSON.parse(row.data),
      id: row.id, // Keep row ID for potential future efficient updates
    }));

    return NextResponse.json(parsedRows);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rows" },
      { status: 500 }
    );
  }
}
