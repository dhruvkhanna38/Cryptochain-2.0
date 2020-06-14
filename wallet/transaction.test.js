const Transaction = require("./transaction");
const Wallet = require("./index");
const {verifySignature} = require("../util/index");
const {REWARD_INPUT , MINING_REWARD} = require("../config.js");

describe("Transaction",()=>{
    let transaction, senderWallet, recipient, amount;

    beforeEach(()=>{
        senderWallet = new Wallet();
        recipient = "recipientPublicKey";
        amount = 50;
        transaction = new Transaction({senderWallet, recipient, amount})
    });

    it("has an `id`", ()=>{
        expect(transaction).toHaveProperty(`id`);
    });

    describe("outputMap", ()=>{
        it("has an `outputMap`", ()=>{
            expect(transaction).toHaveProperty(`outputMap`);
        });

        it('output the amount to the recipient' , ()=>{
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it("outputs the ramaining balance for the 'senderWallet'", ()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });

    });

    describe("input", ()=>{
        it("has an `input' property", ()=>{
            expect(transaction).toHaveProperty(`input`);
        });

        it("has a `timestamp` property in input", ()=>{
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it("sets the amount to `senderWallet` balance", ()=>{
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it("sets the `address` to `senderWallet' publicKey", ()=>{
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input', ()=>{
            expect(verifySignature({
                publicKey: senderWallet.publicKey,
                data: transaction.outputMap,
                signature: transaction.input.signature
            })).toBe(true);
        });
    });

    describe("validTransaction()", ()=>{
       describe("and the transaction is valid", ()=>{
            it("returns true", ()=>{
                expect(Transaction.validTransaction(transaction)).toBe(true);
            }); 
       });

       describe("and the transaction is invalid", ()=>{
            describe("and the outputMap is invalid", ()=>{
                it("returns false", ()=>{
                    transaction.outputMap[senderWallet.publicKey] = -10000;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                });
            });
            
            describe("and the transaction input signature is invalid", ()=>{
                it("returns false", ()=>{
                    transaction.input.signature = new Wallet().sign("false-data");
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                });
            });
       });
    });

    describe("update()", ()=>{
        let origanlSignature, orignalSenderOutput, nextRecipient, nextAmount;

        describe("and the amount is valid", ()=>{

            beforeEach(()=>{
                origanlSignature = transaction.input.signature;
                orignalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = "next-recipent";
                nextAmount = 50;
                transaction.update({senderWallet, recipient: nextRecipient, amount: nextAmount});
            });
    
            it("outputs the amount to the next recipient", ()=>{
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });
    
            it("subtracts the amount from the senderWallet balance", ()=>{
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(orignalSenderOutput - nextAmount);
            });
    
            it("maintains a total output that mathces the input amount", ()=>{
              expect(Object.values(transaction.outputMap).
              reduce((total, outputAmount)=>total+ outputAmount)).
              toEqual(transaction.input.amount);
            });
    
            it("resigns the transaction", ()=>{
                expect(transaction.input.signature).not.toEqual(origanlSignature);
            });

            describe("and another update to the recipient amount", ()=>{
                let addedAmount ;
                beforeEach(()=>{
                    addedAmount = 80;
                    transaction.update({senderWallet, recipient:nextRecipient, amount:addedAmount});
                });

                it("adds to the recipient amount", ()=>{
                    expect(transaction.outputMap[nextRecipient]).
                    toEqual(nextAmount + addedAmount);
                });

                it("subtracts the amount from the orignal sender output amount", ()=>{
                    expect(transaction.outputMap[senderWallet.publicKey]).
                    toEqual(orignalSenderOutput - nextAmount - addedAmount);
                });

            });
        });

        describe("and the amount is invalid", ()=>{
            it("throws an error", ()=>{
                expect(()=>transaction.update({senderWallet,
                                           recipient:"foo", 
                                           amount:999999})).
                toThrow("amount exceeds balance");
            });
        });



        
    });

    describe("rewardTransaction()", ()=>{
        let minerWallet, rewardTransaction;

        beforeEach(()=>{
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({minerWallet});
        });
        
        it("creates a transaction with REWARD_INPUT", ()=>{
            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        });

        it('creates one transactions for the miner with MINING_REWARD', ()=>{
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
        })
    });
}); 