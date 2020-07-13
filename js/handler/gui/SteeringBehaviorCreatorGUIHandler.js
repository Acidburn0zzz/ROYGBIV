var SteeringBehaviorCreatorGUIHandler = function(){
  this.types = [];

  for (var behaviorKey in steeringHandler.steeringBehaviorTypes){
    this.types.push(steeringHandler.steeringBehaviorTypes[behaviorKey]);
  }

  this.defaultControls = {
    "Type": this.types[0],
    "Name": "",
    "Create": function(){
      var name = this["Name"];
      terminal.clear();

      if (!name){
        terminal.printError(Text.NAME_CANNOT_BE_EMPTY);
        return;
      }

      var behaviorsByID = steeringHandler.usedBehaviorIDs;
      if (behaviorsByID[name]){
        terminal.printError(Text.NAME_MUST_BE_UNIQUE);
        return;
      }

      var behavior = steeringBehaviorCreatorGUIHandler.createBehavior(name, this["Type"]);
      if (!(behavior instanceof PreconfiguredSteeringBehavior)){
        terminal.printError(behavior);
        return;
      }

      steeringHandler.addBehavior(name, behavior);
      steeringBehaviorCreatorGUIHandler.addBehaviorFolder(behavior);
      terminal.printInfo(Text.STEERING_BEHAVIOR_CREATED);
    },
    "Close": function(){

    }
  };
}

SteeringBehaviorCreatorGUIHandler.prototype.show = function(){
  terminal.disable();
  terminal.clear();
  terminal.printInfo(Text.USE_GUI_TO_CREATE_STEERING_BEHAVIORS);

  selectionHandler.resetCurrentSelection();
  guiHandler.hideAll();

  guiHandler.datGuiSteeringBehaviorCreation = new dat.GUI({hideable: false});

  guiHandler.datGuiSteeringBehaviorCreation.add(this.defaultControls, "Type", this.types);
  guiHandler.datGuiSteeringBehaviorCreation.add(this.defaultControls, "Name");
  guiHandler.datGuiSteeringBehaviorCreation.add(this.defaultControls, "Create");
  guiHandler.datGuiSteeringBehaviorCreation.add(this.defaultControls, "Close");

  var existingBehaviors = steeringHandler.behaviorsBySceneName[sceneHandler.getActiveSceneName()];
  for (var behaviorID in existingBehaviors){
    var behavior = existingBehaviors[behaviorID];
    this.addBehaviorFolder(behavior);
  }
}

SteeringBehaviorCreatorGUIHandler.prototype.createBehavior = function(name, type){
  var params = {name: name, type: type};

  switch(type){
    case steeringHandler.steeringBehaviorTypes.ALIGN: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.ARRIVE:
      params.satisfactionRadius = 50;
      params.slowDownRadius = 100;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.AVOID:
      params.maxSeeAhead = 50;
      params.maxAvoidForce = 100;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.BLENDED:
      params.list = [];
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.COHESIION: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.EVADE:
      params.maxPredictionTime = 10;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.FLEE: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.HIDE:
      params.arriveSatisfactionRadius = 50;
      params.arriveSlowDownRadius = 100;
      params.hideDistance = 150;
      params.threatDistance = 500;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.LOOK_WHERE_YOU_ARE_GOING: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.PATH_FOLLOWING:
      var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()] || {};
      var pathIDs = Object.keys(paths);
      if (pathIDs.length == 0){
        return Text.NO_PATHS_IN_THIS_SCENE;
      }
      params.pathID = pathIDs[0];
      params.satisfactionRadius = 50;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.PRIORITY:
      params.threshold = 1;
      params.list = [];
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.PURSUE:
      params.maxPredictionTime = 10;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.RANDOM_PATH:
      var graphs = steeringHandler.graphsBySceneName[sceneHandler.getActiveSceneName()] || {};
      var graphIDs = Object.keys(graphs);
      if (graphIDs.length == 0){
        return Text.NO_GRAPHS_IN_THIS_SCENE;
      }
      params.satisfactionRadius = 50;
      params.graphID = graphIDs[0];
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.RANDOM_WAYPOINT:
      var paths = steeringHandler.pathsBySceneName[sceneHandler.getActiveSceneName()] || {};
      var pathIDs = Object.keys(paths);
      if (pathIDs.length == 0){
        return Text.NO_PATHS_IN_THIS_SCENE;
      }
      params.pathID = pathIDs[0];
      params.satisfactionRadius = 50;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.SEEK: return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.SEPARATION:
      params.strength = 50;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.WANDER_TWO:
      params.angleChange = 0.03;
      params.normalX = 0;
      params.normalY = 1;
      params.normalZ = 0;
      params.wanderCircleDistance = 100;
      params.wanderCircleRadius = 50;
    return new PreconfiguredSteeringBehavior(params);
    case steeringHandler.steeringBehaviorTypes.WANDER_THREE:
      params.angleChange = 0.03;
      params.wanderSphereDistance = 100;
      params.wanderSphereRadius = 50;
    return new PreconfiguredSteeringBehavior(params);
  }
}

