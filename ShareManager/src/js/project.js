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
      //console.log(data);
      var MainArtifact = data;
      App.contracts.Main = TruffleContract(MainArtifact);
      // Set the provider for our contract
      App.contracts.Main.setProvider(App.web3Provider);
      var MainInstance;
      App.contracts.Main.deployed().then(function(instance){
      MainInstance = instance;

      var x = parseInt(window.localStorage.getItem('openProj'));

      MainInstance.projects(x).then(function(pData)
      {
        var projectData = pData;
        // projectTemplate.find('.ptags').text(projectData[6]);
        $(document).find('.pname').text(projectData[1]);
        $(document).find('.pdesc').text(projectData[2]);
        
        //to make this
        var tasksRow = $('#tasksRow');  

        var taskTemplate = $('#taskTemplate');
        var tasksCount = projectData[5].toNumber();
        //console.log(tasksCount);
        for (i = 0; i < tasksCount; i ++) 
        { 

          tasksRow.append(taskTemplate.html());
        }

      });

      });
    });
    }


  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  