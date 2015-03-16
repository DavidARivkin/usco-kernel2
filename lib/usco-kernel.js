!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.UscoKernel=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var ANode = function ANode() {
  _classCallCheck(this, ANode);

  this.children = [];
};

//experimental assembly

var Assembly = (function (_ANode) {
  function Assembly() {
    _classCallCheck(this, Assembly);

    _get(Object.getPrototypeOf(Assembly.prototype), "constructor", this).call(this);
  }

  _inherits(Assembly, _ANode);

  _createClass(Assembly, {
    add: {
      value: function add(item) {
        this.children.push(item);
      }
    }
  });

  return Assembly;
})(ANode);

exports.Assembly = Assembly;

},{}],2:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var generateUUID = require("./utils").generateUUID;

var Design = function Design(options) {
  _classCallCheck(this, Design);

  var DEFAULTS = {
    uid: generateUUID(),
    name: "",
    title: "",
    description: "",
    version: "0,0.0",
    url: "",
    authors: [], //{"name":"otherGirl","url": "www.mysite.com","email":"gg@bar.baz"}
    tags: [],
    licences: [],
    meta: { state: "design" }
  };

  var options = Object.assign({}, DEFAULTS, options);
  Object.assign(this, options);
};

exports.Design = Design;

},{"./utils":8}],3:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var generateUUID = require("./utils").generateUUID;

/*** 
*Base class for ...lots of things
***/

var Entity = function Entity() {
  _classCallCheck(this, Entity);

  this.iuid = generateUUID(); //each instance needs a unique uid
};

exports.Entity = Entity;

},{"./utils":8}],4:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Entity = require("./Entity").Entity;

var generateUUID = require("./utils").generateUUID;

/*** 
*Base class for defining "parts"
***/

var Part = (function (_Entity) {
  function Part(options) {
    _classCallCheck(this, Part);

    var DEFAULTS = {
      pId: undefined, //part id, common for all instances of a given part
      name: "",
      color: "#FFFFFFFF",
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      sca: [1, 1, 1]
    };

    var options = Object.assign({}, DEFAULTS, options);
    _get(Object.getPrototypeOf(Part.prototype), "constructor", this).call(this, options);
    Object.assign(this, options);
  }

  _inherits(Part, _Entity);

  _createClass(Part, {
    clone: {
      value: function clone() {
        //return this.clone();
        return new Part({ name: this.name, color: this.color, pos: this.pos, rot: this.rot, sca: this.sca });
      }
    }
  }, {
    consolidateToNewClass: {

      /*create a new , named Part sub class*/

      value: function consolidateToNewClass(name, klass) {
        if (!name) throw new Error("No name provided to create new sub class");
      }
    }
  });

  return Part;
})(Entity);

//"hurrah" for now class attributes
//assign id for the CLASS itself, common for all instances
//TODO: perhaps subclassing makes more sense ? ie create a new custom class
Part.id = generateUUID();

exports.Part = Part;

},{"./Entity":3,"./utils":8}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Part = require("./Part").Part;

//FIXME: how much of an overlap with bom ?
//FIXME: how much of an overlap with asset manager?

var PartRegistry = (function () {
  function PartRegistry() {
    _classCallCheck(this, PartRegistry);

    //container for all already loaded meshes
    //TODO : should this be a facade ?
    this.partKlasses = {};
    this.parts = [];
    //TODO: is this not redundant with assets, but stored by part id ???
    this._partMeshTemplates = {}; //the original base mesh: ONE PER PART
    this._partMeshWaiters = {}; //internal : when
    this.partMeshInstances = {};
  }

  _createClass(PartRegistry, {
    addTemplateMeshForPart: {

      /* 
        adds the "template mesh" for a given part
        this will be used as a basic instance to clone for all instances
        
        FIXME: is this no close to defining a class , of which all instances are...instances?
      */

      value: function addTemplateMeshForPart(mesh, partId) {
        this._partMeshTemplates[partId] = mesh;

        //anybody waiting for that mesh yet ?
        if (this._partMeshWaiters[partId]) {
          console.log("resolving mesh of ", partId);
          this._partMeshWaiters[partId].resolve(mesh);
        }
      }
    },
    getEntityMesh: {

      /* wrapper abstracting whether one needs to wait for the part's mesh or not
      */

      value: regeneratorRuntime.mark(function getEntityMesh(partId) {
        var _this = this;

        var mesh;
        return regeneratorRuntime.wrap(function getEntityMesh$(context$2$0) {
          while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
              if (_this.partMeshOriginal[partId]) {
                context$2$0.next = 2;
                break;
              }

              return context$2$0.abrupt("return");

            case 2:
              if (!_this._partMeshWaiters[partId]) {
                _this._partMeshWaiters[partId] = Q.defer();
              }

              context$2$0.next = 5;
              return _this._partMeshWaiters[partId];

            case 5:
              mesh = context$2$0.sent;
              return context$2$0.abrupt("return", mesh);

            case 7:
            case "end":
              return context$2$0.stop();
          }
        }, getEntityMesh, this);
      })
    },
    registerInstanceMesh: {

      /* register a instance's 3d mesh
      this needs to be done PER INSTANCE not just once per part
      */

      value: function registerInstanceMesh(mesh, partId) {

        //no partId was given, it means we have a mesh with no part (yet !)
        if (!partId) {
          var part = new Part();
          part.pId = 0; //FIXME implement
          partId = 0; //FIXME implement
          //TODO , should we be making a new part CLASS at this stage ?
        } else {
          part = this.parts[partId];
        }

        if (!this.partMeshInstances[partId]) {
          this.partMeshInstances[partId] = [];
        }
        this.partMeshInstances[partId].push(mesh);

        //do we have ANY meshes for this part
        //if not, add it to templates
        if (!this._partMeshTemplates[partId]) {
          this.addTemplateMeshForPart(mesh, partId);
        }

        //FIXME: unsure, this is both too three.js specific, and a bit weird to inject data like that
        mesh.userData.part = part;
        return part;
      }
    },
    registerPart: {
      value: function registerPart(part) {
        if (!part) throw new Error("no part specified, cannot register part");
        this.parts.push(part);
      }
      /*
      registerPartKlass( partKlass ){
      
      }*/

    }
  });

  return PartRegistry;
})();