SteeringBehaviorCreatorGUIHandler.prototype.addBehaviorFolder = function(behavior){
  var params = behavior.parameters;

  var commonFolderFunc = function(params){
    var folder = guiHandler.datGuiSteeringBehaviorCreation.addFolder(params.name);
    var controller = folder.add(params, "type");
    guiHandler.disableController(controller);
    folder.add({"Delete": function(){
      steeringHandler.removeBehavior(behavior.parameters.name);
      guiHandler.datGuiSteeringBehaviorCreation.removeFolder(folder);
      terminal.clear();
      terminal.printInfo(Text.BEHAVIOR_REMOVED);
    }}, "Delete");
    return folder;
  };

  switch (params.type){
    case steeringHandler.steeringBehaviorTypes.ALIGN:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.ARRIVE:
      var folder = commonFolderFunc(params);
      var confs = {satisfactionRadius: "" + params.satisfactionRadius, slowDownRadius: "" + params.slowDownRadius};
      folder.add(confs, "satisfactionRadius").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "satisfactionRadius"));
          return;
        }
        behavior.parameters.satisfactionRadius = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
      folder.add(confs, "slowDownRadius").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "slowDownRadius"));
          return;
        }
        behavior.parameters.slowDownRadius = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
    return;
    case steeringHandler.steeringBehaviorTypes.AVOID:
      var folder = commonFolderFunc(params);
      var confs = {maxSeeAhead: "" + params.maxSeeAhead, maxAvoidForce: "" + params.maxAvoidForce};
      folder.add(confs, "maxSeeAhead").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxSeeAhead"));
          return;
        }
        behavior.parameters.maxSeeAhead = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
      folder.add(confs, "maxAvoidForce").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxAvoidForce"));
          return;
        }
        behavior.parameters.maxAvoidForce = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
    return;
    case steeringHandler.steeringBehaviorTypes.BLENDED:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.COHESIION:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.EVADE:
      var folder = commonFolderFunc(params);
      var confs = {maxPredictionTime: "" + params.maxPredictionTime};
      folder.add(confs, "maxPredictionTime").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "maxPredictionTime"));
          return;
        }
        behavior.parameters.maxPredictionTime = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
    return;
    case steeringHandler.steeringBehaviorTypes.FLEE:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.HIDE:
      var folder = commonFolderFunc(params);
      var confs = {
        arriveSatisfactionRadius: "" + params.arriveSatisfactionRadius,
        arriveSlowDownRadius: "" + params.arriveSlowDownRadius,
        hideDistance: "" + params.hideDistance,
        threatDistance: "" + params.threatDistance
      };
      folder.add(confs, "arriveSatisfactionRadius").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "arriveSatisfactionRadius"));
          return;
        }
        behavior.parameters.arriveSatisfactionRadius = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
      folder.add(confs, "arriveSlowDownRadius").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "arriveSlowDownRadius"));
          return;
        }
        behavior.parameters.arriveSlowDownRadius = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
      folder.add(confs, "hideDistance").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "hideDistance"));
          return;
        }
        behavior.parameters.hideDistance = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
      folder.add(confs, "threatDistance").onFinishChange(function(val){
        terminal.clear();
        var parsed = parseFloat(val);
        if (isNaN(parsed)){
          terminal.printError(Text.IS_NOT_A_NUMBER.replace(Text.PARAM1, "threatDistance"));
          return;
        }
        behavior.parameters.threatDistance = parsed;
        terminal.printInfo(Text.BEHAVIOR_UPDATED);
      });
    return;
    case steeringHandler.steeringBehaviorTypes.LOOK_WHERE_YOU_ARE_GOING:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.PATH_FOLLOWING:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.PRIORITY:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.PURSUE:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.RANDOM_PATH:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.RANDOM_WAYPOINT:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.SEEK:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.SEPARATION:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.WANDER_TWO:
      commonFolderFunc(params);
    return;
    case steeringHandler.steeringBehaviorTypes.WANDER_THREE:
      commonFolderFunc(params);
    return;
  }
}
