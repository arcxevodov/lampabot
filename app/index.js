import 'dotenv/config'

import * as BotFunctions from './modules/functions.js'

import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

const bot = new Telegraf(process.env.TOKEN)

bot.command('rating', async ctx => {
    BotFunctions.getRating(ctx)
})

bot.command('yesno', async ctx => {
    BotFunctions.getYesNo(ctx)
})

bot.on(message('text'), async ctx => {
    if (BotFunctions.badCheck(ctx.message.text))
        BotFunctions.addScore(ctx, ctx.message)
    if (BotFunctions.checkArtur(ctx))
        ctx => sendSticker("CAACAgIAAxkBAAEKOopk90UVmZTFWjBucc--Zx9wIVPKmwAC4jYAAsMQwUtQK9WQhyLA3DAE")

})

bot.on('edited_message', async ctx => {
    if (BotFunctions.badCheck(ctx.update.edited_message.text))
        BotFunctions.addScore(ctx, ctx.update.edited_message)
})

bot.on('voice', async ctx => {
    BotFunctions.voiceCheck(ctx)
})

bot.launch().then(() => console.log('\nДо встречи!'))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))