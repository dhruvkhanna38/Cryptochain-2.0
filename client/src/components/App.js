import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import logo from "../assets/logo.png";

class App extends Component{
    state = {walletInfo : {}};

    componentDidMount(){
        fetch(`${document.location.origin}/api/walletInfo`).
        then((response) => response.json()).
        then((json) => this.setState({walletInfo:json})).
        catch(error => console.log(error));
    }


    render(){
        const {address , balance} = this.state.walletInfo;
        return  (<div className="App">      
                    <img className='logo' src={logo}></img>     
                    <br />            
                    <div>Welcome to the blockchain</div>
                    <br />
                    <div>
                            <Link to="/blocks">Blocks</Link>
                            <br />
                            <Link to="/conductTransaction">Conduct a Transaction</Link>
                            <br />
                            <Link to='/transactionPool'>Transaction Pool</Link>
                    </div>
                    <div className="walletInfo">
                        <div>Address : {address}</div>
                        <div>Balance : {balance}</div>
                    </div>
                </div>)
            
    }
}

export default App;