exports.PartRegistry = PartRegistry;
//partMeshesToWaitFor.push( self.partWaiters[ partId ].promise );

},{"./Part":4}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var BomEntry = function BomEntry(name, description, version, amount, unit, parameters) {
  _classCallCheck(this, BomEntry);
};

var Bom = (function () {
  function Bom() {
    _classCallCheck(this, Bom);

    //TODO: ermmm bom within bom?
    this.bom = [];
  }

  _createClass(Bom, {
    registerPart: {

      //basic api

      value: function registerPart(partData, _x, instances) {
        var implementations = arguments[1] === undefined ? {} : arguments[1];

        var DEFAULTS = {
          name: "",
          description: "",
          version: "0.0.0",
          qty: 0,
          physicalQty: 0, //this can be used for weight, distance etc
          unit: "EA", //this applies to the physicalQty field
          parameters: "",
          implementations: {}, //without defaults to "default":"xxx.stl"

          //FIXME: hack field? shoud this be in another data structure ?
          _instances: {} //same keys as implementations, values are in memory instances ie "meshes"
        };

        var partData = Object.assign({}, DEFAULTS, partData);
      }
    },
    registerInstance: {

      /*
        register an instance 
      
      */

      value: function registerInstance(partId, instance) {
        if (!instance) throw new Error("No instance given");
        var bomEntry = this.bom[partId];
        if (!bomEntry) throw new Error("Not existing partId specified");

        //console.log("registering", instance, "as instance of ", bomEntry.name );
        bomEntry._instances.push(instance);
        //FIXME can't we use the length of instances ? or should we allow for human settable variation
        bomEntry.qty += 1;
      }
    },
    unRegisterInstance: {

      /*remove an instance 
      
      */

      value: function unRegisterInstance(partId, instance) {
        if (!instance) throw new Error("No instance given");
        var bomEntry = this.bom[partId];
        if (!bomEntry) throw new Error("bad partId specified");

        var index = bomEntry._instances.indexOf(instance);
        if (index == -1) {
          return;
        }bomEntry._instances.splice(index, 1);
        //FIXME can't we use the length of instances ? or should we allow for human settable variation
        bomEntry.qty -= 1;
      }
    },
    registerImplementation: {

      /*
        Register an IMPLEMENTATIOn in the bom: 
        an implementation is a key-value pair : 
          *key : the SOURCE (a parametric file used
        to generate a mesh) 
          *value: the concrete 
          for example a mesh/ mesh file (stl , amf)
        
        why an implementation ? because an entity/part can be created in different
        software, different formats etc, it still remains the same entity
        
        for example :
          {"cad/case.scad":"cad/case-top-0.0.1.stl"}
      */

      value: function registerImplementation(partName, meshUri) {
        console.log("registering", meshUri, "as implementation of ", partName);
        if (!partName) throw new Error("no part name specified");

        /*var partIndex = -1;
        var bomEntry = null;
        
        for(var i=0;i<this.bom.length;i++)
        {
          var entry = this.bom[i];
          partIndex = i;
          if(entry.name === partName)
          {
            bomEntry = entry;
            break;
          }
        }*/
        var bomEntry = this.getPartByName(partName);
        if (!bomEntry) {}

        if (!bomEntry) {
          partIndex += 1;
          bomEntry = {
            id: partIndex,
            name: partName,
            description: "",
            version: "0.0.1",
            qty: 0,
            unit: "EA",
            url: "",
            implementations: { "default": meshUri },
            parameters: "",
            _instances: [],
            _instances2: {}
          };
          this.bom.push(bomEntry);
        }
        console.log("BOM", this.bom);
        return partIndex;
      }
    },
    getPartByName: {

      //helpers and extras

      value: function getPartByName(partName) {
        var res = this.bom.find(function (entry) {
          return entry.name === partName;
        });
        if (matches.length > 0) {
          return res[0];
        }return undefined;
      }
    },
    getPartNames: {

      /*retrieve all part names*/

      value: function getPartNames() {
        var partNames = this.bom.map(function (obj) {
          return obj.name;
        }); //return obj.name
        return partNames;
      }
    },
    isPartNameInBom: {

      /*find out if a part (name) is already in the bom*/

      value: function isPartNameInBom(partName) {
        var matches = this.getPartByName(partName);
        if (matches) {
          return true;
        }return false;
      }
    },
    isPartImplementationInBom: {

      /* find out if an implementation name already exists in the bom*/

      value: function isPartImplementationInBom(implementationName) {
        for (var i = 0; i < this.bom.length; i++) {
          var entry = this.bom[i];
          var implemNames = Object.keys(entry.implementations).map(function (key) {
            return entry.implementations[key];
          });

          if (implemNames.includes(implementationName)) {
            return true;
          }
        }
        return false;
      }
    },
    addEmtpyEntry: {

      /*inject an empty entry */

      value: function addEmtpyEntry(partName, description) {
        partIndex = this.bom.length - 1;

        bomEntry = {
          id: partIndex,
          name: partName,
          description: "",
          version: "0.0.1",
          qty: 0,
          unit: "EA",
          url: "",
          implementations: { "default": "" },
          parameters: "",
          _instances2: {}
        };

        this.bom.push(bomEntry);
      }
    },
    assignInstanceToEntry: {

      /*
        (re)assign an instance to a given entry
        //var partId = instance.userData.part.partId;
      */

      value: function assignInstanceToEntry(instance, partId) {
        this._unRegisterInstance(partId, instance);
        this._registerInstance(partId, instance);
      }
    }
  });

  return Bom;
})();

