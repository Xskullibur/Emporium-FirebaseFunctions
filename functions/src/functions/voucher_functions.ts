import * as functions from "firebase-functions";
import {onlyLetters} from "../utils/common_utils";
import * as admin from "firebase-admin";
import {addPoints, deletePoints} from "../utils/voucher_utils";

export const claimVoucher = functions.https.onCall(async (data, context) => {

    const userId = context?.auth?.uid;
    const voucherId = data["voucherId"];

    if(userId){
        //Make sure vouchersId only contains letters and digits
        if(!onlyLetters(voucherId)){
            return {
                status: "Invalid Voucher Id"
            };
        }

        //Get claimed vouchers reference
        const claimedVouchers = admin.firestore().collection(`users/${userId}/claimed_vouchers`);

        //Get global vouchers reference
        const availableVouchers = admin.firestore().collection('emporium/globals/available_vouchers');

        //Check for the voucher inside the reference
        const voucherRef = availableVouchers.doc(voucherId);
        const voucher = await voucherRef.get();
        const voucherData = voucher.data();
        if(voucher.exists){

            //Add claimed voucher to user collection
            if (voucherData) {
                const claimed = await deletePoints(userId, voucherData['cost']);
                if(claimed){
                    await claimedVouchers.add({
                        id: voucherId,
                        name: voucherData['name'],
                        description: voucherData['description'],
                        cost: voucherData['cost'],
                        formula: voucherData['formula']
                    });
                    return {
                        status: "Success"
                    };
                }else{
                    return {
                        status: "Not enough points"
                    };
                }
            }
            return {
                status: "Voucher is unavailable"
            };
        }else{
            return {
                status: "Voucher is unavailable"
            };
        }
    }
    return {
        status: "Not allowed"
    };
});




//Mark an earned reward as seen
export const seenEarnedReward  = functions.https.onCall(async (data, context) => {
    const userId = context?.auth?.uid;
    const earnedRewardId = data['earnedRewardId'];

    if(userId && earnedRewardId) {
        const earnedRewardsRef = admin.firestore().doc(`users/${userId}/earned_rewards/${earnedRewardId}`);
        await earnedRewardsRef.update({
            'displayed': true
        });
        return {
            status: 'Success'
        }
    }
    return {
        status: 'Failed'
    }

});

//TESTING ONLY
export const testAddPoints = functions.https.onCall(async (data, context) => {
    const userId = context?.auth?.uid;
    console.log(userId);
    if(userId){
        const result = await addPoints(userId, 100);
        console.log(result);
        if(result){
            return {
                status: 'Success'
            }
        }
    }

    
    return {
        status: 'Failed'
    }
});