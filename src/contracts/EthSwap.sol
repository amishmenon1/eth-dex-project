pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // amount of ETH multiplied by redemption rate
        // redemption rate = # token they receive for 1 ether

        //calculate # tokens to buy
        // msg.value = how much ether was sent in the transaction
        uint tokenAmount = msg.value * rate;

        // ethSwap exchange must have enough tokens to fulfill the transaction
        require(token.balanceOf(address(this)) >= tokenAmount);
        token.transfer(msg.sender /*recipient */, tokenAmount);
        //emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }
    
    function sellTokens(uint _amount) public payable {
        //user cant sell more tokens than he has
        require(token.balanceOf(msg.sender) >= _amount);

        // need to transfer MCT tokens FROM the investor TO EthSwap
        //calc amount of ether to redeem
        uint etherAmount = _amount / rate;

        // require that EthSwap have enough ether
        require(address(this).balance >= etherAmount);

        ////////THIS IS ILLEGAL - WILL NOT WORK - cannot call ERC20 transfer on behalf of another contract
        /////// token.transfer(address(this), _amount) 

        // must use transferFrom instead
        // make sure to approve token before this gets called (in sellTokens caller)
        token.transferFrom(msg.sender, address(this), _amount);

        // perform sale - send ETH from investor's account
        // different 'transfer' function than the ERC20 token transfer
        // this transfer allows you to send native ether from ETH address
        msg.sender.transfer(etherAmount);
        
        // emit event
        emit TokensSold(msg.sender, address(token), _amount, rate);

    }
    
    
}