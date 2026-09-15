import { prisma } from "@/prisma";
import { EmailService } from "./email/email-service";
import { getChatMentionTemplate } from "./email/templates";

export class ChatService {
  /**
   * Fetch all chats that a user is part of.
   */
  static async getUserChats(userId: string) {
    return prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Fetch a specific chat and its messages.
   */
  static async getChatById(chatId: string, userId: string) {
    // Ensure the user is a participant
    const isParticipant = await prisma.chatParticipant.findUnique({
      where: { userId_chatId: { userId, chatId } },
    });

    if (!isParticipant) {
      throw new Error("Unauthorized to view this chat");
    }

    return prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" }, // Oldest to newest for rendering chat history
        },
      },
    });
  }

  /**
   * Send a new message in a chat.
   */
  static async sendMessage(chatId: string, senderId: string, content: string) {
    const isParticipant = await prisma.chatParticipant.findUnique({
      where: { userId_chatId: { userId: senderId, chatId } },
    });

    if (!isParticipant) {
      throw new Error("Unauthorized to send message in this chat");
    }

    // Update the chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Fetch all participants to figure out who to notify
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: { include: { user: { select: { id: true, firstName: true, email: true } } } } }
    });

    const newMessage = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        type: "TEXT",
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      }
    });

    // Notify other participants (especially for DMs)
    if (chat && !chat.isGroup) {
      const otherParticipant = chat.participants.find(p => p.userId !== senderId);
      if (otherParticipant?.user?.email) {
        EmailService.sendMail({
          to: otherParticipant.user.email,
          subject: `New Message from ${newMessage.sender.firstName} 💬`,
          html: getChatMentionTemplate(
            otherParticipant.user.firstName,
            `${newMessage.sender.firstName} ${newMessage.sender.lastName}`,
            content
          )
        }).catch(console.error);
      }
    }

    return newMessage;
  }

  /**
   * Start a new 1-on-1 direct message (or find existing).
   */
  static async createDirectMessage(userId1: string, userId2: string) {
    // See if a 1-on-1 chat already exists between these two
    const existingChats = await prisma.chat.findMany({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ]
      }
    });

    if (existingChats.length > 0) {
      return existingChats[0]; // Return existing DM
    }

    // Create a new DM
    return prisma.chat.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: userId1, role: "MEMBER" },
            { userId: userId2, role: "MEMBER" },
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
          }
        }
      }
    });
  }
}
