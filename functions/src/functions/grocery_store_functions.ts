import * as functions from "firebase-functions";
import {getUserType, UserType} from "../utils/user_utils";
import {changeVisitorCount, getMaxVisitorCapacity, getVisitorCount} from "../utils/grocery_store_utils";

export const visitorIncreaseOrDecrease = functions.https.onCall(async (data, context) => {

    const userId = context?.auth?.uid;
    const grocery_storeId = data['grocery_storeId'];

    const value = data['value'] as number;

    //Guard against empty value
    if(!userId){
        return {
            status: 'Unable to read user id'
        };
    }
    if(!grocery_storeId){
        return {
            status: 'Unable to read grocery store id'
        };
    }
    if(!value){
        return {
            status: 'Unable to read value'
        };
    }

    const userType = await getUserType(userId);

    switch (userType) {
        case UserType.Merchant:

            const visitorCount = await getVisitorCount(grocery_storeId);
            const maxVisitorCapacity = await getMaxVisitorCapacity(grocery_storeId);

            const updatedVisitorCount = visitorCount + value;

            if (updatedVisitorCount > 0 && updatedVisitorCount <= maxVisitorCapacity){
                await changeVisitorCount(grocery_storeId, updatedVisitorCount)
                return {
                    status: 'Success'
                }
            }else{
                return {
                    status: 'Over capacity or less than 0'
                }
            }

        case UserType.User:
            return {
                status: 'Not allowed to modify visitor count unless user is a merchant'
            }
    }
});

