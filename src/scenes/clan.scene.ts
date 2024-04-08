import { Markup, Scenes } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { UserService } from "../services/user.service";
import { ClanService } from "../services/clan.service";

export const clanScene = new Scenes.BaseScene<IBotContext>("clan");

clanScene.enter(ctx => {
    console.log("inside clan");
    displayClan(ctx)
});

const displayClan = async (ctx: IBotContext) => {
    if (!ctx.from) {
        return;
    }
    console.log("inside clan before reload");
    await ClanService.updateClanLevels()
    const clanDetails = await UserService.checkForClan(ctx.from.id);
    if (!clanDetails) {
        return;
    }
    if (clanDetails.isInClan && clanDetails.clanDetails) {
        const isAdmin = ctx.from.id === clanDetails.clanDetails?.administrator.id;
        let text = `👑${clanDetails.clanDetails.name}\n\n📜${clanDetails.clanDetails.description}\n👊🏻Сила клана:${clanDetails.clanDetails.level}`;
        text += isAdmin ? "\nВы администратор" : "";
        const keyboard = [];

        if (isAdmin) {
            keyboard.push([Markup.button.callback('Управление', 'manage_clan')]);
        }

        keyboard.push(
            [Markup.button.callback('Участники', 'view_members'), Markup.button.callback('Покинуть', 'leave_clan_check')],
            [Markup.button.callback('Лучшие кланы', 'leaderboard'), Markup.button.callback('Вернуться', 'back_to_menu')]
        );

        ctx.reply(text, Markup.inlineKeyboard(keyboard));
    } else {
        let text = "Вы пока не состоите в клане!\n";
        const keyboard = [];
        keyboard.push(
            [Markup.button.callback('Создать клан', 'create_clan'), Markup.button.callback('Лучшие кланы', 'leaderboard')],
            [Markup.button.callback('Назад', 'back_to_menu')]
        );

        ctx.reply(text, Markup.inlineKeyboard(keyboard));
    }
}


clanScene.action('create_clan', async ctx => {
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.scene.leave();
    ctx.scene.enter("create_clan");
});

clanScene.action('view_members', async (ctx) => {
    const page = 1; 
    await displayMembersPage(ctx, page);
});

const ITEMS_PER_PAGE = 5;

const displayMembersPage = async (ctx: IBotContext, page: number) => {
    if (!ctx.from) {
        return;
    }
    const clanDetails = await UserService.checkForClan(ctx.from.id);
    if (!clanDetails || !clanDetails.clanDetails) {
        return;
    }
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const members = await ClanService.getClanMembers(clanDetails.clanDetails.id, offset, ITEMS_PER_PAGE + 1);
    let text = `Список участников клана\nСтраница ${page}\n\n`;

    const memberButtons = members.slice(0, ITEMS_PER_PAGE).map(member =>
        Markup.button.callback(`🐶 ${member.char_name}`, 'noop')
    );

    const memberButtonsInline = memberButtons.map(button => [button]);

    const navigationButtons = [];
    if (page > 1) {
        navigationButtons.push(Markup.button.callback('⬅️', `view_members_prev_${page - 1}`));
    }
    if (members.length > ITEMS_PER_PAGE) {
        navigationButtons.push(Markup.button.callback('➡️', `view_members_next_${page + 1}`));
    }
    navigationButtons.push(Markup.button.callback('Назад', 'back_to_menu'));

    
    const allButtonsInline = [
        ...memberButtonsInline,
        navigationButtons
    ];

    ctx.editMessageText(text, Markup.inlineKeyboard(allButtonsInline));
};

clanScene.action(/view_members_next_(.+)/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await displayMembersPage(ctx, page);
});

clanScene.action(/view_members_prev_(.+)/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await displayMembersPage(ctx, page);
});

clanScene.action('back_to_menu', ctx => {
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.scene.leave();
    ctx.scene.enter("fortress");
});

clanScene.action('leave_clan_check', async ctx => {
    const buttons = [];
    buttons.push(Markup.button.callback('Да', 'leave_clan'));
    buttons.push(Markup.button.callback('Нет', 'back_to_menu'));
    ctx.editMessageText("Вы уверены, что хотите покинуть клан?", Markup.inlineKeyboard([buttons])); 
});

