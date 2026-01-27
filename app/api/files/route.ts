import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, size, rows } = body;

    // Check if file already exists
    let fileId: string;
    const existingFile = await prisma.file.findFirst({
      where: { name },
    });

    if (existingFile) {
      // Update existing file: update timestamp and size
        await prisma.file.update({
            where: { id: existingFile.id },
            data: { size }
        });
        
        // Delete all existing rows for this file
        await prisma.row.deleteMany({ where: { fileId: existingFile.id } });
        fileId = existingFile.id;
    } else {
        // Create new file record
        const newFile = await prisma.file.create({
            data: {
                name,
                size,
                status: "Processing"
            }
        });
        fileId = newFile.id;
    }

    // Batch Insert Logic
    const BATCH_SIZE = 500;
    try {
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const chunk = rows.slice(i, i + BATCH_SIZE);
            
            await prisma.row.createMany({
                data: chunk.map((row: any) => ({
                    fileId: fileId,
                    data: JSON.stringify(row),
                }))
            });
        }
        
        // Update status to Processed when done
        const finalFile = await prisma.file.update({
            where: { id: fileId },
            data: { status: "Processed" },
            include: { rows: true }
        });

        return NextResponse.json(finalFile);

    } catch (insertError) {
        console.error("Error during batch insert:", insertError);
        // Cleanup: Use query directly if possible or finding unique ID might be hard if we just created it.
        // If it was a new file, maybe delete it. If existing, we already wiped the rows, so it's in a bad state.
        // Best approach: Mark as Error.
        await prisma.file.update({
            where: { id: fileId },
            data: { status: "Error" }
        });
        
        throw insertError; 
    }

  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Failed to create file" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const files = await prisma.file.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    });
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
