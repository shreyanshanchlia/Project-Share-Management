App = {
  web3Provider: null,
  contracts: {},
  init: async function() {

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    var web3 = new Web3(App.web3Provider);
    web3.eth.defaultAccount=web3.eth.accounts[0];

    // let accounts = await web3.eth.getAccounts();
    // web3.eth.defaultAccount = accounts[0];

    // console.log(web3.eth.defaultAccount);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('maincontract.json', function(data){
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
    console.log(data);
    var MainArtifact = data;
    App.contracts.Main = TruffleContract(MainArtifact);
    // Set the provider for our contract
    App.contracts.Main.setProvider(App.web3Provider);
    var MainInstance;
    App.contracts.Main.deployed().then(function(instance){
    MainInstance = instance;

      document.getElementById("createProject").onclick = async function()
      {
        var name = document.getElementById("name").value;
        var tags = document.getElementById("tags").value;
        var description = document.getElementById("message").value;
        console.log(name);
        console.log(tags);
        console.log(description);
        
        var exist = await MainInstance.userExist();
        if(!exist)
        {
          console.log("creating user");
          await MainInstance.adduseraccount('User 1');
        }
        await MainInstance.createProject(name, description, tags, { from: web3.currentProvider.selectedAddress });
        console.log("created new project");
      }
    });
  });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
