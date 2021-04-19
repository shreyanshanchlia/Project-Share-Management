// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;
contract maincontract{
    struct Project{
        uint256 pId;
        string pName;
        string description;
        uint256 founder;
        uint256 members;
        uint256 tasks;
        string tags;
        uint256[10] contributors;
        uint256[10] shares;
        uint256[10] taskId;
        string[10] taskName;
        string[10] taskDescription;
    }
    struct User{
        uint256 cId;
        address account;
        string cName;
        uint256[] projectsInvolved;
    }

    uint256 public totalProjectCount;
    uint256 public totalUserCount;
    address public currentUser;

    Project[] public projects;
    User[] public users;

    mapping(address => uint256) public userId;

    event newProjectCreated(string _name);
    event userAdded(string _name);
    event contributorAdded(uint256 newContributor, uint256 projectId);
    event sharesAllocated(uint256 oldShares, uint256 Newshares, uint256 projectId, uint256 contributorId);
    // event TaskCreated(uint256 _taskId, string _taskName);

    constructor() public{
        currentUser = msg.sender;
    }
    
    function getProjects() public view returns(uint256[] memory){
        return users[userId[currentUser]-1].projectsInvolved;
    }
    function getProjectCount() public view returns(uint256){
        return users[userId[currentUser]-1].projectsInvolved.length;
    }

    function adduseraccount(string memory _name) public {
        //require(bytes(_name).length>0,"name can not be an empty string");
        require(userId[msg.sender]==0, "user account already exists!");
        totalUserCount++;
        userId[msg.sender] = totalUserCount;
        User memory user;
        user.cName = _name;
        user.account = msg.sender;
        user.cId = userId[msg.sender];
        users.push(user);
        emit userAdded(_name);
    }

    function createProject(string memory _name, string memory description, string memory _tags) public {
        require(bytes(_name).length>0,"Project name can not be an empty string");
        //require(bytes(description).length>0,"description can not be an empty string");
        totalProjectCount++;
        Project memory project;
        project.members++;
        project.pId = totalProjectCount;            //new ID
        project.pName = _name;                      //name
        project.tags = _tags;                       //tags
        project.description = description;          //description
        project.founder = userId[msg.sender];       //founder
        project.contributors[project.members-1] = userId[msg.sender];
        project.shares[project.members-1] = 100;
        projects.push(project);
        users[userId[msg.sender]-1].projectsInvolved.push(project.pId);
        emit newProjectCreated(_name);
    }

    function addNewContributor(uint256 newContributor, uint256 projectId) public {
        require(newContributor>0 &&  newContributor<=totalUserCount, "No such user exist!");
        users[newContributor-1].projectsInvolved.push(projectId);
        uint members = ++projects[projectId-1].members;
        projects[projectId-1].contributors[members-1] = newContributor;
        projects[projectId-1].shares[members-1] = 0;                            //shares
        emit contributorAdded(newContributor, projectId);
    }

    function allocateSharesTo(uint256 Newshares, uint256 projectId, uint256 _contributorId) public {
        require(projectId <= totalProjectCount, "No such Project");
        require(_contributorId <= totalUserCount, "No such user");
        require(projects[projectId].founder == userId[currentUser], "You are not the founder!");
        
        uint oldshares;
        for(uint i=0; i<projects[projectId-1].contributors.length; i++){
            if(projects[projectId-1].contributors[i] == _contributorId){
                oldshares = projects[projectId-1].shares[i];
                require(Newshares >= -oldshares, "Invalid share amount for this contributor!");
                projects[projectId-1].shares[i]+=Newshares;
                break;
            }
            if(i==projects[projectId-1].contributors.length-1){
                require(false,"No such Contributor in this project");
            }
        }
        emit sharesAllocated(oldshares, Newshares, projectId, _contributorId);
    }
    
    function createTask(uint256 _projectId, string memory _taskName, string memory _description) public {
        require(bytes(_taskName).length>0,"task name can not be an empty string");
        require(bytes(_description).length>0,"name can not be an empty string");
        uint256 task = projects[_projectId].tasks++;
        projects[_projectId].taskName[task] = _taskName;
        projects[_projectId].taskDescription[task] = _description;
        projects[_projectId].taskId[task] = task+1;
        emit TaskCreated(task+1, _taskName);
    }
    
    
}