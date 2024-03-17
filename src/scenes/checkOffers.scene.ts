import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { MarketService } from "../services/market.service";
import { Market } from "../entity/Market";

export const checkOffersScene = new Scenes.BaseScene<IBotContext>('check_offers');

checkOffersScene.enter(ctx => {

    console.log("inside check offers");

    ctx.reply('Введите название предмета:');

    let offers: Market[] = [];

    let formState = {
        item: ''
    };

    checkOffersScene.on('text', async ctx => {

        if (formState.item === '') {
            offers = await MarketService.findOffersWithItem(ctx.message.text);

            formState.item = ctx.message.text;

            ctx.reply("Есть следующие предложения:" + offers.map((offer, index) => "\n" + (index + 1)
                + '. Цена в деньгах: ' + offer.price + " Продавец: " + offer.owner_id)
                + "\n Введите номер предложения, которое вы хотите купить, либо начните поиск заново",
                Markup.inlineKeyboard([Markup.button.callback('Искать снова', 'search'), Markup.button.callback('Вернуться назад', 'back_to_market')]));
        } else {
            const num = parseInt(ctx.message.text);

            if (offers.length > 0 && num <= offers.length && num > 0) {
                if (await MarketService.buyOffer(ctx.from.id, offers[num - 1].id)) {
                    ctx.reply("Предмет успешно куплен!",
                        Markup.inlineKeyboard([Markup.button.callback('Искать снова', 'search'), Markup.button.callback('Вернуться назад', 'back_to_market')]));
                }
            } else {
                ctx.reply("Неверный номер предложения. Введите число заново:",
                    Markup.inlineKeyboard([Markup.button.callback('Искать снова', 'search'), Markup.button.callback('Вернуться назад', 'back_to_market')]));
            }
            formState.item = '';
        }
    });

    checkOffersScene.action('search', ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        formState.item = '';
        ctx.scene.leave();
        ctx.scene.enter("check_offers");
    });

    checkOffersScene.action('back_to_market', ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("market");
    });
});