const { assert } = require("chai");

const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require("chai")
  .use(require("chai-as-promised"))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("EthSwap", ([deployer, investor]) => {
  let ethSwap, token;

  before(async () => {
    //create Token contract instance
    token = await Token.new();
    //create EthSwap contract instance
    ethSwap = await EthSwap.new(token.address);
  });

  describe("Token deployment", async () => {
    it("token has a name", async () => {
      const name = await token.name();
      assert.equal(name, "My Custom Token");
    });
  });

  describe("EthSwap deployment", async () => {
    it("contract has a name", async () => {
      const name = await ethSwap.name();
      assert.equal(name, "EthSwap Instant Exchange");
    });

    it("contract has tokens", async () => {
      //transfer 1 mill tokens
      await token.transfer(ethSwap.address, tokens("1000000"));
      let balance = await token.balanceOf(ethSwap.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });

  describe("buyTokens()", async () => {
    let result;
    // purchase tokens before each example
    // investor uses 1 ETH to purchase 100 MCT Tokens
    before(async () => {
      result = await ethSwap.buyTokens({ from: investor, value: tokens("1") });
    });
    it("Allows users to instantly purchase tokens from EthSwap for a fixed price", async () => {
      //verify that investor received tokens after purchase
      //investor is the 2nd item in test accounts array (2nd item in ganache)
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance, tokens("100"));

      //check ethSwap balance after purchase
      let ethSwapBalance;
      ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("999900"));
      //check ETH balance of the exchange
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("1"));

      //transaction info stored in: result.logs[0].args
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100".toString()));
      assert.equal(event.rate.toString(), "100");
    });
  });

  describe("sellTokens()", async () => {
    let result;

    //first, approve and sell the tokens
    before(async () => {
      //approve ethSwap address to spend the tokens
      await token.approve(ethSwap.address, tokens("100"), { from: investor });
      result = await ethSwap.sellTokens(tokens("100"), { from: investor });
    });
    //then, validate the tokens have been sold correctly
    it("Allows user to instanly sell tokens to ethSwap for fixed price", async () => {
      //ensure investor has 0 tokens left
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("0"));

      // ensure that EthSwap exchange has 100 more tokens, and 1 less ether
      let ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("1000000"));

      let ethSwapEtherBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapEtherBalance.toString(), tokens("0"));

      //transaction info stored in: result.logs[0].args
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100".toString()));
      assert.equal(event.rate.toString(), "100");

      // FAILURE: investor cant sell more tokens than he has
      await ethSwap.sellTokens(tokens("500"), { from: investor }).should.be
        .rejected;
    });
  });
});
