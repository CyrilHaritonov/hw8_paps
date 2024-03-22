import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";
import { IBotContext } from "../context/context.interface";
import { InventoryService } from "../services/inventory.service";
import { ItemService } from "../services/item.service";

export const menuScene = new Scenes.BaseScene<IBotContext>("menu");

export type InventoryDisplayed = {
    name: string
}

menuScene.enter(async (ctx) => {

    console.log("inside menu");
    const inlineKeyboard = [
        [Markup.button.callback('Инвентарь', 'inventory'),
        Markup.button.callback('Рынок', 'market'),
        Markup.button.callback('Магазин', 'shop')],
        [Markup.button.callback('Казино', 'casino'),
        Markup.button.callback('Экипировка', 'equipment'),
        Markup.button.callback('Сад', 'garden')]
    ];

    if (!ctx.from) {
        return;
    }

    if (!await UserService.checkIfExists(ctx.from.id)) {
        ctx.scene.leave();
        ctx.scene.enter("greeting");
    } else {

        if (await UserService.checkIfAdmin(ctx.from.id)) {
            inlineKeyboard[1].push(Markup.button.callback('Админ-панель', 'admin-dashboard'));
        }

        const userData = await UserService.getUserInfo(ctx.from.id);

        ctx.replyWithPhoto(userData.avatar, {
            caption: `<b>${escapeHtml(userData.char_name)}</b>, ${userData.level} уровень, персонаж класса ${escapeHtml(userData.char_class)},\nНа счету ${userData.money} денег и ${userData.rm_currency} золота`,
            reply_markup: { inline_keyboard: inlineKeyboard 
            }, parse_mode: "HTML"
        });

        menuScene.action('admin-dashboard', async ctx => {
            if (!await UserService.checkIfAdmin(ctx.from.id)) {
                return;
            }
            ctx.scene.leave();
            ctx.scene.enter('admin');
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        });

        menuScene.action('inventory', async ctx => {
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });

            const inventory = await InventoryService.getInventory(ctx.from.id);

            const inventory_displayed: InventoryDisplayed[] = [];

            for (let item of inventory) {
                inventory_displayed.push({ name: (await ItemService.getItem(item.item_id)).name });
            }

            ctx.reply(`В инвентаре содержится: ${inventory_displayed.map((item, index) => "\n" + (index + 1) + ". " + item.name)}`, Markup.inlineKeyboard([Markup.button.callback("Вернуться в меню", "open_menu")]));
        });

        menuScene.action("open_menu", ctx => {
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            ctx.scene.leave();
            ctx.scene.enter("menu");
        });

        menuScene.action("shop", ctx => {
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            ctx.scene.leave();
            ctx.scene.enter("shop");
        });

        menuScene.action("market", ctx => {
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            ctx.scene.leave();
            ctx.scene.enter("market");
        });

        menuScene.action("casino", ctx => {
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            ctx.scene.leave();
            ctx.scene.enter("casino");
        });

        menuScene.action("equipment", ctx => {
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            ctx.scene.leave();
            ctx.scene.enter("equipment");
        });

        menuScene.action("garden", ctx => {
            ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            ctx.scene.leave();
            ctx.scene.enter("garden");
        });
    }
})

function escapeHtml(html: string) {
    return html.replace(/[&<>"']/g, function (match) {
        switch (match) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&#39;';
            default:
                return match;
        }
    });
}