import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { UserService } from "../services/user.service";

export const walkScene = new Scenes.BaseScene<IBotContext>("walk");

const walks = [
    { name: "Forest", reward: 100, description: "You had a refreshing walk in the forest." },
    { name: "Beach", reward: 150, description: "The sound of waves calmed your spirit." },
    { name: "Mountain", reward: 200, description: "The view from the top was breathtaking." },
];


walkScene.enter(async (ctx) => {
    if (!ctx.from) return;

    const user = await UserService.getUserInfo(ctx.from.id); 
    if (!user) {
        await ctx.reply("User not found.");
        return;
    }

    if (user.last_walk && new Date().getTime() - user.last_walk.getTime() < 2 * 60 * 60 * 1000) {
        await ctx.reply("You need to rest before going on another walk. Try again later.");
        return;
    }

    await ctx.reply(
        "Choose your walking destination:",
        Markup.inlineKeyboard(
            walks.map(walk => Markup.button.callback(walk.name, `walk_${walk.name}`)),
            { columns: 2 }
        )
    );
});

walkScene.action(/^walk_(.+)$/, async (ctx) => {
    if (!ctx.match || !ctx.from) return;

    const walkName = ctx.match[1];
    const walkOption = walks.find(walk => walk.name === walkName);
    if (!walkOption) {
        await ctx.reply("Invalid destination.");
        return;
    }

    await UserService.updateUserWalk(ctx.from.id, new Date()); 

    setTimeout(async () => {
        await ctx.reply(`${walkOption.description} You found ${walkOption.reward} coins!`);
        
    }, 5000);

    await ctx.scene.leave();
});
