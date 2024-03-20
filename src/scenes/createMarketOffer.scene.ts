import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { InventoryDisplayed } from "./menu.scene";
import { InventoryService } from "../services/inventory.service";
import { ItemService } from "../services/item.service";
import { MarketService } from "../services/market.service";

export const createMarketOfferScene = new Scenes.BaseScene<IBotContext>("create_market_offer");

createMarketOfferScene.enter(async ctx => {
    console.log("inside create market offer");

    if (!ctx.from) {
        return;
    }

    let inventory = await InventoryService.getInventory(ctx.from.id);

    let inventory_displayed: InventoryDisplayed[] = [];

    for (let item of inventory) {
        inventory_displayed.push({ name: (await ItemService.getItem(item.item_id)).name });
    }

    ctx.reply(`В инвентаре содержится: ${inventory_displayed.map((item, index) => "\n" + (index + 1) + ". " + item.name)}`,
        Markup.inlineKeyboard([Markup.button.callback("Вернуться", "back_to_market")]));

    ctx.reply("Введите номер предмета, который вы хотите выставить:");

    let stage = 0;

    createMarketOfferScene.on('text', async ctx => {
        let num = parseInt(ctx.message.text);
        let picked_item: number = 0;

        if (stage === 0) {
            if (num <= inventory.length && num > 0) {
                picked_item = num - 1;
                ctx.reply("Вы выбрали предмет " + (await ItemService.getItem(inventory[picked_item].item_id)).name + " Теперь введите цену: ",
                    Markup.inlineKeyboard([Markup.button.callback('Вернуться назад', 'back_to_market')]));
                stage = stage + 1;
            } else {
                ctx.reply("Неверный номер предложения. Введите число заново:");
            }
        } else if (stage === 1) {
            MarketService.createOffer(ctx.from.id, num, inventory[picked_item].item_id, inventory[picked_item].id);
            ctx.reply("Предложение успешно создано!", Markup.inlineKeyboard([Markup.button.callback('Вернуться назад', 'back_to_market')]));
            stage = 0;
        }
    });

    createMarketOfferScene.action('back_to_market', ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("market");
    });
});