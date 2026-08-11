import { NextResponse } from "next/server";
import { ChatService } from "@/lib/services/chat-service";
import { getUserSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chats = await ChatService.getUserChats(session.user.id);
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: "Unable to load chats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { targetUserId } = body;
    
    if (!targetUserId) {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
    }

    const dm = await ChatService.createDirectMessage(session.user.id, targetUserId);
    return NextResponse.json(dm, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to start chat" }, { status: 500 });
  }
}
