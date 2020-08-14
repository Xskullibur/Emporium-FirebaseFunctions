import { QueueStatus } from "../utils/utils"

export class QueueItem {

    id: string
    userId: string
    date: Date
    status: QueueStatus

    /**
     * 
     * @param _queueID 
     * @param _userID 
     * @param _storeID 
     */
    constructor(_queueID: string, _userID: string, _date: Date, _status: QueueStatus) {
        this.id = _queueID
        this.userId = _userID
        this.date = _date
        this.status = _status
    }

}