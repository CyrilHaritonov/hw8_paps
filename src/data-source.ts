import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { ConfigService } from "./config/config.service"

const configService = new ConfigService();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: configService.get("host"),
    port: parseInt(configService.get("port")),
    username: configService.get("username"),
    password: configService.get("password"),
    database: configService.get("database"),
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
