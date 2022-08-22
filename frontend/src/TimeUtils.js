import moment from "moment";

const format = (number) => {
    if (number < 10) {
        return "0" + number
    } else {
        return number
    }
}

const formatTime = (end) => {
    const endingSeconds = end.diff(moment(), 'seconds')
    if (endingSeconds < 60) {
        return format(endingSeconds)
    } else {
        const minutes = Math.floor(endingSeconds / 60)
        const secondsEnding = endingSeconds % 60
        if (minutes < 60) {
            return format(minutes) + ":" + format(secondsEnding)
        } else {
            const hours = Math.floor(minutes / 60)
            const minutesEnding = minutes % 60
            if (hours < 24) {
                return format(hours) + ":" + format(minutesEnding) + ":" + format(secondsEnding)
            } else {
                const days = Math.floor(hours / 24)
                const hoursEnding = hours % 24
                return format(days) + ":" + format(hoursEnding) + ":" + format(minutesEnding) + ":" + format(secondsEnding)
            }
        }
    }
}

export {formatTime}