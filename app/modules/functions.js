import axios from 'axios'

export const name = 'functions'

export async function censureCheck(context) {
    let result = await axios.get(process.env.CENSURE_QUERY_URL + context.message.text)
    .then((response) => {
        return true
    })
    .catch((error) => {
        console.log(error)
        return false
    })
    return result
}

export async function addScore(context) {
    let result = await axios.get(process.env.SET_SCORE_QUERY_URL + context.message.from.id)
    .then((response) => {
        return true
    })
    .catch((error) => {
        return false
    })
    return result
}

export async function getScore(context) {
    let result = await axios.get(process.env.GET_SCORE_QUERY_URL + context.message.from.id)
    .then((response) => {
        return response.data
    })
    .catch((error) => {
        return false
    })
    return result
}