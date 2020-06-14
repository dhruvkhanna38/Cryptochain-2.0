const TransactionPool = require("./transactionPool");
const Transaction = require("./transaction");
const Wallet = require("./index");
const Blockchain = require("../blockchain/index")


describe("TransactionPool" , ()=>{
    let transactionPool, transaction, senderWallet;

    beforeEach(()=>{
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({senderWallet,
                                       recipient: "Fake-Recipient",
                                       amount : 80});
    });

    describe("setTransaction()", ()=>{
        it("adds a transaction", ()=>{
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    }); 

    describe("existingTransaction()", ()=>{
        it("returns an existing transaction given an input address", ()=>{
            transactionPool.setTransaction(transaction);
            expect(transactionPool.existingTransaction({inputAddress: senderWallet.publicKey})).toBe(transaction);
        });
    });

    describe("validTransactions()", ()=>{
        let validTransactions;

        beforeEach(()=>{
            validTransactions = [];
            for(let i=0;i<10;i++){
                transaction = new Transaction({senderWallet,
                                                recipient:"Michael Scott",
                                                amount: 20});
                if(i%3===0){
                    transaction.input.amount = 99999;
                }else if(i%3===1){
                    transaction.input.signature = new Wallet().sign("Invalid-Signature");
                }else{
                    validTransactions.push(transaction);
                }
                transactionPool.setTransaction(transaction);
            }
        });

        it("returns valid Transactions", ()=>{
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        }); 

        
    });

    describe("clear()", ()=>{
        it("clears the transactionPool", ()=>{
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        })
    });

    describe("clearBlockchainTransactions()", ()=>{
        it("clears the pol of any existing blockchaim transactions", ()=>{
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for(let i=0;i<6;i++){
                const transaction = new Wallet().createTransaction({
                    recipient : "foo", 
                    amount : 20
                });

                transactionPool.setTransaction(transaction);

                if(i%2===0){
                    blockchain.addBlock({data : [transaction]})
                }else{
                    expectedTransactionMap[transaction.id] = transaction
                }
            }

            transactionPool.clearBlockchainTransactions({chain: blockchain.chain});
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);



        });
    });
});