import * as admin from "firebase-admin";

export enum QueueStatus {
    InQueue = "In Queue",
    InStore = "In Store",
    Completed = "Completed"
}

export async function updateQueue(status: QueueStatus, storeId: String, userId: String): Promise<{}> {

    const storeRef = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}`)
    const queueCollection = storeRef.collection('queue')

    let newQueue = queueCollection.doc()
    return await newQueue.update({
        'status': status,
        'userId': userId
    }).then(() => {
        return {
            queueId: newQueue.id
        }
    }).catch((error) => {
        return error
    })

}