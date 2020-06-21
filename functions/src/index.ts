import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as serviceAccountJson from "./emporium-e8b60-firebase-adminsdk-57ks4-8f074cc632.json";

const serviceAccount = serviceAccountJson as admin.ServiceAccount;

if(serviceAccount){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://emporium-e8b60.firebaseio.com"
    });
}



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

async function deletePoints(userId: string, cost: number): Promise<boolean>{
    const userRef = admin.firestore().doc(`users/${userId}`);
    const user = await userRef.get();
    const userData = user.data();

    if(user.exists){
        //Delete points
        if(userData){
            let point = userData['points'];
            let newPoint = point - cost;
            if(newPoint >= 0){
                //Enough points

                //Update the points
                await userRef.update({
                    'points': newPoint
                });

                return true;
            }else{
                //Not enough points
                return false;
            }
        }
        return false;
    }
    return false;

}

function onlyLetters(str: string): boolean{
    const regex = /^[A-Za-z0-9]+$/g;
    return regex.test(str);
}


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

    if(userId){
        const result = await addPoints(userId, 100);

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

async function addPoints(userId: string, amount: number): Promise<boolean>{
    const userRef = admin.firestore().doc(`users/${userId}`);
    const user = await userRef.get();
    const userData = user.data();

    if(user.exists){
        //Delete points
        if(userData){
            let point = userData['points'];
            let newPoint = point + amount;
            //Update the points
            await userRef.set({
                'points': newPoint
            });

            //Add to earned rewards
            const earnedRewardsRef = userRef.collection('earned_rewards');
            await earnedRewardsRef.add({
                'displayed': false,
                'earned_amount': amount,
                'earned_date': new Date()
            });

            return true;
        }
        return false;
    }
    return false;
}