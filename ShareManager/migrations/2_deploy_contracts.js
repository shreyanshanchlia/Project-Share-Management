var maincontract = artifacts.require("./maincontract.sol");

module.exports = function(deployer) {
  deployer.deploy(maincontract);
};