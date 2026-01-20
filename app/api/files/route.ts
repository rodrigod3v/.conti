import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, size, rows } = body;

    // Check if file already exists
    const existingFile = await prisma.file.findFirst({
      where: { name },
    });

    if (existingFile) {
        // Update existing file: update timestamp and rows
        // Note: For simplicity, we are deleting old rows and adding new ones to ensure fresh data.
        // In a production app, we might want to be more careful.
        const updatedFile = await prisma.$transaction([
            prisma.row.deleteMany({ where: { fileId: existingFile.id } }),
            prisma.file.update({
                where: { id: existingFile.id },
                data: {
                    size,
                    rows: {
                        create: rows.map((row: any) => ({
                            data: JSON.stringify(row),
                        })),
                    },
                },
                include: { rows: true }
            })
        ]);

        return NextResponse.json(updatedFile[1]); // Return the updated file
    }

    // Create new file
    const newFile = await prisma.file.create({
      data: {
        name,
        size,
        rows: {
          create: rows.map((row: any) => ({
            data: JSON.stringify(row), // Storing dynamic row data as JSON string
          })),
        },
      },
      include: {
        rows: true,
      }
    });

    return NextResponse.json(newFile);
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
