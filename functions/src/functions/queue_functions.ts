import { QueueStatus } from './../utils/queue_utils';
import * as functions from "firebase-functions";
import { updateQueue } from "../utils/queue_utils";

exports.joinQueue = functions.https.onCall(async (data, context) => {

    // Get Values
    const userId = context?.auth?.uid;
    const queueId: string = data.queueId
    const storeId: string = data.storeId
    
    //Guard against empty value
    if(!userId){
        return {
            status: 'Unable to read user id'
        };
    }
    if(!queueId){
        return {
            status: 'Unable to read queue id'
        };
    }
    if(!storeId){
        return {
            status: 'Unable to read store id'
        };
    }

    // Create QueueItem and add to Queue
    const queueService = new QueueService()
    const queueItem: QueueItem = new QueueItem(queueId, userId, storeId)

    queueService.joinQueue(queueItem)

    // Update FireStore
    return { status: updateQueue(QueueStatus.InQueue, storeId, userId) }

})