class QueueService {

    storeDict: { [id: string]: QueueItem[]} = {}
    queue: QueueItem[] = []

    constructor() {
        
    }

    getQueue(storeId: string) {
        return this.storeDict[storeId]
    }

    joinQueue(item: QueueItem) {
        this.storeDict[item.storeId].push(item)
    }
 
}