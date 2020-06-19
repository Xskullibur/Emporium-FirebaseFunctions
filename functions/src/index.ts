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
            await claimedVouchers.add({
                id: voucherId,
                name: voucherData['name'],
                description: voucherData['description'],
                formula: voucherData['formula']
            });
            return {
                status: "Success"
            };
        }
        return {
            status: "Voucher is unavailable"
        };
    }else{
        return {
            status: "Voucher is unavailable"
        };
    }
});


function onlyLetters(str: string): boolean{
    const regex = /^[A-Za-z0-9]+$/g;
    return regex.test(str);
}
