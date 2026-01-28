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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rows } = body;

    // 1. Verify file exists
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 2. Transaction: Delete old rows, insert new ones
    // Batch insert similar to POST to handle large data
    const BATCH_SIZE = 500;
    
    // We can't easily do a massive transaction if it's too huge, but detailed replacement is safer.
    // For simplicity/speed in this context: Delete all, create all.
    
    await prisma.$transaction(async (tx) => {
        // Delete all
        await tx.row.deleteMany({ where: { fileId: id } });

        // Insert in batches
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const chunk = rows.slice(i, i + BATCH_SIZE);
            await tx.row.createMany({
                data: chunk.map((row: any) => ({
                    fileId: id,
                    data: JSON.stringify(row),
                }))
            });
        }
        
        // Update file timestamp
        await tx.file.update({
            where: { id },
            data: { updatedAt: new Date() }
        });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file", details: error.message },
      { status: 500 }
    );
  }
}
