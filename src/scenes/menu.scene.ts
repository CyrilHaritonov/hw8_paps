import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";
import { IBotContext } from "../context/context.interface";
import { InventoryService } from "../services/inventory.service";
import { ItemService } from "../services/item.service";

export const menuScene = new Scenes.BaseScene<IBotContext>("menu");

type InventoryDisplayed = {
    name: string
}

menuScene.enter(async (ctx) => {

    console.log("inside menu");
    const inlineKeyboard = [
        Markup.button.callback('Инвентарь', 'inventory'),
        Markup.button.callback('Биржа', 'player_market'),
        Markup.button.callback('Магазин', 'shop'),
        Markup.button.callback('Казино', 'casino')
    ];

    if (!ctx.from) {
        return;
    }

    if (await UserService.checkIfAdmin(ctx.from.id)) {
        inlineKeyboard.push(Markup.button.callback('Админ-панель', 'admin-dashboard'));
    }

    const userData = await UserService.getUserInfo(ctx.from.id);

    const message = await ctx.replyWithHTML(`<b>${escapeHtml(userData.char_name)}</b>, персонаж класса <b>${escapeHtml(userData.char_class)}</b>,\nЯвляется админом: ${escapeHtml(userData.is_admin ? "Да" : "Нет")}`, Markup.inlineKeyboard(inlineKeyboard));

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

        ctx.reply(`В инвентаре содержится: ${inventory_displayed.map(item => "\n" + item.name)}`, Markup.inlineKeyboard([Markup.button.callback("Вернуться в меню", "open_menu")]));
    });

    menuScene.action("open_menu", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("menu");
    });
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