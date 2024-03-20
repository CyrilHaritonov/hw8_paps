import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { CasinoService } from "../services/casino.service";
import { ItemService } from "../services/item.service";

export const casinoScene = new Scenes.BaseScene<IBotContext>("casino");

casinoScene.enter(async ctx => {
    console.log("inside casino");

    const games = await CasinoService.getGames();

    let game_num = -1;

    ctx.reply("Есть следующие игры:" + games.map((game, index) => "\n" + (index + 1) + ". " + game.name) + "\nВведите номер игры, в которую вы хотели бы поиграть",
        Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_menu")]));

    casinoScene.on("text", async ctx => {
        const num = parseInt(ctx.message.text);
        if (num <= games.length && num > 0) {
            const prizes: string[] = [];
            for (let prize of games[num - 1].prizes) {
                if (prize === 0) {
                    prizes.push("Ничего");
                } else {
                    prizes.push((await ItemService.getItem(prize)).name);
                }
            }
            game_num = num - 1;
            ctx.reply("Информация о игре: \n" + games[num - 1].name + "\nЦена участия:" + games[num - 1].price + "\nВозможные призы: " +
                prizes.filter(value => value !== "Ничего").join(", "),
                Markup.inlineKeyboard([Markup.button.callback("Играть", "play"), Markup.button.callback("Вернуться к списку", "back")]));
        } else {
            ctx.reply("Неверный номер игры, попробуйте снова", Markup.inlineKeyboard([Markup.button.callback("Вернуться к списку", "back")]));
        }
    });

    casinoScene.action("back", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("casino");
    });

    casinoScene.action("back_to_menu", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("menu");
    });

    casinoScene.action("play", async ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        if (game_num === -1) {
            return;
        }
        let result = await CasinoService.play(games[game_num].id, ctx.from.id);

        ctx.replyWithPhoto(games[game_num].pictures[result], {
            caption: "Ваш результат: " + games[game_num].outcomes[result]
                + "\nВы выиграли: " + (games[game_num].prizes[result] !== 0 ? (await ItemService.getItem(games[game_num].prizes[result])).name : "Ничего"),
            reply_markup: { inline_keyboard: [[{ text: "Сыграть ещё", callback_data: "play" }, { text: "Вернуться", callback_data: "back" }]] }
        });
    });
});