class QueueItem {

    id: string
    userId: string
    storeId: string
    joinDateTime?: Date
    leaveDateTime?: Date

    /**
     * 
     * @param _queueID 
     * @param _userID 
     * @param _storeID 
     */
    constructor(_queueID: string, _userID: string, _storeID: string) {
        this.id = _queueID
        this.userId = _userID
        this.storeId = _storeID
    }

}