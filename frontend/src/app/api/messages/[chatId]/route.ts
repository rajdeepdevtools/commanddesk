import { NextResponse } from "next/server";
import { ChatService } from "@/lib/services/chat-service";
import { getUserSession } from "@/lib/auth/session";

export async function GET(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chat = await ChatService.getChatById(params.chatId, session.user.id);
    return NextResponse.json(chat);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to load chat" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const message = await ChatService.sendMessage(params.chatId, session.user.id, content);
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to send message" }, { status: 500 });
  }
}
