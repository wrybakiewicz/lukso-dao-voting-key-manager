import moment from "moment";
import {useEffect, useState} from "react";

export default function EndingIn({votingEnd, updateCantVote, proposal, canExecute}) {

    const format = (number) => {
        if (number < 10) {
            return "0" + number
        } else {
            return number
        }
    }

    const getEndedStatus = () => {
        if(proposal.status === 2) {
            return "Execution failed"
        } else if(proposal.status === 1) {
            return "Executed"
        } else {
            if(canExecute()) {
                return "Can execute"
            } else {
                return "Failed"
            }
        }
    }

    const calculate = () => {
        if (votingEnd.isBefore(moment())) {
            updateCantVote()
            return getEndedStatus()
        } else {
            const endingSeconds = votingEnd.diff(moment(), 'seconds')
            if (endingSeconds < 60) {
                return "Ending in " + format(endingSeconds)
            } else {
                const minutes = Math.floor(endingSeconds / 60)
                const secondsEnding = endingSeconds % 60
                if (minutes < 60) {
                    return "Ending in " + format(minutes) + ":" + format(secondsEnding)
                } else {
                    const hours = Math.floor(minutes / 60)
                    const minutesEnding = minutes % 60
                    if (hours < 24) {
                        return "Ending in " + format(hours) + ":" + format(minutesEnding) + ":" + format(secondsEnding)
                    } else {
                        const days = Math.floor(hours / 24)
                        const hoursEnding = hours % 24
                        return "Ending in " + format(days) + ":" + format(hoursEnding) + ":" + format(minutesEnding) + ":" + format(secondsEnding)
                    }
                }
            }
        }
    }

        const [time, setTime] = useState(calculate())

        useEffect(() => {
            const timer = setTimeout(() => {
                setTime(calculate());
            }, 1000);

            return () => clearTimeout(timer);
        });

        return time

    }