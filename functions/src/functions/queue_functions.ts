import * as functions from "firebase-functions";

import { addQueue, updateQueue, updateCurrentlyServing, getCurrentlyServing } from './../utils/queue_utils';
import { Global } from './global';
import { getVisitorCount, changeVisitorCount } from "../utils/grocery_store_utils";
import { QueueStatus } from "../utils/utils";

declare const global: Global
const queueService = global.queueService

/**
 * Returns Queue Length and Currently Serving
 */
exports.queueInfo = functions.https.onCall(async (data, context) => {

    // Get Values
    const storeId: string = data["storeId"]

    // Queue Length
    const queueLength = await queueService.queueLength(storeId)

    // Currently Serving
    const currentlyServing = await getCurrentlyServing(storeId)

    return {
        "queueLength": `${queueLength}`,
        "currentlyServing": currentlyServing
    }

})

/**
 * Create a Queue with status InQueue
 */
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
    const userQueueId = await addQueue(storeId, userId)

    return {
        "queueId": userQueueId,
    }

})

/**
 * Dequeue first element and update status to OnTheWay
 */
exports.popQueue = functions.https.onCall(async (data, context) => {

    // Get Values
    const storeId: string = data["storeId"]
        
    //Guard against empty value
    if(!storeId){
        throw new functions.https.HttpsError("not-found" , "Could not find StoreID")
    }
    
    // Pop from server queue
    let newQueueStatus = await queueService.popQueue(storeId)
    
    // Update Visitor Counter
    const visitor_count = await getVisitorCount(storeId)
    const success = await changeVisitorCount(storeId, visitor_count +1)

    if (!success) {
        throw new functions.https.HttpsError("aborted" , "Update Visitor Count Failed")
    }
    
    // Update FireStore
    await updateQueue(storeId, newQueueStatus.currentQueueId, QueueStatus.OnTheWay)
    await updateCurrentlyServing(storeId, newQueueStatus.currentQueueId)
    
    // Return
    return newQueueStatus

})

/**
 * Update queue status
 */
exports.updateStatus = functions.https.onCall(async (data, context) => {

    // Get Values
    const queueId: string = data["queueId"]
    const storeId: string = data["storeId"]
    const status: string = data['status']
    
    // Guard against empty value
    if(!queueId){
        throw new functions.https.HttpsError("not-found" , "Could not find QueueID")
    }
    if(!storeId){
        throw new functions.https.HttpsError("not-found" , "Could not find StoreID")
    }
    if (!status) {
        throw new functions.https.HttpsError("not-found" , "Could not find Status")
    }

    // Check status
    if (status === QueueStatus.OnTheWay) {
        await updateQueue(storeId, queueId, QueueStatus.OnTheWay)
    }
    else if (status === QueueStatus.Completed) {
        await updateQueue(storeId, queueId, QueueStatus.Completed)
    }
    else {
        throw new functions.https.HttpsError("not-found" , "Invalid Status")
    }

    // Return completed
    return true

})