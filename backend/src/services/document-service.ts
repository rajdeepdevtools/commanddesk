import { prisma } from "@/prisma";

export class DocumentService {
  static async getDocuments(userId: string, role: string) {
    // If Admin/HR, they can see ALL documents.
    // Otherwise, they see their own documents + any public documents in the company.
    // Since we don't have companyId directly on Document, we join through uploader.
    
    // First, get the user's companyId
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
    if (!user?.companyId) return [];

    let whereClause: any = {
      uploader: { companyId: user.companyId }
    };

    if (role !== "ADMIN" && role !== "ORGANIZATION_OWNER" && role !== "HR") {
      whereClause = {
        ...whereClause,
        OR: [
          { uploaderId: userId },
          { isPublic: true }
        ]
      };
    }

    return prisma.document.findMany({
      where: whereClause,
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async uploadDocument(userId: string, data: any) {
    return prisma.document.create({
      data: {
        uploaderId: userId,
        name: data.name,
        fileUrl: data.fileUrl || "/placeholder-file.pdf",
        fileType: data.fileType || "application/pdf",
        fileSize: data.fileSize || 1024000, // 1MB mock
        description: data.description,
        folder: data.folder || "Uncategorized",
        isPublic: data.isPublic || false,
      },
    });
  }

  static async deleteDocument(userId: string, role: string, documentId: string) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new Error("Document not found");

    // Only uploader or Admin can delete
    if (document.uploaderId !== userId && role !== "ADMIN" && role !== "ORGANIZATION_OWNER") {
      throw new Error("Unauthorized to delete this document");
    }

    return prisma.document.delete({
      where: { id: documentId },
    });
  }
}
