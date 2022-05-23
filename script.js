window.onload = function (event) {
    //DEKLARACJE
    var _a;
    var svgURI = "http://www.w3.org/2000/svg";
    var layerCounter = 0;
    var handleHeld = null;
    //top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight
    //potrzebne do tego wyżej:
    window.onmouseup = function (e) {
        handleHeld = null;
        //console.log("mouseup");
    };
    //śledzenie myszy na płótnie
    var mouseX = 0.0;
    var mouseY = 0.0;
    window.onmousemove = function (ev) {
        var targetElement = svgCanavs;
        var targetRect = targetElement.getBoundingClientRect();
        mouseX = ev.clientX - targetRect.left; //x position within the element.
        mouseY = ev.clientY - targetRect.top; //y position within the element.
    };
    //Elementy UI
    var svgCanavs = document.querySelector("#svg-canvas");
    var toolbarCategories = document.querySelector(".toolbar-categories");
    var tooblbarPalette = document.querySelector(".toolbar-palette");
    var toolbarPaletteAddColorButton = document.querySelector(".toolbar-palette-add-color-button");
    var toolbarOptionFillCheckbox = document.querySelector("#toolbar-option-fill-checkbox");
    var toolbarLayersAddButton = document.querySelector("#toolbar-layers-add-button");
    var toolbarLayers = document.querySelector(".toolbar-layers");
    var toolbarCategoryShapes = document.querySelector("#toolbar-category-shapes");
    svgCanavs.onmouseleave = function (e) {
        handleHeld = null;
        //console.log("mouseleave");
    };
    //narzędzia
    var Tool = /** @class */ (function () {
        //icon: HTMLElement;
        function Tool(name, svgElement, listEntry) {
            this.name = name;
            this.svgElement = svgElement;
            //this.icon = icon;
            this.listEntry = listEntry;
        }
        return Tool;
    }());
    var selectedTool = null;
    function selectTool(tool) {
        if (selectedTool != null) {
            selectedTool.listEntry.style.backgroundColor = "white";
        }
        if (selectedLayer != null) {
            selectedLayer.listEntry.style.backgroundColor = "white";
            selectedLayer = null;
        }
        selectedTool = tool;
        selectedTool.listEntry.style.backgroundColor = "red";
    }
    //TESTOWE NARZĘDZIE
    var svg = document.createElementNS(svgURI, "rect");
    var testToolHtmlElement = document.createElement("li");
    var testTool = new Tool("testTool", svg, testToolHtmlElement);
    testToolHtmlElement.innerHTML = testTool.name;
    testToolHtmlElement.addEventListener("click", function (e) {
        clearLayerHandles();
        selectTool(testTool);
    });
    (_a = toolbarCategoryShapes.firstElementChild) === null || _a === void 0 ? void 0 : _a.appendChild(testToolHtmlElement);
    //Warstwy
    var Layer = /** @class */ (function () {
        function Layer(name, svgElement, svgType, listEntry) {
            this.name = name;
            this.svgElement = svgElement;
            this.svgType = svgType;
            this.isSelected = false;
            this.listEntry = listEntry;
        }
        Layer.prototype.remove = function (layersList) {
            this.listEntry.remove();
            this.svgElement.remove();
            //let thisIndex: number;
            for (var x in layersList) {
                if (layersList[x][0] == this.name) {
                    layersList.splice(parseInt(x), 1);
                    break;
                }
            }
        };
        return Layer;
    }());
    var layers = new Array();
    var selectedLayer = null;
    function createLayerHandles(layer) {
        var x = layer.svgElement.getAttribute("x");
        var y = layer.svgElement.getAttribute("y");
        var width = layer.svgElement.getAttribute("width");
        var height = layer.svgElement.getAttribute("height");
        var handleTop = document.createElementNS(svgURI, "circle");
        var handleBottom = document.createElementNS(svgURI, "circle");
        var handleLeft = document.createElementNS(svgURI, "circle");
        var handleRight = document.createElementNS(svgURI, "circle");
        var handleTopLeft = document.createElementNS(svgURI, "circle");
        var handleTopRight = document.createElementNS(svgURI, "circle");
        var handleBottomLeft = document.createElementNS(svgURI, "circle");
        var handleBottomRight = document.createElementNS(svgURI, "circle");
        //handleTop
        var cx = parseFloat(x) + parseFloat(width) / 2;
        var cy = parseFloat(y);
        handleTop.setAttribute("cx", cx.toString());
        handleTop.setAttribute("cy", cy.toString());
        handleTop.setAttribute("r", "7");
        handleTop.setAttribute("stroke", "black");
        handleTop.setAttribute("stroke-width", "3");
        handleTop.setAttribute("fill", "white");
        handleTop.setAttribute("class", "layer-handle");
        handleTop.setAttribute("id", "top");
        handleTop.addEventListener("mousedown", function (ev) {
            console.log("top handle");
            handleHeld = 'top';
        });
        //handleBottom
        cy = parseFloat(y) + parseFloat(height);
        handleBottom = handleTop.cloneNode(true);
        handleBottom.setAttribute("cy", cy.toString());
        handleTop.setAttribute("id", "bottom");
        //handleLeft
        cy = parseFloat(y) + parseFloat(height) / 2;
        cx = parseFloat(x);
        handleLeft = handleTop.cloneNode(true);
        handleLeft.setAttribute("cx", cx.toString());
        handleLeft.setAttribute("cy", cy.toString());
        handleTop.setAttribute("id", "left");
        //handleRight
        cx = parseFloat(x) + parseFloat(width);
        handleRight = handleLeft.cloneNode();
        handleRight.setAttribute("cx", cx.toString());
        handleTop.setAttribute("id", "right");
        //topleft
        cy = parseFloat(y);
        handleTopLeft = handleLeft.cloneNode();
        handleTopLeft.setAttribute("cy", cy.toString());
        handleTopLeft.setAttribute("id", "top-left");
        //topright
        cx = parseFloat(x) + parseFloat(width);
        handleTopRight = handleTopLeft.cloneNode();
        handleTopRight.setAttribute("cx", cx.toString());
        handleTopRight.setAttribute("id", "top-right");
        //botleft
        cy = parseFloat(y) + parseFloat(height);
        handleBottomLeft = handleTopLeft.cloneNode();
        handleBottomLeft.setAttribute("cy", cy.toString());
        handleBottomLeft.setAttribute("id", "bottom-left");
        //botright
        cx = parseFloat(x) + parseFloat(width);
        handleBottomRight = handleBottomLeft.cloneNode();
        handleBottomRight.setAttribute("cx", cx.toString());
        handleBottomRight.setAttribute("id", "bottom-right");
        svgCanavs.appendChild(handleTop);
        svgCanavs.appendChild(handleBottom);
        svgCanavs.appendChild(handleLeft);
        svgCanavs.appendChild(handleRight);
        svgCanavs.appendChild(handleTopLeft);
        svgCanavs.appendChild(handleTopRight);
        svgCanavs.appendChild(handleBottomLeft);
        svgCanavs.appendChild(handleBottomRight);
    }
    function clearLayerHandles() {
        var _a;
        var handles = document.getElementsByClassName("layer-handle");
        while (handles.length > 0) {
            (_a = handles.item(0)) === null || _a === void 0 ? void 0 : _a.remove();
        }
    }
    function selectLayer(layer) {
        if (selectedLayer != null) {
            selectedLayer.listEntry.style.backgroundColor = "white";
        }
        if (selectedTool != null) {
            selectedTool.listEntry.style.backgroundColor = "white";
            selectedTool = null;
        }
        selectedLayer = layer;
        selectedLayer.listEntry.style.backgroundColor = "red";
    }
    //FUNKCJE
    //Warstwy
    //Dodawanie warstwy
    function addLayer(ev) {
        if (selectedTool) {
            var newSvgElement_1 = selectedTool.svgElement.cloneNode();
            newSvgElement_1.style.pointerEvents = 'none';
            var name_1 = "layer" + layerCounter.toString();
            newSvgElement_1.setAttribute("id", name_1);
            var listEntry_1 = document.createElement("li");
            var newLayer_1 = new Layer(name_1, newSvgElement_1, 'rect', listEntry_1);
            layers.push([name_1, newLayer_1]);
            listEntry_1.setAttribute("id", name_1);
            console.log(layerCounter.toString());
            layerCounter++;
            //Tworzenie nazwy i przycisku usuwania
            var listEntryName = document.createElement("h4");
            listEntryName.innerHTML = name_1;
            listEntryName.style.pointerEvents = 'none';
            listEntry_1.appendChild(listEntryName);
            var deleteButton = document.createElement("button");
            deleteButton.setAttribute("class", "delete-layer-button");
            deleteButton.innerHTML = "Usuń";
            deleteButton.addEventListener("click", function (e) {
                newLayer_1.remove(layers);
                if (selectedLayer == newLayer_1) {
                    selectedLayer = null;
                    clearLayerHandles();
                }
            });
            //Zaznaczanie warstwy z listy
            listEntry_1.addEventListener("click", function (e) {
                var target = e.target;
                var id = target.getAttribute("id");
                for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
                    var x = layers_1[_i];
                    if (x[0] == id) {
                        clearLayerHandles();
                        selectLayer(x[1]);
                        createLayerHandles(x[1]);
                    }
                }
            });
            toolbarLayers.appendChild(listEntry_1);
            selectLayer(newLayer_1);
            // let targetElement = ev.target as HTMLElement;
            // let targetRect = targetElement.getBoundingClientRect();
            // let x = ev.clientX - targetRect.left; //x position within the element.
            // let y = ev.clientY - targetRect.top;  //y position within the element.
            svgCanavs.appendChild(newSvgElement_1);
            //Przypisywanie domyślnych wartości dla nowej warstwy
            newSvgElement_1.setAttribute("height", "100");
            newSvgElement_1.setAttribute("width", "100");
            newSvgElement_1.setAttribute("fill", "red");
            newSvgElement_1.setAttribute("x", mouseX.toString());
            newSvgElement_1.setAttribute("y", mouseY.toString());
            //Przepisytwanie wartości do odpowiednich pól
            //Tworzenie modyfikowalnych pól x,y,height,width;
            function createParameterField(name, svgAttribute) {
                var xField = document.createElement("div");
                xField.setAttribute("class", "layer-parameter-field");
                xField.setAttribute("id", "layer-parameter-" + name);
                var xInput = document.createElement("input");
                xInput.setAttribute("type", "text");
                xInput.setAttribute("class", "layer-parameter-textinput");
                var xName = document.createElement("h4");
                xName.setAttribute("class", "layer-parameter-name");
                xName.innerHTML = name;
                xField.appendChild(xInput);
                xField.appendChild(xName);
                listEntry_1.appendChild(xField);
                xInput.value = newSvgElement_1.getAttribute(svgAttribute);
            }
            createParameterField('x', 'x');
            createParameterField('y', 'y');
            createParameterField('width', 'width');
            createParameterField('height', 'height');
            //Dopisanie przycisku usuwania na końcu;
            listEntry_1.appendChild(deleteButton);
            clearLayerHandles();
            createLayerHandles(newLayer_1);
        }
    }
    svgCanavs.addEventListener("click", function (e) {
        addLayer(e);
    });
    function scaleElement() {
        if (handleHeld != null && selectedLayer != null) {
            var element = selectedLayer.svgElement;
            switch (handleHeld) {
                case 'top':
                    break;
            }
        }
    }
    setInterval(scaleElement, 100);
};
