import * as admin from "firebase-admin";

export enum QueueStatus {
    InQueue = "In Queue",
    InStore = "In Store",
    Completed = "Completed"
}

export async function updateQueue(status: QueueStatus, storeId: String, userId: String): Promise<string> {

    const storeRef = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}`)
    const queueCollection = admin.firestore().collection(`users/${userId}/queue`);

    let newQueue = queueCollection.doc()
    return await newQueue.update({
        'status': status,
        'store': storeRef
    }).then(() => {
        return 'Successfully joined queue'
    }).catch((error) => {
        return `Error writing document (JoinQueue) ${error}`
    })

}