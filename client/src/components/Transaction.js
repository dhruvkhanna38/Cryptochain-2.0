import React from 'react';

const Transaction = (props)=>{
    const {input, outputMap} = props.transaction;
    const recipients = Object.keys(outputMap);

    return (<div>
                <div>From: {`${input.address.substring(0,20)}...`} || Balance:{input.amount}</div>
                {
                    recipients.map(recipient =>{
                        return <div key={recipient}>
                                    To : {`${recipient.substring(0,20)}...`} || sent : {outputMap[recipient]}
                               </div>
                    })
                }
           </div>)
}

export default Transaction;