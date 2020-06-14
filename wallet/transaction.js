const uuid = require("uuid/v1");
const {verifySignature} = require("../util/index");
const {REWARD_INPUT , MINING_REWARD} = require("../config.js");


class Transaction{
    constructor({senderWallet, recipient, amount, outputMap, input}){
        this.id= uuid();
        this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
        this.input = input || this.createinput({senderWallet, outputMap: this.outputMap});
    }

    createOutputMap({senderWallet, recipient, amount}){
        let outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    createinput({senderWallet, outputMap}){
        return {timestamp: Date.now(),
                amount: senderWallet.balance,
                address: senderWallet.publicKey,
                signature: senderWallet.sign(outputMap)
            };
    }

    static validTransaction(transaction){
        const {input, outputMap} = transaction;
        const {address, amount, signature} = input;

        const outputTotal = Object.values(outputMap).reduce((total, outputAmount)=> total + outputAmount);
        if(amount !== outputTotal){
            return false;
        }

        if(!verifySignature({publicKey: address, data: outputMap, signature})){
            return false;
        }

        return true;
        
    }

    update({senderWallet, recipient, amount}){
        if(amount > this.outputMap[senderWallet.publicKey]){
            throw new Error("amount exceeds balance");
        }

        if(!this.outputMap[recipient]){
            this.outputMap[recipient] = amount;
        }else{
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }

        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;

        this.input = this.createinput({senderWallet, outputMap: this.outputMap}); //here the signature does not change because JS treats the same object instance as equal
    }

    static rewardTransaction({minerWallet}){
        return new this({
            input: REWARD_INPUT, 
            outputMap: {[minerWallet.publicKey]: MINING_REWARD}
        })
    }
}

module.exports = Transaction;