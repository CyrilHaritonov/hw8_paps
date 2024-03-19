import { Markup, Scenes } from "telegraf";
import { UserService } from "../services/user.service";
import { IBotContext } from "../context/context.interface";
import { AvatarsService } from "../services/avatars.service";

export const greetingScene = new Scenes.BaseScene<IBotContext>("greeting");

greetingScene.enter(async (ctx) => {

    console.log("inside greeting")
    const formState = {
        stage: 0,
        char_name: '',
        char_class: '',
        avatar: '',
        id: 0
    }

    if (ctx.from && await UserService.checkIfExists(ctx.from.id)) {
        ctx.reply('Такой пользователь уже существует');
        ctx.scene.leave();
        ctx.scene.enter("menu");
        return;
    }

    const avatars = await AvatarsService.getAllAvatars();

    ctx.reply("Введите имя своего персонажа");

    greetingScene.on('text', (ctx) => {
        const typedText = ctx.message.text;
        switch (formState.stage) {
            case 0:
                // TODO: проверки на правильность введенного имени
                formState.char_name = typedText;
                formState.id = ctx.from.id;
                formState.stage++;
                ctx.reply("Выберите класс вашего персонажа",
                    Markup.keyboard([
                        Markup.button.callback('Воин', 'class1'),
                        Markup.button.callback('Маг', 'class2'),
                        Markup.button.callback('Танк', 'class3')]).resize().oneTime()
                );
                break;
            case 1:
                // TODO: проверки на правильность введенного класса
                formState.char_class = ctx.message.text;
                formState.stage++;
                ctx.replyWithMediaGroup(avatars.map(link => { return { type: "photo", media: link } }));
                ctx.reply("Введите номер вашей аватарки");
                break;
            case 2:
                const num = parseInt(ctx.message.text);
                if (!(num > 0 && num <= avatars.length)) {
                    ctx.reply("Неправильный номер аватара, попробуйте ещё");
                    break;
                }
                formState.avatar = avatars[num - 1];
                UserService.create(formState.id, formState.char_name, formState.char_class, formState.avatar);
                formState.stage = 0;
                ctx.reply("Ваш персонаж был успешно создан!");
                ctx.scene.leave()
                setTimeout(() => {
                    ctx.scene.enter("menu");
                }, 1000);
                break;
        }
    });

});