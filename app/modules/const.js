import sqlite3 from "sqlite3";

export const name = 'regular'

export function badRegex() {
    return /(?<=^|[^а-яё])(?:(?:(?:у|[нз]а|(?:хитро|не)?вз?[ыьъ]|с[ьъ]|(?:и|ра)[зс]ъ?|(?:о[тб]|п[оа]д)[ьъ]?|(?:\S(?=[а-яё]))+?[оаеи-])-?)?(?:[её](?:б(?!о[рй]|рач)|п[уа](?:ц|тс))|и[пб][ае][тцд][ьъ]).*?|(?:(?:н[иеа]|ра[зс]|[зд]?[ао](?:т|дн[оа])?|с(?:м[еи])?|а[пб]ч)-?)?ху(?:[яйиеёю]|л+и(?!ган)).*?|бл(?:[эя]|еа?)(?:[дт][ьъ]?)?|\S*?(?:п(?:[иеё]зд|ид[аое]?р|ед(?:р(?!о)|[аое]р|ик))|бля(?:[дбц]|тс)|[ое]ху[яйиеёю]|хуйн).*?|(?:о[тб]?|про|на|вы)?м(?:анд(?:[ауеыи](?:л(?:и[сзщ])?[ауеиы])?|ой|[ао]в.*?|юк(?:ов|[ауи])?|е[нт]ь|ища)|уд(?:[яаиое].+?|е?н(?:[ьюия]|ей))|[ао]л[ао]ф[ьъ](?:[яиюе]|[еёо]й))|елд[ауые].*?|ля[тд]ь|(?:[нз]а|по)х)(?=$|[^а-яё])/
}

export function getDatabase() {
    return new sqlite3.Database('db/db.sqlite', err => {
        if (err) return console.error(`\nОшибка соединения с базой данных: ${err.message}`)
        console.log('\nСоединен с базой данных')
    })
}

export function getNumEnding(number, endingArray) {
    number = number % 100
    let ending = ''
    if (number >= 11 && number <= 19) {
        ending = endingArray[2]
    } else {
        let i = number % 10
        switch (i)
        {
            case (1): ending = endingArray[0]; break
            case (2):
            case (3):
            case (4): ending = endingArray[1]; break
            default: ending = endingArray[2]
        }
    }
    return ending
}

export function replyScore(context, userMessage) {
    let db = getDatabase()
    db.get(`SELECT count FROM users WHERE id = ${context.message.from.id}`, (err, row) => {
        if (err) return console.error(`Ошибка запроса из БД: ${err.message}`)
        context.reply(`${userMessage} ${row.count} ${getNumEnding(row.count, ['метр', 'метра', 'метров'])}`, {
            reply_to_message_id: context.message.message_id
        })
    })
}