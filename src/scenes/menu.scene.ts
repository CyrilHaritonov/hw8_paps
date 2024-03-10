import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";
import { IBotContext } from "../context/context.interface";

export const menuScene = new Scenes.BaseScene<IBotContext>("menu");

menuScene.enter(async (ctx) => {

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

    ctx.replyWithHTML(`<b>${escapeHtml(userData.char_name)}</b>, персонаж класса <b>${escapeHtml(userData.char_class)}</b>,\nЯвляется админом: ${escapeHtml(userData.is_admin ? "Да" : "Нет")}`, Markup.inlineKeyboard(inlineKeyboard));


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