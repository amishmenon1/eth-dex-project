import React, { Component } from "react";
import logo from "../logo.png";
import Web3 from "web3";
import Navbar from "./Navbar";
import "./App.css";
import EthSwap from "../abis/EthSwap.json";
import Token from "../abis/Token.json";
import Main from "./Main";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    console.log(window.web3);
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({
      account: accounts[0],
    });
    console.log(this.state.account);
    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });
    console.log("ETH Balance: " + this.state.ethBalance);

    // load token
    const networkId = await web3.eth.net.getId();
    const tokenNetworkData = Token.networks[networkId];
    if (tokenNetworkData) {
      const token = new web3.eth.Contract(Token.abi, tokenNetworkData.address);
      this.setState({ token });
      const tokenBalance = await token.methods
        .balanceOf(this.state.account)
        .call(); // need to call "call" when calling a method on blockchain
      console.log("Token: " + token);
      console.log("Token Balance: " + tokenBalance.toString());
      this.setState({ tokenBalance });
    } else {
      alert("Token contract not deployed to detected network.");
    }

    //load EthSwap
    const ethSwapNetworkData = EthSwap.networks[networkId];
    if (ethSwapNetworkData) {
      const ethSwap = new web3.eth.Contract(
        EthSwap.abi,
        ethSwapNetworkData.address
      );
      this.setState({ ethSwap });
      console.log(this.state.ethSwap);
    } else {
      alert("Token contract not deployed to detected network.");
    }
    this.setState({ loading: false });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying Metamask!"
      );
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true });
    this.state.ethSwap.methods
      .buyTokens()
      .send({ value: etherAmount, from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true });
    //must prompt sender to approve EthSwap (EthSwap.sol) to spend your MCT token (Token.sol)
    this.state.token.methods
      .approve(this.state.ethSwap.address, tokenAmount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
    //once approved, EthSwap can make the sale
    this.state.ethSwap.methods
      .sellTokens(tokenAmount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      token: {},
      tokenBalance: 0,
      ethBalance: 0,
      ethSwap: {},
      loading: true,
    };
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <a id="loader" className="text-center">
          Loading...
        </a>
      );
    } else {
      content = (
        <Main
          ethBalance={this.state.ethBalance.toString()}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens.bind(this)}
          sellTokens={this.sellTokens.bind(this)}
        />
      );
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
