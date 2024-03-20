import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { InventoryService } from "./inventory.service";
import { ItemService } from "./item.service";

export class UserService {
    private static userRepo = AppDataSource.getRepository(User);

    static create(id: number, char_name: string, char_class: string, avatar: string): void {
        const newUser = new User();
        newUser.char_name = char_name;
        newUser.char_class = char_class;
        newUser.avatar = avatar;
        newUser.is_admin = false;
        newUser.id = id;
        newUser.money = 1000;
        newUser.rm_currency = 100;
        this.userRepo.save(newUser);
    }

    static async checkIfExists(user_id: number): Promise<boolean> {
        return await this.userRepo.existsBy({ id: user_id });
    }

    static async checkIfAdmin(user_id: number): Promise<boolean> {
        return await this.userRepo.existsBy({ id: user_id, is_admin: true })
    }

    static async getUserInfo(user_id: number): Promise<User> {
        const result: User[] = await this.userRepo.findBy({ id: user_id });
        if (result.length) {
            return result[0];
        } else {
            throw Error("No user with such id");
        }
    }

    static async checkMoneyBalance(user_id: number): Promise<number> {
        const result: User[] = await this.userRepo.findBy({ id: user_id });
        if (result.length) {
            return result[0].money;
        } else {
            throw Error("No user with such id");
        }
    }

    static async checkRMCurrencyBalance(user_id: number): Promise<number> {
        const result: User[] = await this.userRepo.findBy({ id: user_id });
        if (result.length) {
            return result[0].rm_currency;
        } else {
            throw Error("No user with such id");
        }
    }

    static payWithMoney(user_id: number, amount: number): void {
        this.userRepo.decrement({ id: user_id }, "money", amount);
    }

    static payWithRMCurrency(user_id: number, amount: number): void {
        this.userRepo.decrement({ id: user_id }, "rm_currency", amount);
    }

    static getMoney(user_id: number, amount: number): void {
        this.userRepo.increment({ id: user_id }, "money", amount);
    }

    static getRMCurrency(user_id: number, amount: number): void {
        this.userRepo.increment({ id: user_id }, "rm_currency", amount);
    }

    static addToUser(user_id: number, amount: number, variable: string): void {
        this.userRepo.increment({ id: user_id }, variable, amount);
    }

    static async putItemInSlot(user_id: number, inventory_id: number, slot: string): Promise<void> {
        if (["arms", "legs", "feet", "lefthand", "righthand", "head", "thorax"].some(value => value === slot)) {
            const user_data = await UserService.getUserInfo(user_id);
            const item_id = await InventoryService.getItemFromInventory(user_id, inventory_id);
            const item_slot = await ItemService.getItemSlot(item_id);
            if (item_slot !== slot) {
                throw Error("Wrong slot for this item!");
            }
            switch (slot) {
                case "arms":
                    if (user_data.arms_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.arms_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "arms_item_equiped": item_id });
                    break;
                case "legs":
                    if (user_data.legs_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.legs_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "legs_item_equiped": item_id });
                    break;
                case "feet":
                    if (user_data.feet_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.feet_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "feet_item_equiped": item_id });
                    break;
                case "lefthand":
                    if (user_data.lefthand_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.lefthand_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "lefthand_item_equiped": item_id });
                    break;
                case "righthand":
                    if (user_data.righthand_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.righthand_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "righthand_item_equiped": item_id });
                    break;
                case "head":
                    if (user_data.head_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.head_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "head_item_equiped": item_id });
                    break;
                case "thorax":
                    if (user_data.thorax_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.thorax_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "thorax_item_equiped": item_id });
                    break;
            }
            InventoryService.delete(inventory_id);
        } else {
            throw Error("Wrong slot");
        }
    }

    static async removeItemFromSlot(user_id: number, slot: string): Promise<void> {
        if (["arms", "legs", "feet", "lefthand", "righthand", "head", "thorax"].some(value => value === slot)) {
            const user_data = await UserService.getUserInfo(user_id);
            switch (slot) {
                case "arms":
                    if (user_data.arms_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.arms_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "arms_item_equiped": 0 });
                    break;
                case "legs":
                    if (user_data.legs_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.legs_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "legs_item_equiped": 0 });
                    break;
                case "feet":
                    if (user_data.feet_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.feet_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "feet_item_equiped": 0 });
                    break;
                case "lefthand":
                    if (user_data.lefthand_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.lefthand_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "lefthand_item_equiped": 0 });
                    break;
                case "righthand":
                    if (user_data.righthand_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.righthand_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "righthand_item_equiped": 0 });
                    break;
                case "head":
                    if (user_data.head_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.head_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "head_item_equiped": 0 });
                    break;
                case "thorax":
                    if (user_data.thorax_item_equiped !== 0) {
                        InventoryService.create(user_id, user_data.thorax_item_equiped);
                    }
                    this.userRepo.update({ id: user_id }, { "thorax_item_equiped": 0 });
                    break;
            }
        } else {
            throw Error("Wrong slot");
        }
    }
}