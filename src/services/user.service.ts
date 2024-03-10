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
        this.userRepo.save(newUser);
    }

    static async checkIfExists(user_id: number): Promise<boolean> {
        return await this.userRepo.existsBy({ id: user_id });
    }
}