import {badRegex, getDatabase, getNumEnding, replyScore} from "./const.js";

import axios from 'axios'
import * as fs from "fs";
import * as https from "https";

export const name = 'functions'

export function badCheck(messageText) {
    return messageText.match(badRegex())
}

export function addScore(context, message) {
    let userId = message.from.id
    let username = message.from.username ?? 'Никнейм отсутствует'
    let fullName = message.from.first_name
    let db = getDatabase()
    db.get(`SELECT count FROM users WHERE id = ${userId}`, (err, row) => {
        if (err) return console.error(`Ошибка получения данных из БД: ${err.message}`)
        let query = row?.count
            ? `UPDATE users SET count = ${Math.ceil(row.count + 5)} WHERE id = ${userId}`
            : `INSERT INTO users VALUES ('${userId}', '${username}', '${fullName}', 7)`
        db.run(query, err => {
            if (err) return console.error(`Ошибка записи в БД: ${err.message}`)
            console.log('Выполнен запрос в БД')
        })
        if ((row.count + 5) % 100 === 0) {
            replyScore(context, `Треш 🤯\nТвой ангел улетел на`)
            console.log('Отправлен ответ юзеру')
        }
    })
    db.close()
    console.log(`${fullName} поругался матом!`)
}

export function getRating(context) {
    let db = getDatabase()
    db.all('SELECT * FROM users ORDER BY count', (err, rows) => {
        if (err) return console.error(`Ошибка запроса из БД: ${err.message}`)
        let result = '😇 Антирейтинг:\n\n';
        rows.forEach(row => {
            result += `⭐ ${row['full_name']} (${row['username']}) - ${row['count']} ${getNumEnding(row['count'], ['метр', 'метра', 'метров'])}\n`
        })
        context.reply(result)
    })
    db.close()
    console.log(`${context.message.from.first_name} запросил рейтинг`)
}

export function voiceCheck(context) {
    context.telegram.getFileLink(context.message.voice.file_id).then((url) => {
        const file = fs.createWriteStream(`voices/${context.message.voice.file_id}.ogg`);
        https.get(url, function(response) {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
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
                data: fs.readFileSync(`voices/${context.message.voice.file_id}.ogg`)
            };

            axios.request(config)
                .then(async (response) => {
                    if (badCheck(response.data['result']['texts'][0]['text'])) addScore(context, context.message)
                })
                .catch((error) => {
                    console.log(error);
                });
        }, 1000)
    }).catch((err) => {
        console.log(err)
    })
}