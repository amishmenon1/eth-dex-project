import React, { Component } from "react";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
import "./Main.css";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentForm: "buy",
      ethBalance: props.ethBalance,
      tokenBalance: props.tokenBalance,
      buyTokens: props.buyTokens,
      sellTokens: props.sellTokens,
    };
  }

  render() {
    let content;
    if (this.state.currentForm === "buy") {
      content = (
        <BuyForm
          ethBalance={this.props.ethBalance}
          tokenBalance={this.props.tokenBalance}
          buyTokens={this.props.buyTokens}
        />
      );
    } else {
      content = (
        <SellForm
          ethBalance={this.props.ethBalance}
          tokenBalance={this.props.tokenBalance}
          sellTokens={this.props.sellTokens}
        />
      );
    }

    return (
      <div id="content" className="mt-3">
        <div className="d-flex justify-content-between mb-3 action-toolbar">
          <button
            className="btn btn-light"
            onClick={(event) => {
              this.setState({ currentForm: "buy" });
            }}
          >
            Buy
          </button>
          <span className="text-muted">&lt; &nbsp; &gt;</span>
          <button
            className="btn btn-light"
            onClick={(event) => {
              this.setState({ currentForm: "sell" });
            }}
          >
            Sell
          </button>
        </div>

        <div className="card mb-4 dex-main">
          <div className="card-body">{content}</div>
        </div>
      </div>
    );
  }
}

export default Main;
