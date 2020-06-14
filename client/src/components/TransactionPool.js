import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Transaction from './Transaction';
import history from '../history';
import {Button} from 'react-bootstrap';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component{



    state = {transactionPoolMap : {}}

    fetchMineTransactions = ()=>{
        fetch(`${document.location.origin}/api/mineTransactions`).
        then(response => {
            if(response.status === 200){
                alert("Success");
                history.push("/blocks");
            }
            else{
                alert("Not Able to Mine Transaction");
            }
        });
    }

    fetchTransactionPoolMap = ()=>{
        fetch(`${document.location.origin}/api/transactionPoolMap`).
        then(response=>response.json()).
        then(json => this.setState({transactionPoolMap: json})).
        catch(error=>console.log(`Error: ${error}`));
    }

    componentDidMount(){
        this.fetchTransactionPoolMap();
        setInterval(()=>{this.fetchTransactionPoolMap(), POLL_INTERVAL_MS});
    }


    render(){
        return (<div className="TransactionPool">
                    <div><Link to="/">Home</Link></div>
                    <h3>Transaction Pool</h3>
                    {
                        Object.values(this.state.transactionPoolMap).map(transaction =>{
                            return <div key={transaction.id}>
                                        <hr />
                                        <Transaction transaction={transaction} ></Transaction>
                                   </div>
                        })
                    }
                    <hr />
                    <Button bsStyle="danger" onClick={this.fetchMineTransactions}>Mine The Transactions</Button>
               </div>)
    }
}

export default TransactionPool;