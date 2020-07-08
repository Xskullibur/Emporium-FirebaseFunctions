import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export enum QueueStatus {
    InQueue = "In Queue",
    InStore = "In Store",
    Completed = "Completed"
}

export async function updateQueue(status: QueueStatus, storeId: String, userId: String): Promise<{}> {

    const storeRef = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}`)
    const queueCollection = storeRef.collection('queue')

    let newQueue = queueCollection.doc()
    let queueId = await newQueue.set({
        'status': status,
        'userId': userId
    }, {
        merge: true
    }).then(() => {
        return newQueue.id
    }).catch((error) => {
        throw new functions.https.HttpsError("aborted" , `Error while updating queue. ${error}`)
    })

    return {
        "queueId": queueId
    }
}