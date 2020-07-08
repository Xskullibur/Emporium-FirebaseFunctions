import * as functions from "firebase-functions";

import { QueueStatus, updateQueue } from './../utils/queue_utils';

exports.popQueue = functions.https.onCall(async (data, context) => {

    // Get Values
    const queueId: string = data["queueId"]
    const storeId: string = data["storeId"]
    const queueService = new QueueService()
        
    //Guard against empty value
    if(!queueId){
        throw new functions.https.HttpsError("not-found" , "Could not find QueueID")
    }
    if(!storeId){
        throw new functions.https.HttpsError("not-found" , "Could not find StoreID")
    }

    const currentQueue = queueService.popQueue(storeId)
    const queueLength = queueService.getQueue(storeId).length

    return {
        currentQueueId: currentQueue!.queueId,
        queueLength: queueLength
    }

})


exports.joinQueue = functions.https.onCall(async (data, context) => {

    // Get Values
    const userId = context?.auth?.uid
    const storeId: string = data.storeId

    //Guard against empty value
    if(!userId){
        throw new functions.https.HttpsError("not-found" , "Could not find UserID")
    }
    if(!storeId){
        throw new functions.https.HttpsError("not-found" , "Could not find StoreID")
    }

    // Update FireStore
    return await updateQueue(QueueStatus.InQueue, storeId, userId)

})