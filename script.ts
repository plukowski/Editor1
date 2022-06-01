window.onload = (event) => {
    //DEKLARACJE
    const INTERVAL_RATE = 10;
    const SVG_URI = "http://www.w3.org/2000/svg";
    let layerCounter = 0;

    //Potrzebne do operacji na płótnie
    let handleHeld: string | null = null;
    let remembered: Array<number> = new Array<number>(10);
    function resetGlobalVariables() {
        handleHeld = null;
        for (let x of remembered) {
            x = 0;
        }
    }

    //top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight
    //potrzebne do tego wyżej:
    window.onmouseup = function (e) {
        resetGlobalVariables();
        //console.log("mouseup");
    }

    //śledzenie myszy na płótnie
    let mouseX = 0.0;
    let mouseY = 0.0;
    window.onmousemove = function (ev) {
        let targetElement = svgCanavs;
        let targetRect = targetElement.getBoundingClientRect();
        mouseX = ev.clientX - targetRect.left; //x position within the element.
        mouseY = ev.clientY - targetRect.top;  //y position within the element.
    }


    //Elementy UI
    let svgCanavs = document.querySelector("#svg-canvas") as HTMLElement;
    let toolbarLayers = document.querySelector(".toolbar-layers") as HTMLElement;
    let toolbarCategoryShapes = document.querySelector("#toolbar-category-shapes") as HTMLElement;

    let strokeColorInput = document.getElementById("toolbar-option-color-stroke") as HTMLInputElement;
    strokeColorInput.addEventListener("change", (e) => {
        if (selectedLayer) {
            selectedLayer.svgElement.setAttribute("stroke", strokeColorInput.value);
        }
    })
    let fillColorInput = document.getElementById("toolbar-option-color-fill") as HTMLInputElement;
    fillColorInput.addEventListener("change", (e) => {
        if (selectedLayer) {
            if (fillCheckbox.checked)
                selectedLayer.svgElement.setAttribute("fill", fillColorInput.value);
        }
    })
    let strokeWidth = document.getElementById('toolbar-option-stroke-width') as HTMLInputElement;
    strokeWidth.addEventListener("change", (e) => {
        if (selectedLayer) {
            selectedLayer.svgElement.setAttribute("stroke-width", strokeWidth.value);
        }
    })
    let fillCheckbox = document.getElementById('toolbar-option-fill-checkbox') as HTMLInputElement;
    fillCheckbox.addEventListener("change", (e) => {
        if (selectedLayer) {
            if (fillCheckbox.checked) {
                selectedLayer.svgElement.setAttribute("fill", fillColorInput.value);
            }
            else {
                selectedLayer.svgElement.setAttribute('fill', "#0000");
            }
        }
    })

    //Przyciski zmieniające grubość konturu
    let strokeWidthButtonPlus = document.getElementById("toolbar-option-stroke-width-button+") as HTMLButtonElement;
    let strokeWidthButtonMinus = document.getElementById("toolbar-option-stroke-width-button-") as HTMLButtonElement;
    strokeWidthButtonPlus.addEventListener("click", (e) => {
        let width = document.getElementById("toolbar-option-stroke-width") as HTMLInputElement;
        let newValue = parseInt(width.value);
        newValue++;
        width.value = newValue.toString();
        if (selectedLayer)
            selectedLayer.svgElement.setAttribute("stroke-width", newValue.toString());
    })
    strokeWidthButtonMinus.addEventListener("click", (e) => {
        let width = document.getElementById("toolbar-option-stroke-width") as HTMLInputElement;
        let newValue = parseInt(width.value);
        if (newValue == 1) {

        }
        else {
            newValue--;
            width.value = newValue.toString();
            if (selectedLayer)
                selectedLayer.svgElement.setAttribute("stroke-width", newValue.toString());
        }
    })

    svgCanavs.onmouseleave = function (e) {
        handleHeld = null;
        //console.log("mouseleave");
    }


    //narzędzia
    class Tool {
        name: string;
        svgElement: SVGElement;
        listEntry: HTMLElement;
        //icon: HTMLElement;
        constructor(name: string, svgElement: SVGElement, listEntry: HTMLElement) {
            this.name = name;
            this.svgElement = svgElement;
            //this.icon = icon;
            this.listEntry = listEntry;
        }
    }
    let selectedTool: Tool | null = null;

    function selectTool(tool: Tool) {
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
    let svg = document.createElementNS(SVG_URI, "rect") as SVGElement;
    let testToolHtmlElement = document.createElement("li");
    let testTool = new Tool("testTool", svg, testToolHtmlElement);
    testToolHtmlElement.innerHTML = testTool.name;
    testToolHtmlElement.addEventListener("click", (e) => {
        clearLayerHandles();
        selectTool(testTool);
    })
    toolbarCategoryShapes.firstElementChild?.appendChild(testToolHtmlElement);



    //Warstwy
    class Layer {
        name: string;
        listEntry: HTMLElement;
        svgElement: SVGElement;
        svgType: string;
        isSelected: boolean;
        constructor(name: string, svgElement: SVGElement, svgType: string, listEntry: HTMLElement) {
            this.name = name;
            this.svgElement = svgElement;
            this.svgType = svgType;
            this.isSelected = false;
            this.listEntry = listEntry;
        }
        remove(layersList: Array<[string, Layer]>) {
            this.listEntry.remove();
            this.svgElement.remove();
            //let thisIndex: number;
            for (let x in layersList) {
                if (layersList[x][0] == this.name) {
                    layersList.splice(parseInt(x), 1);
                    break;
                }
            }
        }
        updateListentryParameter(parameter: string, value: string) {
            let parameterField = document.getElementById(this.name + '-' + parameter + '-textinput') as HTMLInputElement;
            parameterField.value = value;
        }

    }


    let layers = new Array<[string, Layer]>();
    let selectedLayer: Layer | null = null;

    function createLayerHandles(layer: Layer) {
        let x = layer.svgElement.getAttribute("x") as string;
        let y = layer.svgElement.getAttribute("y") as string;
        let width = layer.svgElement.getAttribute("width") as string;
        let height = layer.svgElement.getAttribute("height") as string;
        let handleTop = document.createElementNS(SVG_URI, "circle") as SVGElement;
        let handleBottom = document.createElementNS(SVG_URI, "circle") as SVGElement;
        let handleLeft = document.createElementNS(SVG_URI, "circle") as SVGElement;
        let handleRight = document.createElementNS(SVG_URI, "circle") as SVGElement;
        let handleTopLeft = document.createElementNS(SVG_URI, "circle") as SVGElement;
        let handleTopRight = document.createElementNS(SVG_URI, "circle") as SVGElement;
        let handleBottomLeft = document.createElementNS(SVG_URI, "circle") as SVGElement;
        let handleBottomRight = document.createElementNS(SVG_URI, "circle") as SVGElement;

        //handleTop
        let cx = parseFloat(x) + parseFloat(width) / 2;
        let cy = parseFloat(y);
        handleTop.setAttribute("cx", cx.toString());
        handleTop.setAttribute("cy", cy.toString());
        handleTop.setAttribute("r", "7");
        handleTop.setAttribute("stroke", "black");
        handleTop.setAttribute("stroke-width", "3");
        handleTop.setAttribute("fill", "white");
        handleTop.setAttribute("class", "layer-handle");
        handleTop.setAttribute("id", "top");

        handleTop.addEventListener("mousedown", (ev) => {
            handleHeld = 'top';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer?.svgElement.getAttribute("height") as string);
            remembered[3] = parseInt(selectedLayer?.svgElement.getAttribute("y") as string);
        })


        //handleBottom
        cy = parseFloat(y) + parseFloat(height);
        handleBottom = handleTop.cloneNode(true) as SVGElement;
        handleBottom.setAttribute("cy", cy.toString());
        handleBottom.setAttribute("id", "bottom");
        handleBottom.addEventListener("mousedown", (ev) => {
            handleHeld = 'bottom';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer?.svgElement.getAttribute("height") as string);
            remembered[3] = parseInt(selectedLayer?.svgElement.getAttribute("y") as string);
        })

        //handleLeft
        cy = parseFloat(y) + parseFloat(height) / 2
        cx = parseFloat(x);
        handleLeft = handleTop.cloneNode(true) as SVGElement;
        handleLeft.setAttribute("cx", cx.toString());
        handleLeft.setAttribute("cy", cy.toString());
        handleLeft.setAttribute("id", "left");
        handleLeft.addEventListener("mousedown", (ev) => {
            handleHeld = 'left';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer?.svgElement.getAttribute("width") as string);
            remembered[3] = parseInt(selectedLayer?.svgElement.getAttribute("x") as string);
        })

        //handleRight
        cx = parseFloat(x) + parseFloat(width);
        handleRight = handleLeft.cloneNode() as SVGElement;
        handleRight.setAttribute("cx", cx.toString());
        handleRight.setAttribute("id", "right");
        handleRight.addEventListener("mousedown", (ev) => {
            handleHeld = 'right';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer?.svgElement.getAttribute("width") as string);
            remembered[3] = parseInt(selectedLayer?.svgElement.getAttribute("x") as string);
        })

        //topleft
        cy = parseFloat(y);
        handleTopLeft = handleLeft.cloneNode() as SVGElement;
        handleTopLeft.setAttribute("cy", cy.toString());
        handleTopLeft.setAttribute("id", "top-left");
        handleTopLeft.addEventListener("mousedown", (ev) => {
            handleHeld = 'top-left';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer?.svgElement.getAttribute("height") as string);
            remembered[3] = parseInt(selectedLayer?.svgElement.getAttribute("y") as string);
            remembered[4] = parseInt(selectedLayer?.svgElement.getAttribute("width") as string);
            remembered[5] = parseInt(selectedLayer?.svgElement.getAttribute("x") as string);
        })

        //topright
        cx = parseFloat(x) + parseFloat(width);
        handleTopRight = handleTopLeft.cloneNode() as SVGElement;
        handleTopRight.setAttribute("cx", cx.toString());
        handleTopRight.setAttribute("id", "top-right");
        handleTopRight.addEventListener("mousedown", (ev) => {
            handleHeld = 'top-right';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer?.svgElement.getAttribute("height") as string);
            remembered[3] = parseInt(selectedLayer?.svgElement.getAttribute("y") as string);
            remembered[4] = parseInt(selectedLayer?.svgElement.getAttribute("width") as string);
            remembered[5] = parseInt(selectedLayer?.svgElement.getAttribute("x") as string);
        })

        //botleft
        cy = parseFloat(y) + parseFloat(height);
        handleBottomLeft = handleTopLeft.cloneNode() as SVGElement;
        handleBottomLeft.setAttribute("cy", cy.toString());
        handleBottomLeft.setAttribute("id", "bottom-left");
        handleBottomLeft.addEventListener("mousedown", (ev) => {
            handleHeld = 'bottom-left';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer?.svgElement.getAttribute("height") as string);
            remembered[3] = parseInt(selectedLayer?.svgElement.getAttribute("y") as string);
            remembered[4] = parseInt(selectedLayer?.svgElement.getAttribute("width") as string);
            remembered[5] = parseInt(selectedLayer?.svgElement.getAttribute("x") as string);
        })

        //botright
        cx = parseFloat(x) + parseFloat(width);
        handleBottomRight = handleBottomLeft.cloneNode() as SVGElement;
        handleBottomRight.setAttribute("cx", cx.toString());
        handleBottomRight.setAttribute("id", "bottom-right");
        handleBottomRight.addEventListener("mousedown", (ev) => {
            handleHeld = 'bottom-right';
            remembered[0] = mouseX;
            remembered[1] = mouseY;
            remembered[2] = parseInt(selectedLayer?.svgElement.getAttribute("height") as string);
            remembered[3] = parseInt(selectedLayer?.svgElement.getAttribute("y") as string);
            remembered[4] = parseInt(selectedLayer?.svgElement.getAttribute("width") as string);
            remembered[5] = parseInt(selectedLayer?.svgElement.getAttribute("x") as string);
        })

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
        let handles = document.getElementsByClassName("layer-handle");
        while (handles.length > 0) {
            handles.item(0)?.remove();
        }
    }

    function selectLayer(layer: Layer) {
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
    function addLayer(ev: MouseEvent) {
        if (selectedTool) {
            let newSvgElement = selectedTool.svgElement.cloneNode() as SVGElement;
            //newSvgElement.style.pointerEvents = 'none';
            let newLayerName = "layer" + layerCounter.toString();
            newSvgElement.setAttribute("id", newLayerName);
            let listEntry = document.createElement("li") as HTMLLIElement;
            let newLayer = new Layer(newLayerName, newSvgElement, 'rect', listEntry);
            layers.push([newLayerName, newLayer]);

            listEntry.setAttribute("id", newLayerName);
            listEntry.setAttribute("class", "layer-listentry")
            console.log(layerCounter.toString());
            layerCounter++;

            //Tworzenie nazwy i przycisku usuwania
            let listEntryName = document.createElement("h4");
            listEntryName.innerHTML = newLayerName;
            listEntryName.style.pointerEvents = 'none';
            listEntry.appendChild(listEntryName);
            let listEntryContentContainer = document.createElement("div");
            listEntryContentContainer.setAttribute("class", 'layer-listentry-content-container');
            listEntryContentContainer.style.pointerEvents = 'none';
            listEntry.appendChild(listEntryContentContainer);
            let deleteButton = document.createElement("button") as HTMLButtonElement;
            deleteButton.setAttribute("class", "delete-layer-button");
            deleteButton.style.pointerEvents = 'all';
            deleteButton.innerHTML = "Usuń";
            deleteButton.addEventListener("click", (e) => {
                newLayer.remove(layers);
                if (selectedLayer == newLayer) {
                    selectedLayer = null;
                    clearLayerHandles();
                }
            })


            //Zaznaczanie warstwy z listy
            listEntry.addEventListener("click", (e) => {
                let target = e.target as HTMLElement;
                let id = target.getAttribute("id") as string;
                for (let x of layers) {
                    if (x[0] == id) {
                        clearLayerHandles();
                        selectLayer(x[1]);
                        createLayerHandles(x[1]);
                    }
                }
            })
            toolbarLayers.appendChild(listEntry);
            selectLayer(newLayer);
            svgCanavs.appendChild(newSvgElement);

            //Przypisywanie wartości dla nowej warstwy
            //wymiary
            newSvgElement.setAttribute("height", "100");
            newSvgElement.setAttribute("width", "100");
            //kolory
            strokeColorInput = document.getElementById("toolbar-option-color-stroke") as HTMLInputElement;
            fillColorInput = document.getElementById("toolbar-option-color-fill") as HTMLInputElement;
            newSvgElement.setAttribute("stroke", strokeColorInput.value);
            //kontur
            strokeWidth = document.getElementById('toolbar-option-stroke-width') as HTMLInputElement;
            newSvgElement.setAttribute("stroke-width", strokeWidth.value);
            fillCheckbox = document.getElementById('toolbar-option-fill-checkbox') as HTMLInputElement;
            if (fillCheckbox.checked) {
                newSvgElement.setAttribute("fill", fillColorInput.value);
            }
            else {
                newSvgElement.setAttribute("fill", '#0000');
            }


            newSvgElement.setAttribute("x", mouseX.toString());
            newSvgElement.setAttribute("y", mouseY.toString());
            //kliknięcie w SVG na płótnie zaznacza jego warstwę
            newSvgElement.addEventListener("click", (e) => {
                if (selectedLayer != newLayer) {
                    clearLayerHandles();
                    selectLayer(newLayer);
                    createLayerHandles(newLayer);
                }
            })
            //przycisk w dół znaczy że chcemy coś zrobić z warstwą (przemieścić)
            newSvgElement.addEventListener("mousedown", (e) => {
                if (selectedLayer == newLayer) {
                    handleHeld = 'layer';
                    remembered[0] = mouseX - parseInt(newSvgElement.getAttribute("x") as string);
                    remembered[1] = mouseY - parseInt(newSvgElement.getAttribute("y") as string);
                }
            })

            //Tworzenie podglądu wrstwy
            let layerPreview = document.createElementNS(SVG_URI, 'svg') as SVGSVGElement;
            let layerPreviewBackground = document.createElementNS(SVG_URI, 'rect') as SVGRectElement;

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
            function createParameterField(parameterName: string, layerName: string, svgAttribute: string | null, container: HTMLDivElement) {
                let xField = document.createElement("div") as HTMLDivElement;
                xField.setAttribute("class", "layer-parameter-field");
                xField.setAttribute("id", "layer-parameter-" + parameterName);
                let xInput = document.createElement("input") as HTMLInputElement;
                xInput.setAttribute("type", "text");
                xInput.setAttribute("id", layerName + '-' + parameterName + "-textinput");
                let xName = document.createElement("h4");
                xName.setAttribute("class", "layer-parameter-name");
                xName.innerHTML = parameterName;
                xField.appendChild(xInput);
                xField.appendChild(xName);
                container.appendChild(xField);
                if (svgAttribute)
                    xInput.value = newSvgElement.getAttribute(svgAttribute) as string;
                else
                    xInput.value = '0';
            }
            let layerParametersContainer = document.createElement("div");
            layerParametersContainer.setAttribute("class", "layer-parameters-container")
            createParameterField('x', newLayerName, 'x', layerParametersContainer);
            createParameterField('y', newLayerName, 'y', layerParametersContainer);
            createParameterField('width', newLayerName, 'width', layerParametersContainer);
            createParameterField('height', newLayerName, 'height', layerParametersContainer);
            listEntryContentContainer.appendChild(layerParametersContainer);
            //Dopisanie przycisku usuwania na końcu;
            listEntryContentContainer.appendChild(deleteButton)

            clearLayerHandles()
            createLayerHandles(newLayer);
        }
    }


    svgCanavs.addEventListener("click", (e) => {
        addLayer(e);
    });

    function scaleSelectedElement() {
        if (handleHeld != null && selectedLayer != null) {
            let newHeight = parseInt(selectedLayer.svgElement.getAttribute("height") as string);
            let newWidth = parseInt(selectedLayer.svgElement.getAttribute("width") as string);
            let newY = parseInt(selectedLayer.svgElement.getAttribute("y") as string);
            let newX = parseInt(selectedLayer.svgElement.getAttribute("x") as string);
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
            newWidth = parseInt(selectedLayer.svgElement.getAttribute("width") as string);
            newHeight = parseInt(selectedLayer.svgElement.getAttribute("height") as string);
            newX = parseInt(selectedLayer.svgElement.getAttribute("x") as string);
            newY = parseInt(selectedLayer.svgElement.getAttribute("y") as string);
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
            selectedLayer.updateListentryParameter("x", selectedLayer.svgElement.getAttribute("x") as string);
            selectedLayer.updateListentryParameter("y", selectedLayer.svgElement.getAttribute("y") as string);
            clearLayerHandles();
            createLayerHandles(selectedLayer);
        }
    }


    setInterval(() => {
        scaleSelectedElement();
        translateSelectedElement();
    }, INTERVAL_RATE);

}