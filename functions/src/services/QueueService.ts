import * as functions from "firebase-functions";
import { getQueue, QueueStatus } from '../utils/queue_utils';
export class QueueService {

    constructor() {
        
    }

    async queueLength(storeId: string) {
        let queueList = await getQueue(storeId)
        queueList = queueList.filter(x => x.status === QueueStatus.InQueue.valueOf())

        return queueList.length
    }
 
    async popQueue(storeId: string) {

        let queueList = await getQueue(storeId)
        queueList = queueList.filter(x => x.status === QueueStatus.InQueue.valueOf())

        let currentQueue = queueList.pop()
        let updatedQueueLength = `${queueList.length}`

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