const Transaction = require("./transaction");

class TransactionPool {
    constructor(){
        this.transactionMap = {};
    }

    setTransaction(transaction){
        this.transactionMap[transaction.id] = transaction;
    }

    existingTransaction({inputAddress}){
        let transactions = Object.values(this.transactionMap);
        return transactions.find(transaction => transaction.input.address === inputAddress);
    }

    setMap(transactionPoolMap){
        this.transactionMap = transactionPoolMap;
    }

    validTransactions(){
        let transactions = Object.values(this.transactionMap);
        let validTransactionsArray = [];
        
        for(let i=0;i<transactions.length;i++){
            if(Transaction.validTransaction(transactions[i])){
                validTransactionsArray.push(transactions[i]);
            }
        }

        return validTransactionsArray;
    }

    clear(){
        this.transactionMap = {};
    }

    clearBlockchainTransactions({chain}){
        for(let i=1;i<chain.length;i++){
            const block = chain[i];
            for(let transaction of block.data){
                if(this.transactionMap[transaction.id]){
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }

}

module.exports = TransactionPool;