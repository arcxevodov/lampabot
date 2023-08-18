import 'dotenv/config'

import * as BotFunctions from './modules/functions.js'

import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import * as fs from "fs";
import * as https from "https";
import axios from "axios";

const bot = new Telegraf(process.env.TOKEN)

bot.command('rating', async (ctx) => {
    let rating = await BotFunctions.getRating()
    let result = '😍 Рейтинг:\n\n🏆 ';

    rating.forEach((key, value) => {
        if (key['count'] === 0) {
            result += `${value+1}. ${key['full_name'] + ' (' + key['username'] + ')' ?? '@' + key['username']}, ангел рядом с тобой!\n\n`
        } else {
            result += `${value+1}. ${key['full_name'] + ' (' + key['username'] + ')' ?? '@' + key['username']}, от тебя ангел улетел на ${key['count']} ${BotFunctions.getNumEnding(key['count'], ['метр', 'метра', 'метров'])}\n\n`
        }
    })
    await ctx.reply(result)
})

bot.command('add_me', async (ctx) => {
    if (await BotFunctions.addMe(ctx)) {
        await ctx.reply('@' + ctx.message.from.username + ', теперь ты в системе рейтинга!')
    }
})

bot.on(message('text'), async (ctx) => {
    if (await BotFunctions.censureCheck(ctx, false)) {
        await BotFunctions.addScore(ctx, false, true)
        let score = await BotFunctions.getScore(ctx, false)
        let username = '@'+ctx.message.from.username ?? ctx.message.from.first_name
        await ctx.reply(username + `, ух ох! Ангел улетел от тебя на ${score} ${BotFunctions.getNumEnding(score, ['метр', 'метра', 'метров'])}!`)
    }
    if (await BotFunctions.goodCheck(ctx, false)) {
        await BotFunctions.addScore(ctx, false, false)
        let score = await BotFunctions.getScore(ctx, false)
        let username = '@'+ctx.message.from.username ?? ctx.message.from.first_name
        if (score === 0) {
            await ctx.reply(username + `, вау, как мило!`)
        } else {
            if (username === '@MustafaevN') {
                await ctx.reply(username + `, вау, как мило, Нариман! Ангел в тебе уже на ${score} ${BotFunctions.getNumEnding(score, ['сантиметр', 'сантиметра', 'сантиметров'])}!`)
            } else {
                await ctx.reply(username + `, вау, как мило! Ангел приблизился к тебе, и он уже на расстоянии ${score} ${BotFunctions.getNumEnding(score, ['метр', 'метра', 'метров'])}!`)
            }
        }
    }
})

bot.on('edited_message', async (ctx) => {
    if (await BotFunctions.censureCheck(ctx, true)) {
        await BotFunctions.addScore(ctx, true, true)
        let score = await BotFunctions.getScore(ctx, true)
        let username = '@'+ctx.update.edited_message.from.username ?? ctx.update.edited_message.from.first_name
        await ctx.reply(username + `, ух ох! Ангел улетел от тебя на ${score} ${BotFunctions.getNumEnding(score, ['метр', 'метра', 'метров'])}!`)
    }
    if (await BotFunctions.goodCheck(ctx, true)) {
        await BotFunctions.addScore(ctx, true, false)
        let score = await BotFunctions.getScore(ctx, true)
        let username = '@'+ctx.message.from.username ?? ctx.message.from.first_name
        if (score === 0) {
            await ctx.reply(username + `, вау, как мило!`)
        } else {
            if (username === '@MustafaevN') {
                await ctx.reply(username + `, вау, как мило, Нариман! Ангел в тебе уже на ${score} ${BotFunctions.getNumEnding(score, ['сантиметр', 'сантиметра', 'сантиметров'])}!`)
            } else {
                await ctx.reply(username + `, вау, как мило! Ангел приблизился к тебе, и он уже на расстоянии ${score} ${BotFunctions.getNumEnding(score, ['метр', 'метра', 'метров'])}!`)
            }
        }
    }
})

bot.on('voice', async (ctx) => {

    ctx.telegram.getFileLink(ctx.message.voice.file_id).then((url) => {
        const file = fs.createWriteStream(`${ctx.message.voice.file_id}.ogg`);
        https.get(url, function(response) {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log("Download Completed");
            });
        });

        setTimeout(() => {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://voice.mcs.mail.ru/asr',
                headers: {
                    'Authorization': `Bearer ${process.env.MAIL_TTS_TOKEN}`,
                    'Content-Type': 'audio/ogg; codecs=opus'
                },
                data: fs.readFileSync(`${ctx.message.voice.file_id}.ogg`)
            };

            axios.request(config)
                .then(async (response) => {
                    if (await BotFunctions.censureCheck(ctx, false, response.data['result']['texts'][0]['text'])) {
                        await BotFunctions.addScore(ctx, false, true)
                        let score = await BotFunctions.getScore(ctx, false)
                        let username = '@'+ctx.message.from.username ?? ctx.message.from.first_name
                        await ctx.reply(username + `, ух ох! Ангел улетел от тебя на ${score} ${BotFunctions.getNumEnding(score, ['метр', 'метра', 'метров'])}!`)
                    }
                    if (await BotFunctions.goodCheck(ctx, false, response.data['result']['texts'][0]['text'])) {
                        await BotFunctions.addScore(ctx, false, false)
                        let score = await BotFunctions.getScore(ctx, false)
                        let username = '@'+ctx.message.from.username ?? ctx.message.from.first_name
                        if (score === 0) {
                            await ctx.reply(username + `, вау, как мило!`)
                        } else {
                            if (username === '@MustafaevN') {
                                await ctx.reply(username + `, вау, как мило, Нариман! Ангел в тебе уже на ${score} ${BotFunctions.getNumEnding(score, ['сантиметр', 'сантиметра', 'сантиметров'])}!`)
                            } else {
                                await ctx.reply(username + `, вау, как мило! Ангел приблизился к тебе, и он уже на расстоянии ${score} ${BotFunctions.getNumEnding(score, ['метр', 'метра', 'метров'])}!`)
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }, 1000)
    }).catch((err) => {
        console.log(err)
    })
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))