import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { MarketService } from "../services/market.service";
import { Market } from "../entity/Market";
import { deleteMarkup } from "../lib/deleteMarkup";
import { Message } from "telegraf/typings/core/types/typegram";

export const checkOffersScene = new Scenes.BaseScene<IBotContext>('check_offers');

checkOffersScene.enter(ctx => {

    console.log("inside check offers");

    ctx.reply('Введите название предмета:');

    let offers: Market[] = [];

    let message: Message.TextMessage;

    checkOffersScene.on('text', async ctx => {

        if (offers.length === 0) {
            offers = await MarketService.findOffersWithItem(ctx.message.text);

            message = await ctx.reply("Есть следующие предложения:" + offers.map((offer, index) => "\n" + (index + 1)
                + '. Цена в деньгах: ' + offer.price + " Продавец: " + offer.owner_id)
                + "\nВведите номер предложения, которое вы хотите купить, либо начните поиск заново",
                Markup.inlineKeyboard([Markup.button.callback('Искать снова', 'search'), Markup.button.callback('Вернуться назад', 'back_to_market')]));
        } else {
            const num = parseInt(ctx.message.text);

            deleteMarkup(ctx, message.chat.id, message.message_id);

            if (offers.length > 0 && num <= offers.length && num > 0) {
                if (await MarketService.buyOffer(ctx.from.id, offers[num - 1].id)) {
                    ctx.reply("Предмет успешно куплен!",
                        Markup.inlineKeyboard([Markup.button.callback('Искать снова', 'search'), Markup.button.callback('Вернуться назад', 'back_to_market')]));
                }
            } else {
                ctx.reply("Неверный номер предложения. Введите число заново:",
                    Markup.inlineKeyboard([Markup.button.callback('Искать снова', 'search'), Markup.button.callback('Вернуться назад', 'back_to_market')]));
            }

            offers = [];
        }
    });

    checkOffersScene.action('search', ctx => {
        offers = [];
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("check_offers");
    });

    checkOffersScene.action('back_to_market', ctx => {
        offers = [];
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("market");
    });
});