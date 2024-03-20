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

    ctx.reply("Введите имя своего персонажа (от 3 до до 15 символов)");

    greetingScene.on('text', (ctx) => {
        const typedText = ctx.message.text;
        switch (formState.stage) {
            case 0:
                if (typedText.length < 3 || typedText.length > 15) {
                    ctx.reply("Неправильная длина имени, попробуйте ещё");
                    break;
                }
                formState.char_name = typedText;
                formState.id = ctx.from.id;
                formState.stage++;
                ctx.reply("Выберите класс вашего персонажа",
                    Markup.inlineKeyboard([
                        Markup.button.callback('Воин', 'warrior'),
                        Markup.button.callback('Маг', 'mage'),
                        Markup.button.callback('Танк', 'tank')])
                );
                break;
            case 1:
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

    function outputAvatars() {
        ctx.replyWithMediaGroup(avatars.map(link => { return { type: "photo", media: link } }));
        ctx.reply("Введите номер вашей аватарки");
    }

    greetingScene.action("warrior", ctx => {
        formState.char_class = "warrior";
        outputAvatars();
    });

    greetingScene.action("mage", ctx => {
        formState.char_class = "mage";
        outputAvatars();
    });

    greetingScene.action("tank", ctx => {
        formState.char_class = "tank";
        outputAvatars();
    });
});