import * as functions from "firebase-functions";

import { QueueStatus } from "../utils/utils";
import { getQueue } from '../utils/queue_utils';
export class QueueService {

    async queueLength(storeId: string) {
        let queueList = await getQueue(storeId)
        queueList = queueList.filter(x => x.status === QueueStatus.InQueue.valueOf())

        return queueList.length
    }
 
    async popQueue(storeId: string) {

        let queueList = await getQueue(storeId)
        queueList = queueList.filter(x => x.status === QueueStatus.InQueue.valueOf())
        queueList = queueList.sort((x, y) => y.date.getTime() - x.date.getTime())

        const currentQueue = queueList.pop()
        const updatedQueueLength = `${queueList.length}`

        if (currentQueue !== undefined){
            return {
                'currentQueueId': currentQueue.id,
                'queueLength': updatedQueueLength
            }
        }
        else {
            throw new functions.https.HttpsError("not-found" , "Could not find queue")
        }

    }

}