import 'dotenv/config'

import * as BotFunctions from './modules/functions.js'

import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

const bot = new Telegraf(process.env.TOKEN)

bot.command('rating', async (ctx) => {
    let rating = await BotFunctions.getRating()
    let result = '😍 Рейтинг:\n\n🏆 ';

    rating.forEach((key, value) => {
        result += `${value+1}. ${key['full_name'] + ' (' + key['username'] + ')' ?? '@' + key['username']}, от тебя ангел улетел на ${key['count']} ${BotFunctions.getNumEnding(key['count'], ['метр', 'метра', 'метров'])}\n\n`
    })
    await ctx.reply(result)
})

bot.command('add_me', async (ctx) => {
    if (await BotFunctions.addMe(ctx)) {
        await ctx.reply('@' + ctx.message.from.username + ', теперь ты в системе рейтинга!')
    }
})

bot.on(message('text'), async (ctx) => {
    if (await BotFunctions.censureCheck(ctx)) {
        await BotFunctions.addScore(ctx)
        let score = await BotFunctions.getScore(ctx)
        let username = '@'+ctx.message.from.username ?? ctx.message.from.first_name
        await ctx.reply(username + `, ух ох! Ангел улетел от тебя на ${score} ${BotFunctions.getNumEnding(score, ['метр', 'метра', 'метров'])}!`)
    }
})

bot.on('edited_message', async (ctx) => {
    if (await BotFunctions.censureCheck(ctx, true)) {
        await BotFunctions.addScore(ctx, true)
        let score = await BotFunctions.getScore(ctx, true)
        let username = '@'+ctx.update.edited_message.from.username ?? ctx.update.edited_message.from.first_name
        await ctx.reply(username + `, ух ох! Ангел улетел от тебя на ${score} ${BotFunctions.getNumEnding(score, ['метр', 'метра', 'метров'])}!`)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))