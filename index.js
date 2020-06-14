const bodyParser = require('body-parser');
const express = require('express');
const path = require("path");
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require("./wallet/transactionPool");
const Wallet = require("./wallet/index");
const TransactionMiner = require("./app/transactionMiner");


const isDevelopment = process.env.ENV === 'development';
const REDIS_URL = isDevelopment?"redis://127.0.0.1:6379":"redis://h:p28e4bcd4cce8de8c3f89848c70e46d6d1887debec7afe1de9f77c562d398e3f3@ec2-54-205-115-98.compute-1.amazonaws.com:9079";


const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();


const pubsub = new PubSub({ blockchain, transactionPool , redisUrl: REDIS_URL});

const transactionMiner = new TransactionMiner({blockchain, transactionPool, wallet, pubsub});

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);  
});

app.post('/api/mine', (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });

  pubsub.broadcastChain();

  res.redirect('/api/blocks');
});


app.post("/api/transact", (req, res)=>{
  const {amount, recipient} = req.body;
  let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});
  try{
    if(transaction){
      transaction.update({senderWallet:wallet, amount, recipient});
    }
    else{
      transaction = wallet.createTransaction({recipient, amount, chain:blockchain.chain});
    }
  }catch(error){
    return res.status(400).json({type:"error", message:error.message});
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  res.json({transaction});
});

app.get("/api/transactionPoolMap" , (req, res)=>{
  res.json(transactionPool.transactionMap);
});

app.get("/api/mineTransactions", (req, res)=>{
  transactionMiner.mineTransactions();
  res.redirect("/api/blocks");
});

app.get("/api/walletInfo" , (req, res)=>{
  res.json({address: wallet.publicKey,
            balance: Wallet.calculateBalance({chain:blockchain.chain , 
                                              address: wallet.publicKey})});

});


app.get("*", (req, res)=>{
  res.sendFile(path.join(__dirname, './client/dist/index.html'));
});



const syncWithRootState = () => {



  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  request({url : `${ROOT_NODE_ADDRESS}/api/transactionPoolMap`}, (error, response, body)=>{
    if(!error && response.statusCode === 200){
      const rootTransactionPoolMap = JSON.parse(body);
      console.log("replace pool map on a sync with", rootTransactionPoolMap);
      transactionPool.setMap(rootTransactionPoolMap);
    }
  });
};


if(isDevelopment){
  const walletJim = new Wallet();
  const walletPam = new Wallet();
  
  
  const generateWalletTransactions= ({wallet , recipient, amount})=>{
      const transaction =  wallet.createTransaction({recipient:recipient, amount:amount, chain: blockchain.chain});
      transactionPool.setTransaction(transaction);
  };
  
  
  const walletAction = ()=>generateWalletTransactions({wallet, recipient: walletJim.publicKey, amount:20});
  
  const walletJimAction = ()=>generateWalletTransactions({wallet:walletJim, recipient: walletPam.publicKey,amount: 10 });
  
  const walletPamAction = ()=>generateWalletTransactions({wallet:walletPam, recipient:wallet.publicKey, amount: 50 });
  
  for(let i=0;i<10;i++){
    if(i%3===0){
      walletAction();
      walletJimAction();
    }
    else if(i %3 === 1){
      walletPamAction();
      walletJimAction();
    }
    else{
      walletAction();
      walletPamAction();
    }
    transactionMiner.mineTransactions();
  }
}




let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT || process.env.PORT;
app.listen(PORT, () => {
  console.log(`listening at localhost:${PORT}`);

  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});