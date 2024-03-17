import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

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
        const result: User[] = await this.userRepo.findBy({id: user_id});
        if (result.length) {
            return result[0];
        } else {
            throw Error("No user with such id");
        }
    }

    static async checkMoneyBalance(user_id: number): Promise<number> {
        const result: User[] = await this.userRepo.findBy({id: user_id});
        if (result.length) {
            return result[0].money;
        } else {
            throw Error("No user with such id");
        }
    }

    static async checkRMCurrencyBalance(user_id: number): Promise<number> {
        const result: User[] = await this.userRepo.findBy({id: user_id});
        if (result.length) {
            return result[0].rm_currency;
        } else {
            throw Error("No user with such id");
        }
    }

    static payWithMoney(user_id: number, amount: number): void {
        this.userRepo.decrement({id: user_id}, "money", amount);
    }

    static payWithRMCurrency(user_id: number, amount: number): void {
        this.userRepo.decrement({id: user_id}, "rm_currency", amount);
    }

    static getMoney(user_id: number, amount: number): void {
        this.userRepo.increment({id: user_id}, "money", amount);
    }

    static getRMCurrency(user_id: number, amount: number): void {
        this.userRepo.increment({id: user_id}, "rm_currency", amount);
    }
}