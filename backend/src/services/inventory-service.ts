import { prisma } from "@/prisma";

export class InventoryService {
  /**
   * Get all warehouses for the company
   */
  static async getWarehouses(companyId: string) {
    return prisma.warehouse.findMany({
      where: { companyId },
      include: {
        manager: { select: { firstName: true, lastName: true } },
        _count: { select: { items: true } }
      }
    });
  }

  /**
   * Get all inventory items
   */
  static async getInventoryItems(companyId: string) {
    return prisma.inventoryItem.findMany({
      where: { warehouse: { companyId } },
      include: {
        warehouse: { select: { name: true } }
      },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Add a new item to inventory
   */
  static async addInventoryItem(data: any, warehouseId: string) {
    return prisma.inventoryItem.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantity: data.quantity ? parseInt(data.quantity) : 0,
        unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : null,
        warehouseId: warehouseId
      }
    });
  }

  /**
   * Log a stock movement (Check In / Check Out)
   */
  static async logStockMovement(itemId: string, type: "IN" | "OUT", quantity: number, actorId: string, reference?: string) {
    // First record the movement
    const movement = await prisma.stockMovement.create({
      data: {
        itemId,
        type,
        quantity,
        actorId,
        reference
      }
    });

    // Then update the item quantity
    const qtyChange = type === "IN" ? quantity : -quantity;
    
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantity: { increment: qtyChange },
        status: { set: "IN_STOCK" } // Simplifying status updates for demo
      }
    });

    return movement;
  }
}
