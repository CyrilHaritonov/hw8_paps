import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { AvatarsService } from "../services/avatars.service";

export const manageAvatarScene = new Scenes.BaseScene<IBotContext>("manage_avatars");

manageAvatarScene.enter(async ctx => {
    console.log("inside create avatar");

    const avatars = await AvatarsService.getAllAvatars();

    ctx.reply("Введите номер аватарки, чтобы ее удалить или отправьте фото, чтобы добавить его в аватарки",
        Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));

    if (avatars.length > 0) {
        ctx.replyWithMediaGroup(avatars.map((avatar, index) => { return { type: "photo", media: avatar, caption: index.toString() } }));
    }

    manageAvatarScene.on('text', ctx => {
        const num = parseInt(ctx.message.text);
        console.log(num);
        if (!(num >= 0 && num < avatars.length)) {
            ctx.reply("Неверный номер аватарки", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
            return;
        }
        AvatarsService.delete(avatars[num]);
        ctx.reply("Аватар успешно удалён!", Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
    });

    manageAvatarScene.on("photo", ctx => {
        const photo = ctx.message.photo;
        AvatarsService.create(photo[1].file_id);
        ctx.reply("Аватар добавлен в коллекцию",
            Markup.inlineKeyboard([Markup.button.callback("Вернуться", "open_admin")]));
    });

    manageAvatarScene.action("open_admin", ctx => {
        ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        ctx.scene.leave();
        ctx.scene.enter("admin");
    });
});