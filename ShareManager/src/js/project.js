var projectData;
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

      MainInstance.projects(x-1).then(function(pData)
      {
        projectData = pData;
        // projectTemplate.find('.ptags').text(projectData[6]);
        $(document).find('.pname').text(projectData[1]);
        $(document).find('.pdesc').text(projectData[2]);
        
        var tasksRow = $('#tasksRow');  

        //tasks
        var taskTemplate = $('#taskTemplate');
        var tasksCount = projectData[5].toNumber();
        //console.log(tasksCount);
        for (i = 0; i < tasksCount; i ++) 
        { 
          MainInstance.getTaskName(projectData[0].toNumber(), i).then(function(tName)
          {
            taskTemplate.find('.tname').text(tName);
          });
          MainInstance.getTaskDescription(projectData[0].toNumber(), i).then(function(tDesc)
          {
            taskTemplate.find('.tdesc').text(tDesc);
            tasksRow.append(taskTemplate.html());
          });
        }
        //contributors
        var contributorTemplate = $('#contributorTemplate');
        var contributorCount = projectData[4].toNumber();
        //console.log(contributorCount);
        for (i = 0; i < contributorCount; i ++) 
        { 
          //console.log(projectData[0].toNumber());
          MainInstance.getContributor(projectData[0].toNumber(), i).then(function(pc)
          {
            contributorTemplate.find('.cname').text(pc.toNumber());
            contributorTemplate.find('.btnAllocate').attr('data', pc.toNumber());
            tasksRow.append(contributorTemplate.html());
          });
        }
      });

      document.getElementById("addContributor").onclick = async function()
      {
        var uid = document.getElementById("contributoruid").value;
        
        await MainInstance.addNewContributor(uid, projectData[0].toNumber(), { from: web3.currentProvider.selectedAddress });
      }
      document.getElementById("addTask").onclick = async function()
      {
        var tname = document.getElementById("tname").value;
        var tdesc = document.getElementById("tdesc").value;
        
        await MainInstance.createTask(projectData[0].toNumber(), tname, tdesc, { from: web3.currentProvider.selectedAddress });
        console.log("created new task");
      }

      });
    });
    },

    bindEvents: function() {
      $(document).on('click', '.btnAllocate', App.handleAllocate);
    },
  
    handleAllocate: function(event) {
      event.preventDefault();
  
      var e = event.target.id;
    }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
  