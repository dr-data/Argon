var Argon = {
    loadBlockly: function() {
        console.log("injecting data into div")
        Blockly.HSV_SATURATION = 0.76;
        Blockly.HSV_VALUE = 0.78;
        Blockly.BlockSvg.START_HAT = true;
        // player-area
        document.getElementById('player-area').setAttribute("style", 'height: ' + (window.innerHeight).toString() + 'px; width:' + 99 + '%');
        document.getElementById('blocklyDiv').setAttribute("style", 'height: ' + (window.innerHeight - 440).toString() + 'px; width:' + 99 + '%');
        window.workspace = Blockly.inject('blocklyDiv', {
            toolbox: document.getElementById('toolbox'),
            zoom: {
                controls: true,
                wheel: true,
                startScale: 0.8,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            }
        });
    },
    renderBlocks: function(data) {
        console.log("rendering blocks from file");
        //for now, we'll render just sprite1
        if (data.objName === "Sprite1") {
            //the scriptObj holds the scripts once they've
            //been organized to match the xml structure of blockly
            var scriptObj = {
                block: []
            };

            data.scripts.forEach(function(script) {
                //a blockArray to hold the new script blocks
                var blockArray = script[2].shift() 

                //the top block of the script
                var newBlock = {
                    _type: blockArray[0], //the block name
                    _id: makeid(), //20 char random id
                    value: [], //a place to store the input value (repeat loop or something)
                    _x: script[0], //the xLoc
                    _y: script[1], //the yLoc
                };
                //add the new block to the scriptObj block array
                scriptObj.block.push(newBlock);
                //add the inputs to the top block
                addInputs({
                    block: newBlock //could add the last block of scriptObj instead here
                }, blockArray);

                
                addNextBlock(scriptObj.block[scriptObj.block.length - 1]);

                function addNextBlock(targetBlock) {
                    //still blocks left
                    if (script[2].length > 0) {
                        //get the next block from the script
                        var blockArray = script[2].shift();
                        //make a block object for the new block
                        var blockObj = {
                            _type: blockArray[0],
                            _id: makeid(),
                            value: [],
                            statement: []
                        };
                        
                        //add the block to the next of the targetBlock
                        targetBlock.next = {
                            block: blockObj
                        };
                        //add any inputs to the block
                        addInputs(targetBlock.next, blockArray);
                        //recursion until the blocks are used used up from the shift
                        addNextBlock(targetBlock.next.block);
                    }
                }

                function addInputs(scriptObj, blockArray) {
                    console.log(scriptObj, blockArray);
                    //go through the blockArray starting with the 1st input
                    //which is at index 1
                    for (var i = 1; i < blockArray.length; i++) {
                        //ignore null values
                        if (blockArray[i] != null) {
                            //here we've found an array of new blocks nested in our existing block
                            //we'll need to add each of them, possibly calling this function again recusively
                            if (typeof blockArray[i] === 'object') { //an array actually
                                //for some reason they come reversed
                                //remember this when you're working on saving
                                blockArray[i].reverse();
                                //go through the blocks adding each to the statement
                                blockArray[i].forEach(function(block) {
                                    var position = scriptObj.block.statement.push({
                                        _name: "VALUE" + i.toString(),
                                        block: {
                                            _type: block[0],
                                            _id: makeid(),
                                            value: [],
                                            statement: [],
                                            next: []
                                        }
                                    });
                                    //add any inputs here
                                    //position is one more than the index of the statement 
                                    addInputs(scriptObj.block.statement[position-1], block);
                                }); //end of statement forEach
                            }
                            else {  //just a regular input
                                //push it onto the value stack
                                scriptObj.block.value.push({
                                    _name: "VALUE" + i.toString(),
                                    block: {
                                        _type: "input",
                                        _id: makeid(),
                                        field: {
                                            __text: blockArray[i].toString(),
                                            _name: "FIELDNAME"
                                        }
                                    }
                                });
                            }

                        }
                    }
                }
            });
            //make a new X2JS conversion object
            var x2js = new X2JS();
            
            //wrap the scriptObj in an xml tag (could be done above)
            var finalObject = {
                xml: {
                    _xmlns: "http://www.w3.org/1999/xhtml",
                    block: scriptObj.block
                }
            }
            //make the xmlText for blockly
            var xmlText = x2js.json2xml_str(finalObject)
            console.log(xmlText)
            if (xmlText) {
                //clear the old space out
                Blockly.mainWorkspace.clear();
                //inject the blocks into the dom
                Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xmlText), Blockly.mainWorkspace);
            }
        }
        
        //this makes a random 20-char id
        function makeid() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 20; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }

    }
};


//test functions below

//these save/load functions allow the creation of proper
//xml for checking the output we've generated based on sb2 files
window.saveWorkspace = function() {
    var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    localStorage.setItem("blockly.xml", xmlText);
};


window.loadWorkspace = function() {
    var xmlText = localStorage.getItem("blockly.xml");
    if (xmlText) {
        Blockly.mainWorkspace.clear();
        xmlDom = Blockly.Xml.textToDom(xmlText);
        var x2js = new X2JS();
        console.log(x2js.xml_str2json(xmlText));
        //this xmlText can be checked against what we're generating
        console.log(xmlText)
        var x2js = new X2JS();
        var jsonObj = x2js.xml_str2json(xmlText);
        console.log(jsonObj.xml)
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
    }
};

function test() {
    var text = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="forward:" id="FOCtyk8mE8txmXECod4D" x="26" y="35"><value name="VALUE"><block type="input" id="iPA%_v|JlL0}14~o!.s~"><field name="FIELDNAME">10</field></block></value></block></xml>'
    var x2js = new X2JS();
    console.log(x2js.xml_str2json(text));
}