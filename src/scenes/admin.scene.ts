import { IBotContext } from "../context/context.interface";
import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";

export const adminScene = new Scenes.BaseScene<IBotContext>("admin");

adminScene.enter(async (ctx) => {
    console.log("inside admin");
    const inlineKeyboard = [
        Markup.button.callback('Создать предмет', 'create_item'),
        Markup.button.callback('Выдать предмет пользователю', 'give_item_to_user'),
        Markup.button.callback('Создать предложение в магазине', 'create_offer'),
        Markup.button.callback('Удалить предложение в магазине', 'delete_offer'),
        Markup.button.callback('Вернуться в меню', 'back_to_menu'),
    ];

    if (!ctx.from) {
        return;
    }

    if (!await UserService.checkIfAdmin(ctx.from.id)) {
        return;
    }

    const message = await ctx.reply("Вы находитесь в панели администратора", Markup.inlineKeyboard(inlineKeyboard));

    adminScene.action("create_item", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("create_item");
    });

    adminScene.action("give_item_to_user", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("give_item");
    });

    adminScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });

    adminScene.action("back_to_menu", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("menu");
    })

    adminScene.action("create_offer", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("create_offer");
    });

    adminScene.action("delete_offer", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("delete_offer");
    })
})