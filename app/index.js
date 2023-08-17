import 'dotenv/config'

import * as BotFunctions from './modules/functions.js'

import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

const bot = new Telegraf(process.env.TOKEN)

function getNumEnding(number, endingArray) {
    number = number % 100;
    let ending = '';
    if (number >= 11 && number <= 19) {
        ending = endingArray[2];
    } else {
        let i = number % 10;
        switch (i)
        {
            case (1): ending = endingArray[0]; break;
            case (2):
            case (3):
            case (4): ending = endingArray[1]; break;
            default: ending = endingArray[2];
        }
    }
    return ending;
}

bot.on(message('text'), async (ctx) => {
    if (await BotFunctions.censureCheck(ctx)) {
        BotFunctions.addScore(ctx)
        let score = await BotFunctions.getScore(ctx);
        ctx.reply(`Ох! Кажись ангел улетел от тебя уже на ${score} ${getNumEnding(score, ['метр', 'метра', 'метров'])}!`);
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))