//object mixin testing
/*
Object.assign(Bom.prototype, {
    testMethod(arg1) {
      console.log("testing one two");
    }
});*/

exports.Bom = Bom;

/*this.name        = name;
this.description = "";
this.version     = "0.0.1";
this.amount      = 0;
this.unit        = "EA";
this.implementations = {};//"default":meshUri
this.parameters      = "";*/
//Object.assign(this, { x, y });

},{}],7:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Part = require("./Part").Part;

var PartRegistry = require("./PartRegistry").PartRegistry;

var Bom = require("./bom/Bom").Bom;

var Assembly = require("./Assembly").Assembly;

var Design = require("./Design").Design;

/**
TODO: should be singleton
**/

var Kernel = (function () {
  function Kernel() {
    _classCallCheck(this, Kernel);

    this.partRegistry = new PartRegistry();

    this.assemblies = [];
    this.activeAssembly = new Assembly();
    this.assemblies.push(this.activeAssembly);

    //not sure
    this.activeDesign = new Design();
  }

  _createClass(Kernel, {
    addPartInstance: {
      value: function addPartInstance(partInst) {
        this.assemblies.add(partInst);
      }
    },
    registerPart: {
      value: function registerPart() {
        var part = arguments[0] === undefined ? undefined : arguments[0];
        var options = arguments[1] === undefined ? {} : arguments[1];
        var source = arguments[2] === undefined ? undefined : arguments[2];
        var bin = arguments[3] === undefined ? undefined : arguments[3];

        this.activeAssembly.add(part);

        console.log("assembly", this.activeAssembly);
        //JSON.stringify( this.activeAssembly )
        return part;
      }
    },
    duplicatePart: {
      value: function duplicatePart(part) {
        var dupe = part.clone();
        this.activeAssembly.add(part);
        //TODO: how to deal with auto offset to preven overlaps
        return dupe;
      }
    }
  });

  return Kernel;
})();

//export { Kernel }
module.exports = Kernel;
//FIXME: hack, for now
window.UscoKernel = Kernel;

},{"./Assembly":1,"./Design":2,"./Part":4,"./PartRegistry":5,"./bom/Bom":6}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

//TODO: taken from three.js ,do correct attribution
var generateUUID = (function () {

	// http://www.broofa.com/Tools/Math.uuid.htm

	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
	var uuid = new Array(36);
	var rnd = 0,
	    r;

	return function () {

		for (var i = 0; i < 36; i++) {

			if (i == 8 || i == 13 || i == 18 || i == 23) {

				uuid[i] = "-";
			} else if (i == 14) {

				uuid[i] = "4";
			} else {

				if (rnd <= 2) rnd = 33554432 + Math.random() * 16777216 | 0;
				r = rnd & 15;
				rnd = rnd >> 4;
				uuid[i] = chars[i == 19 ? r & 3 | 8 : r];
			}
		}

		return uuid.join("");
	};
})();

exports.generateUUID = generateUUID;

},{}]},{},[7])(7)
});