clanScene.action('leave_clan', async ctx => {
    if (!ctx.from) {
        return ctx.reply("Не удалось определить пользователя.");
    }
    
    try {
        await ClanService.leaveClan(ctx.from.id);
        ctx.reply("Вы успешно покинули клан.");
    } catch (error) {
        console.error(error);
        ctx.reply("Произошла ошибка при попытке покинуть клан.");
    }

    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.scene.leave();
    ctx.scene.enter("fortress"); 
});


clanScene.action('manage_clan', async ctx => {
    const page = 1; 
    await displayMembersForAdmin(ctx, page);
});

const displayMembersForAdmin = async (ctx: IBotContext, page: number) => {
    if (!ctx.from) {
        return;
    }
    const clanDetails = await UserService.checkForClan(ctx.from.id);
    if (!clanDetails || !clanDetails.clanDetails) {
        return;
    }
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const members = await ClanService.getClanMembers(clanDetails.clanDetails.id, offset, ITEMS_PER_PAGE + 1);
    let text = `Список участников клана\nСтраница ${page}\n\n`;

  
    const memberButtons = members.slice(0, ITEMS_PER_PAGE).map(member =>
        Markup.button.callback(`🐶 ${member.char_name}`, `member_${member.id}`)
    );

  
    const memberButtonsInline = memberButtons.map(button => [button]); 


    const navigationButtons = [];
    if (page > 1) {
        navigationButtons.push(Markup.button.callback('⬅️', `view_members_admin_prev_${page - 1}`));
    }
    if (members.length > ITEMS_PER_PAGE) {
        navigationButtons.push(Markup.button.callback('➡️',  `view_members_admin_next_${page + 1}`));
    }
    navigationButtons.push(Markup.button.callback('Назад', 'back_to_menu'));


    const allButtonsInline = [
        ...memberButtonsInline, 
        navigationButtons 
    ];

    ctx.editMessageText(text, Markup.inlineKeyboard(allButtonsInline));
};

clanScene.action(/view_members_admin_next_(.+)/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await displayMembersForAdmin(ctx, page);
});

clanScene.action(/view_members_admin_prev_(.+)/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await displayMembersForAdmin(ctx, page);
});

clanScene.action(/^member_(.+)$/, async (ctx) => {
    const memberId = ctx.match[1];
    const text = "Выберите действие:";
    const buttons = [
        Markup.button.callback('Исключить', `exclude_${memberId}`),
        Markup.button.callback('Передать полномочия', `transfer_authority_${memberId}`)
    ];
    await ctx.editMessageText(text, Markup.inlineKeyboard(buttons));
});


clanScene.action(/^exclude_(.+)$/, async (ctx) => {
    const memberId = ctx.match[1];

    try {
        await ClanService.excludeUser(Number(memberId))
        ctx.reply("Вы успешно исключили пользователя.");
    } catch (error) {
        console.error(error);
        ctx.reply("Произошла ошибка при попытке исключить пользователя.");
    }


    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.scene.leave();
    ctx.scene.enter("fortress"); 
});

clanScene.action(/^transfer_authority_(.+)$/, async (ctx) => {
    const memberId = ctx.match[1];

    try {
        await ClanService.makeAdmin(ctx.from.id, Number(memberId));
        ctx.reply("Вы успешно передали управление кланом.");
    } catch (error) {
        console.error(error);
        ctx.reply("Произошла ошибка.");
    }
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.scene.leave();
    ctx.scene.enter("fortress"); 
});

clanScene.action("leaderboard", async (ctx) => {
    try {
        await ClanService.updateClanLevels()
        const clans = await ClanService.getTopClans();

        let messageText = "Лучшие 10 кланов:\n\n";
        clans.forEach((clan, index) => {
            messageText += `${index + 1}. ${clan.name} - уровень: ${clan.level}\n`;
        });

        ctx.reply(messageText, Markup.inlineKeyboard([Markup.button.callback('Назад', "back_to_menu")]));

    } catch (error) {
        console.error("Failed to display leaderboard:");
    }
});