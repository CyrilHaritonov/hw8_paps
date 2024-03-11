import { AppDataSource } from "../data-source";
import { Inventory } from "../entity/Inventory";

export class InventoryService {
    private static InventRepo = AppDataSource.getRepository(Inventory);

    static create(user_id: number, item_id: number): void {
        const new_inventory_line = new Inventory();
        new_inventory_line.item_id = item_id;
        new_inventory_line.owner = user_id;
        this.InventRepo.save(new_inventory_line);
    }

    static getInventory(user_id: number): Promise<Inventory[]> {
        return this.InventRepo.findBy({owner: user_id});
    }

    static delete(id: number) {
        this.InventRepo.softDelete(id);
    }
}