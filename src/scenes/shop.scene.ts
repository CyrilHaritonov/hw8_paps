import { IBotContext } from "../context/context.interface";
import { Shop } from "../entity/Shop";
import { ShopService } from "../services/shop.service";
import { ItemService } from "../services/item.service";
import { Markup, Scenes } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export const shopScene = new Scenes.BaseScene<IBotContext>("shop");

export type OffersDisplayed = {
    id: number,
    name: string,
    price: number,
    rm_price: number,
    description: string,
    picture: string,
    slot: string,
    power: number,
    currency_type: string
}

shopScene.enter(async ctx => {
    const offers: Shop[] = await ShopService.getOffers();

    console.log('inside shop');

    const offers_displayed: OffersDisplayed[] = [];

    for (let offer of offers) {
        const item = await ItemService.getItem(offer.item_id);
        offers_displayed.push({
            id: offer.id,
            name: item.name,
            price: offer.price,
            rm_price: offer.rm_price,
            description: item.description,
            picture: item.picture,
            slot: item.slot,
            power: item.power,
            currency_type: offer.currency_type
        });
    }

    ctx.reply(`Есть следующие предложения: ${offers_displayed.map((item, index) => "\n" + (index + 1) + ". " + item.name + ", сила: " + item.power + ", цены: " + item.price + " денег, " + item.rm_price + " золота") + "\n Чтобы посмотреть нужное предложение подробнее введите его номер"}`, Markup.inlineKeyboard([Markup.button.callback("Вернуться в меню", "open_menu")]));

    shopScene.on("text", ctx => {
        const num = parseInt(ctx.message.text);
        if (num > 0 && num <= offers_displayed.length) {
            const inline_keyboard: InlineKeyboardMarkup = {inline_keyboard: [[{ text: 'Назад', callback_data: 'shop' }]]};
            if (offers_displayed[num - 1].currency_type === "both") {
                inline_keyboard.inline_keyboard.unshift([{ text: 'Купить за деньги', callback_data: 'buy_with_money' }], [{ text: 'Купить за золото', callback_data: 'buy_with_rm_currency' }]);
            } else if (offers_displayed[num - 1].currency_type === "money") {
                inline_keyboard.inline_keyboard.unshift([{ text: 'Купить за деньги', callback_data: 'buy_with_money' }]);
            } else if (offers_displayed[num - 1].currency_type === "rm_currency") {
                inline_keyboard.inline_keyboard.unshift([{ text: 'Купить за золото', callback_data: 'buy_with_rm_currency' }]);
            }
            ctx.replyWithPhoto({ url: offers_displayed[num - 1].picture }, { reply_markup: inline_keyboard, caption: "Информация о предмете:\nНазвание: "
             + offers_displayed[num - 1].name + ",\nСила: " + offers_displayed[num - 1].power + ",\nЦены: " + offers_displayed[num - 1].price 
             + " " + offers_displayed[num - 1].rm_price + ",\nНадевается в слот: " + offers_displayed[num - 1].slot + "\nОписание: " 
             + offers_displayed[num - 1].description });
        } else {
            ctx.reply("Неправильный номер предложения, попробуйте снова.");
        }
        shopScene.action("buy_with_money", ctx => {
            ctx.editMessageReplyMarkup({inline_keyboard: []});
            ShopService.buyOfferWithMoney(offers_displayed[num - 1].id, ctx.from.id);
            ctx.reply("Предмет куплен", Markup.inlineKeyboard([Markup.button.callback("Вернуться к списку", "shop")]));
        });
        shopScene.action("buy_with_rm_currency", ctx => {
            ctx.editMessageReplyMarkup({inline_keyboard: []});
            ShopService.buyOfferWithRMCurrency(offers_displayed[num - 1].id, ctx.from.id);
            ctx.reply("Предмет куплен", Markup.inlineKeyboard([Markup.button.callback("Вернуться к списку", "shop")]));
        });
    });

    shopScene.action("open_menu", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("menu");
    });

    shopScene.action("shop", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("shop");
    });
});