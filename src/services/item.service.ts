import { AppDataSource } from "../data-source";
import { Item } from "../entity/Item";

export class ItemService {
    private static itemRepo = AppDataSource.getRepository(Item);

    static create(item_name: string, description: string, slot: string, picture: string, power: number): void {
        const newItem = new Item();
        newItem.name = item_name;
        newItem.description = description;
        newItem.picture = picture;
        newItem.slot = slot;
        newItem.power = power;
        this.itemRepo.save(newItem);
    }

    static async getItem(item_id: number): Promise<Item> {
        const res: Item[] = await this.itemRepo.findBy({id: item_id});
        if (res.length) {
            return res[0];
        } else {
            throw Error("No item with such id!");
        }
    }
}