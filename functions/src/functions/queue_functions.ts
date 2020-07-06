import * as functions from "firebase-functions";

import { QueueStatus, updateQueue } from './../utils/queue_utils';

exports.popQueue = functions.https.onCall(async (data, context) => {

    // Get Values
    const queueId: string = data.queueId
    const storeId: string = data.storeId
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

// exports.queueListener = functions.https.onCall(async (data, context) => {

//     // Get Values
//     const queueId: string = data.queueId
//     const storeId: string = data.storeId
    
//     //Guard against empty value
//     if(!queueId){
//         throw new functions.https.HttpsError("not-found" , "Could not find QueueID")
//     }
//     if(!storeId){
//         throw new functions.https.HttpsError("not-found" , "Could not find StoreID")
//     }

//     functions.database.ref(`/emporium/globals/grocery_stores/${storeId}`)
//         .onUpdate((snapshot, context) => {

//             const queueService = new QueueService()

//             const data = snapshot.after.val()
//             const current_visitor_count = data['current_visitor_count']
//             const max_visitor_capacity = data['max_visitor_capacity']

//             if (current_visitor_count < max_visitor_capacity) {
//                 const currentQueue = queueService.popQueue(storeId)
//                 const queueLength = queueService.getQueue(storeId).length
//                 return {
//                     currentQueueId: currentQueue!.queueId,
//                     queueLength: queueLength
//                 }
//             }
//     })
// })


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
    updateQueue(QueueStatus.InQueue, storeId, userId)
        .then(result => {
            return result
        })
        .catch(error => {
            throw new functions.https.HttpsError("aborted" , `Error while updating queue. ${error}`)
        })

})