import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.setting.findUnique({
      where: { id: "config" },
    });

    if (!settings) {
        // Create default settings if not exists
        settings = await prisma.setting.create({
            data: {
                id: "config",
                responsibles: JSON.stringify(["Carlos Mendes", "Ana Silva", "Roberto Junior"]),
                status: JSON.stringify(["Processado", "Pendente", "Erro", "Em Análise"]),
            }
        });
    }

    return NextResponse.json({
        responsibles: JSON.parse(settings.responsibles),
        status: JSON.parse(settings.status),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { responsibles, status } = body;

    const settings = await prisma.setting.upsert({
      where: { id: "config" },
      update: {
        responsibles: JSON.stringify(responsibles),
        status: JSON.stringify(status),
      },
      create: {
        id: "config",
        responsibles: JSON.stringify(responsibles),
        status: JSON.stringify(status),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
