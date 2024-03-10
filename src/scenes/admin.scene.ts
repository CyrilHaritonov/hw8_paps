import { IBotContext } from "../context/context.interface";
import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";
import { ItemService } from "../services/item.service";
import { InventoryService } from "../services/inventory.service";

export const adminScene = new Scenes.BaseScene<IBotContext>("admin");

adminScene.enter(async (ctx) => {
    console.log("inside admin");
    const inlineKeyboard = [
        Markup.button.callback('Создать предмет', 'create_item'),
        Markup.button.callback('Вернуться в меню', 'back_to_menu'),
        Markup.button.callback('Выдать предмет пользователю', 'give_item_to_user')
    ];

    if (!ctx.from) {
        return;
    }

    if (!await UserService.checkIfAdmin(ctx.from.id)) {
        return;
    }

    const message = await ctx.reply("Вы находитесь в панели администратора", Markup.inlineKeyboard(inlineKeyboard));

    adminScene.action("create_item", ctx => {
        const formState = {
            stage: 0,
            item_name: '',
            price: 0,
            rm_price: 0,
        }

        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.reply("Введите название нового предмета");
        adminScene.on('text', ctx => {
            const text = ctx.message.text;
            // TODO: проверки корректного ввода
            switch (formState.stage) {
                case 0:
                    formState.item_name = text;
                    formState.stage++;
                    ctx.reply("Введите цену предмета за внутриигровую валюту");
                    break;
                case 1:
                    formState.price = parseInt(text);
                    formState.stage++;
                    ctx.reply("Введите цену предмета за донатную валюту");
                    break;
                case 2:
                    formState.rm_price = parseInt(text);
                    formState.stage = 0;
                    ItemService.create(formState.item_name, formState.price, formState.rm_price);
                    ctx.reply("Предмет успешно создан!", Markup.inlineKeyboard([Markup.button.callback("Вернуться в админ-панель", "open_admin")]))
            }
        });
    });

    adminScene.action("give_item_to_user", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.reply("Введите id нужного пользователя");
        const formState = {
            user_id: 0,
            item_id: 0,
            stage: 0
        }

        adminScene.on('text', ctx => {
            // TODO: проверки корректности ввода
            const text = ctx.message.text;
            switch(formState.stage) {
                case 0:
                    formState.user_id = parseInt(text);
                    formState.stage++;
                    ctx.reply("Введите id нужного предмета!");
                    break;
                case 1:
                    formState.item_id = parseInt(text);
                    formState.stage = 0;
                    InventoryService.create(formState.user_id, formState.item_id);
                    ctx.reply("Предмет успешно добавлен пользователю!", Markup.inlineKeyboard([Markup.button.callback("Вернуться в админ-панель", "open_admin")]));
            }
        });
    });

    adminScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });

    adminScene.action("back_to_menu", ctx => {
        ctx.editMessageReplyMarkup({inline_keyboard: []});
        ctx.scene.leave();
        ctx.scene.enter("menu");
    })
})