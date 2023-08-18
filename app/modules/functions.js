import axios from 'axios'

export const name = 'functions'

export async function censureCheck(context, isUpdate, file) {
    let mess
    if (isUpdate) {
        mess = context.update.edited_message.text
    } else if (file) {
        mess = file
    } else {
        mess = context.message.text
    }

    return await axios.get(process.env.CENSURE_QUERY_URL + mess)
        .then((response) => {
            return true
        })
        .catch((error) => {
            console.log(error)
            return false
        })
}

export async function goodCheck(context, isUpdate, file) {
    let mess
    if (isUpdate) {
        mess = context.update.edited_message.text
    } else if (file) {
        mess = file
    } else {
        mess = context.message.text
    }
    return await axios.get(process.env.GOOD_QUERY_URL + mess)
        .then((response) => {
            return true
        })
        .catch((error) => {
            console.log(error)
            return false
        })
}

export async function addScore(context, isUpdate, isBad) {
    let mess
    if (isUpdate) {
        mess = context.update.edited_message
    } else {
        mess = context.message
    }
    let url = isBad ? process.env.SET_SCORE_BAD_QUERY_URL : process.env.SET_SCORE_GOOD_QUERY_URL
    return await axios.get(url + mess.from.id + '&username=' + mess.from.username
        + '&full_name=' + mess.from.first_name)
        .then((response) => {
            return true
        })
        .catch((error) => {
            return false
        })
}

export async function getScore(context, isUpdate) {
    let mess
    if (isUpdate) {
        mess = context.update.edited_message
    } else {
        mess = context.message
    }
    return await axios.get(process.env.GET_SCORE_QUERY_URL + mess.from.id)
        .then((response) => {
            return response.data
        })
        .catch((error) => {
            return false
        })
}

export async function getRating() {
    return await axios.get(process.env.GET_RATING_QUERY_URL)
        .then((response) => {
            return response.data
        })
        .catch((error) => {
            return false
        })
}

export async function addMe(context) {
    return await axios.get(process.env.ADD_QUERY_URL + context.message.from.id
        + '&username=' + context.message.from.username
        + '&full_name=' + context.message.from.first_name)
        .then((response) => {
            return true
        })
        .catch((error) => {
            return false
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