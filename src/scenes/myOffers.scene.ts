import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { MarketService } from "../services/market.service";
import { ItemService } from "../services/item.service";

export const myOffersScene = new Scenes.BaseScene<IBotContext>("my_offers");

myOffersScene.enter(async ctx => {

    console.log("inside my offers");

    if (!ctx.from) {
        return;
    }

    const offers = await MarketService.checkUsersOffers(ctx.from.id);

    let names: string[] = [];
    for (let offer of offers) {
        names.push((await ItemService.getItem(offer.item_id)).name)
    }

    ctx.reply("Предложения выставленные вами:" + offers.map((offer, index) =>
        "\n" + (index + 1) + ". " + names[index] + " Цена в деньгах: " + offer.price)
        + "\n Чтобы удалить, какое-либо из предложений введите его номер:", Markup.inlineKeyboard([Markup.button.callback('Вернуться', 'back_to_market')]));

    myOffersScene.on('text', async ctx => {
        const num = parseInt(ctx.message.text);

        if (num <= offers.length && num > 0) {
            if (await MarketService.delete(offers[num - 1].id)) {
                ctx.reply("Предлоежние успешно удалено!",
                    Markup.inlineKeyboard([Markup.button.callback('Вернуться назад', 'back_to_market')]));
            }
        } else {
            ctx.reply("Неверный номер предложения. Введите число заново:",
                Markup.inlineKeyboard([Markup.button.callback('Вернуться назад', 'back_to_market')]));
        }
    });

    myOffersScene.action('back_to_market', ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("market");
    });
});
