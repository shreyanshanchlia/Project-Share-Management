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

    MainInstance.getProjectCount().then( function(value){
      var x = value.toNumber(); 
      //console.log(x);
      MainInstance.getProjects().then(function(projectIds)
      {
        var projectRow = $('#projectsRow');
        var projectTemplate = $('#projectTemplate');
        //console.log(projectIds[0].toNumber());
        for (i = 0; i < x; i ++) 
        { 
          MainInstance.projects(projectIds[i].toNumber()-1).then(function(pData)
          {
            projectData = pData;
            //console.log(projectData);
            projectTemplate.find('.ptags').text(projectData[6]);
            projectTemplate.find('.pname').text(projectData[1]);
            projectTemplate.find('.pdesc').text(projectData[2]);
            projectTemplate.find('.pmembers').text(projectData[4]);
            projectTemplate.find('.ptasks').text(projectData[5]);
            projectTemplate.find('.btn-projId').attr('dataid', projectData[0]);       
            projectRow.append(projectTemplate.html());
          });
        }
      });
    });

    });
  });
  },  //initContract End

  
  bindEvents: function() {
    $(document).on('click', '.btn-projId', App.handleExProj);
  },

  handleExProj: function(event) {
    event.preventDefault();

    var dataId = parseInt($(event.target).data('dataid'));
    console.log(dataId);
    //localStorage.setItem( 'openProj', dataid );
  }
}

$(".btn-projId").bind("click", function(){
  alert("The paragraph was clicked.");
});

$(function() {
  $(window).load(function() {
    App.init();
  });
});
