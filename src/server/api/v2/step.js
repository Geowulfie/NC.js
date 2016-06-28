"use strict";
var StepNC = require('../../../../../STEPNode/build/Release/StepNC');
var file = require('./file');
var tol = file.tol;
var apt = file.apt;
var find = file.find;

var exeFromId = function(id) {
	let ws = {
		"id": id,
		"name": find.GetExecutableName(id)
	};
	if(find.IsEnabled(id))
		ws.enabled = true;
	else
		ws.enabled = false;
	if (find.IsWorkingstep(id)) {
		ws.type = "workingstep";
		return ws;
	} else if (find.IsSelective(id)) {
		ws.type = "selective";
	} else if (find.IsWorkplan(id)) {
		ws.type = "workplan";
	}
	let children = find.GetNestedExecutableAll(id);
	if (children !== undefined) {
		ws.children = children.map(exeFromId);
	}
	return ws;
};

var _getExeFromId = function(req, res) {
	if (req.params.ncId && req.params.wsId !== undefined){
		let ncId = req.params.ncId;
		let wsId = req.params.wsId;
		let id_new = parseInt(wsId);
		find.OpenProject(file.getPath(ncId));
		let exe = exeFromId(id_new);
		if (exe !== undefined)
            res.status(200).send(exe);
		else {
			res.status(404).send("Executable not found");
		}
	}
	else {
		res.status(404).send("No workstep ID provided");
	}
};

var _getMwp = function(req, res) {
	if (req.params.ncId) {
		let ncId = req.params.ncId;
		find.OpenProject(file.getPath(ncId));
		let mwpId = find.GetMainWorkplan();
		res.status(200).send(exeFromId(mwpId));
	}
};

var _getTols = function(req,res) {
  if (req.params.ncId) {
    let ncId = req.params.ncId;
    apt.OpenProject(file.getPath(ncId));
    let tol_list = tol.GetToleranceAll();
    let ret = [];
    for (let id of tol_list){
      ret.push({"id":id,"type":tol.GetToleranceType(id),"value":tol.GetToleranceValue(id)});
    }
    res.status(200).send(ret);
  }
};

var _getWsTols = function(req,res) {
  if (req.params.ncId && req.params.wsId){
    let ncId = req.params.ncId;
    let wsId = req.params.wsId;
    apt.OpenProject(file.getPath(ncId));
    res.status(200).send(tol.GetWorkingstepToleranceAll(wsId));
  }
}
module.exports = function(app, cb) {
	//This route gets the executable given an Id and returns a JSON object with its
	//name, id and all its children (and children's children, etc.)
	app.router.get('/v2/nc/projects/:ncId/workplan/:wsId',_getExeFromId);

  //This route gets all toleranceId's associated with a given workingstep
  app.router.get('/v2/nc/projects/:ncId/tolerances/:wsId',_getWsTols);

  //This route returns a JSON object with all Tolerances (ID-{type,value})
  app.router.get('/v2/nc/projects/:ncId/tolerances',_getTols);

	//This route gets the main workplan for the project that is specified by
	//ncId
	app.router.get('/v2/nc/projects/:ncId/workplan',_getMwp);
	if (cb) cb();
};
