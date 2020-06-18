import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'

import Stripe from 'stripe'

const stripe = new Stripe('pk_test_tFCu0UObLJ3OVCTDNlrnhGSt00vtVeIOvM', {
    apiVersion: '2020-03-02',
})

exports.createCustomer = functions.auth.user().onCreate(async user =>{
    const customer = await stripe.customers.create({email : user.email})
    await admin.firestore().collection('customers').doc(user.uid).set({customer_id: customer.id})
})

exports.addPaymentSource = functions.firestore.document('customers/{userID}/tokens/{autoID}').onWrite(async (change, context) =>{
    const data = change.after.data()
    if(data === null){
        return null
    }
    const token = data!.token
    const snapshot = await admin.firestore().collection('customers').doc(context.params.userID).get()
    const customer = snapshot.data()!.customer_id
    const response = await stripe.customers.createSource(customer, {source: token})
    
    await admin.firestore().collection('customers').doc(context.params.userID).collection('sources').doc(response.id).set(response, {merge: true})
})

exports.createStripeCharge = functions.firestore.document('customer/{userID}/charges/{autoID}').onCreate(async (snap, context) =>{
    try{
        const customer = context.params.userID
        const amount = snap.data().amount
        const currency = snap.data().currency
        const charge = {amount, currency, customer}
        
        const idempotencyKey = context.params.autoID

        const response = await stripe.charges.create(charge, {idempotencyKey: idempotencyKey})

        await snap.ref.set(response, {merge: true})

    }catch(err){
        await snap.ref.set({error: err}, {merge: true})
    }
})




