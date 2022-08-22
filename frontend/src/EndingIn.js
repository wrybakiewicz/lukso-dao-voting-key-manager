import moment from "moment";
import {useEffect, useState} from "react";
import {formatTime} from "./TimeUtils";

export default function EndingIn({votingEnd, updateCantVote, proposal, canExecute}) {

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
            return "Ending in " + formatTime(votingEnd)
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