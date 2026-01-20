import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, size, rows } = body;

    // Transaction to create File and its Rows
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
      orderBy: { createdAt: "desc" },
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
