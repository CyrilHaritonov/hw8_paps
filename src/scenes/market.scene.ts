import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";

export const marketScene = new Scenes.BaseScene<IBotContext>("market");

marketScene.enter(ctx => {

    console.log("inside market");

    ctx.reply("На рынке игроки могут торговать предметами с друг-другом, выберите интересующую вас опцию.",
        Markup.inlineKeyboard([[
            Markup.button.callback('Посмотреть предложения', 'check_offers'),
            Markup.button.callback('Создать предложение', 'create_market_offer')],
        [
            Markup.button.callback('Мои предложения', 'my_offers'),
            Markup.button.callback('Вернуться', 'back_to_menu')]]));

    marketScene.action('check_offers', ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("check_offers");
    });

    marketScene.action('my_offers', ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("my_offers");
    });

    marketScene.action('create_market_offer', ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("create_market_offer");
    });

    marketScene.action('back_to_menu', ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("menu");
    });
});