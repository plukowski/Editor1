window.onload = function (event) {
    var _a;
    //DEKLARACJE
    var INTERVAL_RATE = 10;
    var SVG_URI = "http://www.w3.org/2000/svg";
    var layerCounter = 0;
    //Potrzebne do operacji na płótnie
    var handleHeld = null;
    var remembered = new Array(10);
    function resetGlobalVariables() {
        handleHeld = null;
        for (var _i = 0, remembered_1 = remembered; _i < remembered_1.length; _i++) {
            var x = remembered_1[_i];
            x = 0;
        }
    }
    //top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight
    //potrzebne do tego wyżej:
    window.onmouseup = function (e) {
        resetGlobalVariables();
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
    var toolbarLayers = document.querySelector(".toolbar-layers");
    var toolbarCategoryShapes = document.querySelector("#toolbar-category-shapes");
    var strokeColorInput = document.getElementById("toolbar-option-color-stroke");
    strokeColorInput.addEventListener("change", function (e) {
        if (selectedLayer) {
            selectedLayer.svgElement.setAttribute("stroke", strokeColorInput.value);
        }
    });
    var fillColorInput = document.getElementById("toolbar-option-color-fill");
    fillColorInput.addEventListener("change", function (e) {
        if (selectedLayer) {
            if (fillCheckbox.checked)
                selectedLayer.svgElement.setAttribute("fill", fillColorInput.value);
        }
    });
    var strokeWidth = document.getElementById('toolbar-option-stroke-width');
    strokeWidth.addEventListener("change", function (e) {
        if (selectedLayer) {
            selectedLayer.svgElement.setAttribute("stroke-width", strokeWidth.value);
        }
    });
    var fillCheckbox = document.getElementById('toolbar-option-fill-checkbox');
    fillCheckbox.addEventListener("change", function (e) {
        if (selectedLayer) {
            if (fillCheckbox.checked) {
                selectedLayer.svgElement.setAttribute("fill", fillColorInput.value);
            }
            else {
                selectedLayer.svgElement.setAttribute('fill', "#0000");
            }
        }
    });
    //Przyciski zmieniające grubość konturu
    var strokeWidthButtonPlus = document.getElementById("toolbar-option-stroke-width-button+");
    var strokeWidthButtonMinus = document.getElementById("toolbar-option-stroke-width-button-");
    strokeWidthButtonPlus.addEventListener("click", function (e) {
        var width = document.getElementById("toolbar-option-stroke-width");
        var newValue = parseInt(width.value);
        newValue++;
        width.value = newValue.toString();
        if (selectedLayer)
            selectedLayer.svgElement.setAttribute("stroke-width", newValue.toString());
    });
    strokeWidthButtonMinus.addEventListener("click", function (e) {
        var width = document.getElementById("toolbar-option-stroke-width");
        var newValue = parseInt(width.value);
        if (newValue == 1) {
        }
        else {
            newValue--;
            width.value = newValue.toString();
            selectedLayer.svgElement.setAttribute("stroke-width", newValue.toString());
        }
    });
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
    var svg = document.createElementNS(SVG_URI, "rect");
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
        Layer.prototype.updateListentryParameter = function (parameter, value) {
            var parameterField = document.getElementById(this.name + '-' + parameter + '-textinput');
            parameterField.value = value;
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
        var handleTop = document.createElementNS(SVG_URI, "circle");
        var handleBottom = document.createElementNS(SVG_URI, "circle");
        var handleLeft = document.createElementNS(SVG_URI, "circle");
        var handleRight = document.createElementNS(SVG_URI, "circle");
        var handleTopLeft = document.createElementNS(SVG_URI, "circle");
        var handleTopRight = document.createElementNS(SVG_URI, "circle");
        var handleBottomLeft = document.createElementNS(SVG_URI, "circle");
        var handleBottomRight = document.createElementNS(SVG_URI, "circle");
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
            handleHeld = 'top';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("height"));
            remembered[3] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("y"));
        });
        //handleBottom
        cy = parseFloat(y) + parseFloat(height);
        handleBottom = handleTop.cloneNode(true);
        handleBottom.setAttribute("cy", cy.toString());
        handleBottom.setAttribute("id", "bottom");
        handleBottom.addEventListener("mousedown", function (ev) {
            handleHeld = 'bottom';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("height"));
            remembered[3] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("y"));
        });
        //handleLeft
        cy = parseFloat(y) + parseFloat(height) / 2;
        cx = parseFloat(x);
        handleLeft = handleTop.cloneNode(true);
        handleLeft.setAttribute("cx", cx.toString());
        handleLeft.setAttribute("cy", cy.toString());
        handleLeft.setAttribute("id", "left");
        handleLeft.addEventListener("mousedown", function (ev) {
            handleHeld = 'left';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("width"));
            remembered[3] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("x"));
        });
        //handleRight
        cx = parseFloat(x) + parseFloat(width);
        handleRight = handleLeft.cloneNode();
        handleRight.setAttribute("cx", cx.toString());
        handleRight.setAttribute("id", "right");
        handleRight.addEventListener("mousedown", function (ev) {
            handleHeld = 'right';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("width"));
            remembered[3] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("x"));
        });
        //topleft
        cy = parseFloat(y);
        handleTopLeft = handleLeft.cloneNode();
        handleTopLeft.setAttribute("cy", cy.toString());
        handleTopLeft.setAttribute("id", "top-left");
        handleTopLeft.addEventListener("mousedown", function (ev) {
            handleHeld = 'top-left';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("height"));
            remembered[3] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("y"));
            remembered[4] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("width"));
            remembered[5] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("x"));
        });
        //topright
        cx = parseFloat(x) + parseFloat(width);
        handleTopRight = handleTopLeft.cloneNode();
        handleTopRight.setAttribute("cx", cx.toString());
        handleTopRight.setAttribute("id", "top-right");
        handleTopRight.addEventListener("mousedown", function (ev) {
            handleHeld = 'top-right';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("height"));
            remembered[3] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("y"));
            remembered[4] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("width"));
            remembered[5] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("x"));
        });
        //botleft
        cy = parseFloat(y) + parseFloat(height);
        handleBottomLeft = handleTopLeft.cloneNode();
        handleBottomLeft.setAttribute("cy", cy.toString());
        handleBottomLeft.setAttribute("id", "bottom-left");
        handleBottomLeft.addEventListener("mousedown", function (ev) {
            handleHeld = 'bottom-left';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("height"));
            remembered[3] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("y"));
            remembered[4] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("width"));
            remembered[5] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("x"));
        });
        //botright
        cx = parseFloat(x) + parseFloat(width);
        handleBottomRight = handleBottomLeft.cloneNode();
        handleBottomRight.setAttribute("cx", cx.toString());
        handleBottomRight.setAttribute("id", "bottom-right");
        handleBottomRight.addEventListener("mousedown", function (ev) {
            handleHeld = 'bottom-right';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("height"));
            remembered[3] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("y"));
            remembered[4] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("width"));
            remembered[5] = parseInt(selectedLayer === null || selectedLayer === void 0 ? void 0 : selectedLayer.svgElement.getAttribute("x"));
        });
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
            //newSvgElement.style.pointerEvents = 'none';
            var newLayerName = "layer" + layerCounter.toString();
            newSvgElement_1.setAttribute("id", newLayerName);
            var listEntry = document.createElement("li");
            var newLayer_1 = new Layer(newLayerName, newSvgElement_1, 'rect', listEntry);
            layers.push([newLayerName, newLayer_1]);
            listEntry.setAttribute("id", newLayerName);
            listEntry.setAttribute("class", "layer-listentry");
            console.log(layerCounter.toString());
            layerCounter++;
            //Tworzenie nazwy i przycisku usuwania
            var listEntryName = document.createElement("h4");
            listEntryName.innerHTML = newLayerName;
            listEntryName.style.pointerEvents = 'none';
            listEntry.appendChild(listEntryName);
            var listEntryContentContainer = document.createElement("div");
            listEntryContentContainer.setAttribute("class", 'layer-listentry-content-container');
            listEntryContentContainer.style.pointerEvents = 'none';
            listEntry.appendChild(listEntryContentContainer);
            var deleteButton = document.createElement("button");
            deleteButton.setAttribute("class", "delete-layer-button");
            deleteButton.style.pointerEvents = 'all';
            deleteButton.innerHTML = "Usuń";
            deleteButton.addEventListener("click", function (e) {
                newLayer_1.remove(layers);
                if (selectedLayer == newLayer_1) {
                    selectedLayer = null;
                    clearLayerHandles();
                }
            });
            //Zaznaczanie warstwy z listy
            listEntry.addEventListener("click", function (e) {
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
            toolbarLayers.appendChild(listEntry);
            selectLayer(newLayer_1);
            svgCanavs.appendChild(newSvgElement_1);
            //Przypisywanie wartości dla nowej warstwy
            //wymiary
            newSvgElement_1.setAttribute("height", "100");
            newSvgElement_1.setAttribute("width", "100");
            //kolory
            strokeColorInput = document.getElementById("toolbar-option-color-stroke");
            fillColorInput = document.getElementById("toolbar-option-color-fill");
            newSvgElement_1.setAttribute("stroke", strokeColorInput.value);
            //kontur
            strokeWidth = document.getElementById('toolbar-option-stroke-width');
            newSvgElement_1.setAttribute("stroke-width", strokeWidth.value);
            fillCheckbox = document.getElementById('toolbar-option-fill-checkbox');
            if (fillCheckbox.checked) {
                newSvgElement_1.setAttribute("fill", fillColorInput.value);
            }
            else {
                newSvgElement_1.setAttribute("fill", '#0000');
            }
            newSvgElement_1.setAttribute("x", mouseX.toString());
            newSvgElement_1.setAttribute("y", mouseY.toString());
            //kliknięcie w SVG na płótnie zaznacza jego warstwę
            newSvgElement_1.addEventListener("click", function (e) {
                if (selectedLayer != newLayer_1) {
                    clearLayerHandles();
                    selectLayer(newLayer_1);
                    createLayerHandles(newLayer_1);
                }
            });
            //przycisk w dół znaczy że chcemy coś zrobić z warstwą (przemieścić)
            newSvgElement_1.addEventListener("mousedown", function (e) {
                if (selectedLayer == newLayer_1) {
                    handleHeld = 'layer';
                    remembered[0] = mouseX - parseInt(newSvgElement_1.getAttribute("x"));
                    remembered[1] = mouseY - parseInt(newSvgElement_1.getAttribute("y"));
                }
            });
            //Tworzenie podglądu wrstwy
            var layerPreview = document.createElementNS(SVG_URI, 'svg');
            var layerPreviewBackground = document.createElementNS(SVG_URI, 'rect');
            layerPreview.setAttribute('width', '100');
            layerPreview.setAttribute('height', '100');
            layerPreview.style.pointerEvents = 'none';
            layerPreviewBackground.setAttribute('width', '100');
            layerPreviewBackground.setAttribute('height', '100');
            layerPreviewBackground.setAttribute('fill', 'gray');
            layerPreview.append(layerPreviewBackground);
            listEntryContentContainer.appendChild(layerPreview);
            //Przepisytwanie wartości do odpowiednich pól
            //Tworzenie modyfikowalnych pól x,y,height,width;
            function createParameterField(parameterName, layerName, svgAttribute, container) {
                var xField = document.createElement("div");
                xField.setAttribute("class", "layer-parameter-field");
                xField.setAttribute("id", "layer-parameter-" + parameterName);
                var xInput = document.createElement("input");
                xInput.setAttribute("type", "text");
                xInput.setAttribute("id", layerName + '-' + parameterName + "-textinput");
                var xName = document.createElement("h4");
                xName.setAttribute("class", "layer-parameter-name");
                xName.innerHTML = parameterName;
                xField.appendChild(xInput);
                xField.appendChild(xName);
                container.appendChild(xField);
                if (svgAttribute)
                    xInput.value = newSvgElement_1.getAttribute(svgAttribute);
                else
                    xInput.value = '0';
            }
            var layerParametersContainer = document.createElement("div");
            layerParametersContainer.setAttribute("class", "layer-parameters-container");
            createParameterField('x', newLayerName, 'x', layerParametersContainer);
            createParameterField('y', newLayerName, 'y', layerParametersContainer);
            createParameterField('width', newLayerName, 'width', layerParametersContainer);
            createParameterField('height', newLayerName, 'height', layerParametersContainer);
            listEntryContentContainer.appendChild(layerParametersContainer);
            //Dopisanie przycisku usuwania na końcu;
            listEntryContentContainer.appendChild(deleteButton);
            clearLayerHandles();
            createLayerHandles(newLayer_1);
        }
    }
    svgCanavs.addEventListener("click", function (e) {
        addLayer(e);
    });
    function scaleSelectedElement() {
        if (handleHeld != null && selectedLayer != null) {
            var newHeight = parseInt(selectedLayer.svgElement.getAttribute("height"));
            var newWidth = parseInt(selectedLayer.svgElement.getAttribute("width"));
            var newY = parseInt(selectedLayer.svgElement.getAttribute("y"));
            var newX = parseInt(selectedLayer.svgElement.getAttribute("x"));
            switch (handleHeld) {
                case 'top':
                    //remembered:
                    //0 - mouseX
                    //1 - mouseY
                    //2 - height
                    //3 - y
                    newHeight = remembered[2] - (mouseY - remembered[1]);
                    if (newHeight > 0) {
                        newY = remembered[3] - (newHeight - remembered[2]);
                        selectedLayer.svgElement.setAttribute("y", newY.toString());
                        selectedLayer.svgElement.setAttribute("height", newHeight.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    break;
                case 'bottom':
                    //remembered:
                    //0 - mouseX
                    //1 - mouseY
                    //2 - height
                    //3 - y
                    newHeight = remembered[2] + (mouseY - remembered[1]);
                    if (newHeight > 0) {
                        selectedLayer.svgElement.setAttribute("height", newHeight.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    break;
                case 'left':
                    //remembered:
                    //0 - mouseX
                    //1 - mouseY
                    //2 - width
                    //3 - x
                    newWidth = remembered[2] - (mouseX - remembered[0]);
                    if (newWidth > 0) {
                        newX = remembered[3] - (newWidth - remembered[2]);
                        selectedLayer.svgElement.setAttribute("x", newX.toString());
                        selectedLayer.svgElement.setAttribute("width", newWidth.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    break;
                case 'right':
                    //remembered:
                    //0 - mouseX
                    //1 - mouseY
                    //2 - width
                    //3 - x
                    newWidth = remembered[2] + (mouseX - remembered[0]);
                    if (newWidth > 0) {
                        selectedLayer.svgElement.setAttribute("width", newWidth.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    break;
                case 'top-left':
                    //remembered:
                    //0 - mouseX
                    //1 - mouseY
                    //2 - height
                    //3 - y
                    //4 - width
                    //5 - x
                    newHeight = remembered[2] - (mouseY - remembered[1]);
                    if (newHeight > 0) {
                        newY = remembered[3] - (newHeight - remembered[2]);
                        selectedLayer.svgElement.setAttribute("y", newY.toString());
                        selectedLayer.svgElement.setAttribute("height", newHeight.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    newWidth = remembered[4] - (mouseX - remembered[0]);
                    if (newWidth > 0) {
                        newX = remembered[5] - (newWidth - remembered[4]);
                        selectedLayer.svgElement.setAttribute("x", newX.toString());
                        selectedLayer.svgElement.setAttribute("width", newWidth.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    break;
                case 'top-right':
                    //remembered:
                    //0 - mouseX
                    //1 - mouseY
                    //2 - height
                    //3 - y
                    //4 - width
                    //5 - x
                    newHeight = remembered[2] - (mouseY - remembered[1]);
                    if (newHeight > 0) {
                        newY = remembered[3] - (newHeight - remembered[2]);
                        selectedLayer.svgElement.setAttribute("y", newY.toString());
                        selectedLayer.svgElement.setAttribute("height", newHeight.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    newWidth = remembered[4] + (mouseX - remembered[0]);
                    if (newWidth > 0) {
                        selectedLayer.svgElement.setAttribute("width", newWidth.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    break;
                case 'bottom-left':
                    //remembered:
                    //0 - mouseX
                    //1 - mouseY
                    //2 - height
                    //3 - y
                    //4 - width
                    //5 - x
                    newHeight = remembered[2] + (mouseY - remembered[1]);
                    if (newHeight > 0) {
                        selectedLayer.svgElement.setAttribute("height", newHeight.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    newWidth = remembered[4] - (mouseX - remembered[0]);
                    if (newWidth > 0) {
                        newX = remembered[5] - (newWidth - remembered[4]);
                        selectedLayer.svgElement.setAttribute("x", newX.toString());
                        selectedLayer.svgElement.setAttribute("width", newWidth.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    break;
                case 'bottom-right':
                    //remembered:
                    //0 - mouseX
                    //1 - mouseY
                    //2 - height
                    //3 - y
                    //4 - width
                    //5 - x
                    newHeight = remembered[2] + (mouseY - remembered[1]);
                    if (newHeight > 0) {
                        selectedLayer.svgElement.setAttribute("height", newHeight.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    newWidth = remembered[4] + (mouseX - remembered[0]);
                    if (newWidth > 0) {
                        selectedLayer.svgElement.setAttribute("width", newWidth.toString());
                        clearLayerHandles();
                        createLayerHandles(selectedLayer);
                    }
                    break;
            }
            newWidth = parseInt(selectedLayer.svgElement.getAttribute("width"));
            newHeight = parseInt(selectedLayer.svgElement.getAttribute("height"));
            newX = parseInt(selectedLayer.svgElement.getAttribute("x"));
            newY = parseInt(selectedLayer.svgElement.getAttribute("y"));
            selectedLayer.updateListentryParameter("x", newX.toString());
            selectedLayer.updateListentryParameter("y", newY.toString());
            selectedLayer.updateListentryParameter("width", newWidth.toString());
            selectedLayer.updateListentryParameter("height", newHeight.toString());
        }
    }
    //przesuwanie elementu
    function translateSelectedElement() {
        if (handleHeld == 'layer' && selectedLayer != null) {
            //remembered to offsety pozycji myszy od koordynatów warstwy
            selectedLayer.svgElement.setAttribute("x", (mouseX - remembered[0]).toString());
            selectedLayer.svgElement.setAttribute("y", (mouseY - remembered[1]).toString());
            selectedLayer.updateListentryParameter("x", selectedLayer.svgElement.getAttribute("x"));
            selectedLayer.updateListentryParameter("y", selectedLayer.svgElement.getAttribute("y"));
            clearLayerHandles();
            createLayerHandles(selectedLayer);
        }
    }
    setInterval(function () {
        scaleSelectedElement();
        translateSelectedElement();
    }, INTERVAL_RATE);
};
