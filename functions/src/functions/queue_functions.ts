import * as functions from "firebase-functions";

import { addQueue, updateQueue, updateCurrentlyServing, QueueStatus, getCurrentlyServing } from './../utils/queue_utils';
import { QueueService } from "./../services/QueueService";
import { getVisitorCount, changeVisitorCount } from "../utils/grocery_store_utils";

exports.queueInfo = functions.https.onCall(async (data, context) => {

    // Get Values
    const storeId: string = data["storeId"]
    const queueService = new QueueService()

    // Queue Length
    let queueLength = queueService.queueLength(storeId)

    // Currently Serving
    let currentlyServing = await getCurrentlyServing(storeId)

    return {
        "queueLength": queueLength,
        "currentlyServing": currentlyServing
    }

})

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

    // Pop from server queue
    const currentQueue = queueService.popQueue(storeId)
    if (currentQueue !== undefined) {

        // Update FireStore
        if (updateQueue(storeId, queueId, QueueStatus.InStore)){

            if (updateCurrentlyServing(storeId, queueId)) {

                // Get Queue Length
                let queueLength = queueService.queueLength(storeId)
            
                // Update Store Capacity
                let visitor_count = await getVisitorCount(storeId)
                let updated_visitor_count = visitor_count +1 
                if (changeVisitorCount(storeId, updated_visitor_count)) {

                    // Complete
                    return {
                        "currentQueueId": currentQueue.id,
                        "queueLength": queueLength
                    }
                }
                else {
                    throw new functions.https.HttpsError("aborted" , "Could not change visitor count")
                }

            }
            else {
                throw new functions.https.HttpsError("aborted" , "Could not update currently serving")
            }

        }
        else {
            throw new functions.https.HttpsError("aborted" , "Could not remove queue")
        }

    }
    else {
        throw new functions.https.HttpsError("not-found" , "Could not find queueId")
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
    let userQueueId = await addQueue(storeId, userId)

    // Join Server Queue
    let queueService = new QueueService()
    queueService.joinQueue(new QueueItem(userQueueId, userId, storeId))

    return {
        "queueId": userQueueId,
    }

})

exports.clearQueue = functions.https.onCall(async (data, context) => {
    let queueService = new QueueService()
    queueService.clearQueue()
})