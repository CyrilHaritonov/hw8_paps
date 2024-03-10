import { Telegraf, session } from "telegraf";
import { IConfigService } from "./config/config.interface";
import { ConfigService } from "./config/config.service";
import { IBotContext } from "./context/context.interface";
import { Command } from "./commands/command.class";
import { StartCommand } from "./commands/start.command";
import "reflect-metadata";
import { AppDataSource } from "./data-source";

class Bot {
    bot: Telegraf<IBotContext>;
    commands: Command[] = [];

    constructor(private readonly configService: IConfigService) {
        this.bot = new Telegraf<IBotContext>(this.configService.get("TOKEN"));
        this.bot.use(session());
    }

    init() {
        this.commands = [new StartCommand(this.bot)]
        for (const command of this.commands) {
            command.handle();
    }
        this.bot.launch();
    }
}


const bot = new Bot(new ConfigService());
bot.init();

AppDataSource.initialize().then(() => {
        console.log("connected to db");
}).catch((error) => console.log(error));



