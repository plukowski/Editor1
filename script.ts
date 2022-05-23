window.onload = (event) => {
    //DEKLARACJE

    const svgURI = "http://www.w3.org/2000/svg";
    let layerCounter = 0;
    let handleHeld: string | null = null;
    //top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight
    //potrzebne do tego wyżej:
    window.onmouseup = function (e) {
        handleHeld = null;
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
    let toolbarCategories = document.querySelector(".toolbar-categories") as HTMLElement;
    let tooblbarPalette = document.querySelector(".toolbar-palette") as HTMLElement;
    let toolbarPaletteAddColorButton = document.querySelector(".toolbar-palette-add-color-button") as HTMLElement;
    let toolbarOptionFillCheckbox = document.querySelector("#toolbar-option-fill-checkbox") as HTMLElement;
    let toolbarLayersAddButton = document.querySelector("#toolbar-layers-add-button") as HTMLElement;
    let toolbarLayers = document.querySelector(".toolbar-layers") as HTMLElement;
    let toolbarCategoryShapes = document.querySelector("#toolbar-category-shapes") as HTMLElement;

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
    let svg = document.createElementNS(svgURI, "rect") as SVGElement;
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

    }


    let layers = new Array<[string, Layer]>();
    let selectedLayer: Layer | null = null;

    function createLayerHandles(layer: Layer) {
        let x = layer.svgElement.getAttribute("x") as string;
        let y = layer.svgElement.getAttribute("y") as string;
        let width = layer.svgElement.getAttribute("width") as string;
        let height = layer.svgElement.getAttribute("height") as string;
        let handleTop = document.createElementNS(svgURI, "circle") as SVGElement;
        let handleBottom = document.createElementNS(svgURI, "circle") as SVGElement;
        let handleLeft = document.createElementNS(svgURI, "circle") as SVGElement;
        let handleRight = document.createElementNS(svgURI, "circle") as SVGElement;
        let handleTopLeft = document.createElementNS(svgURI, "circle") as SVGElement;
        let handleTopRight = document.createElementNS(svgURI, "circle") as SVGElement;
        let handleBottomLeft = document.createElementNS(svgURI, "circle") as SVGElement;
        let handleBottomRight = document.createElementNS(svgURI, "circle") as SVGElement;

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
            console.log("top handle");
            handleHeld = 'top';
        })


        //handleBottom
        cy = parseFloat(y) + parseFloat(height);
        handleBottom = handleTop.cloneNode(true) as SVGElement;
        handleBottom.setAttribute("cy", cy.toString());
        handleTop.setAttribute("id", "bottom");

        //handleLeft
        cy = parseFloat(y) + parseFloat(height) / 2
        cx = parseFloat(x);
        handleLeft = handleTop.cloneNode(true) as SVGElement;
        handleLeft.setAttribute("cx", cx.toString());
        handleLeft.setAttribute("cy", cy.toString());
        handleTop.setAttribute("id", "left");

        //handleRight
        cx = parseFloat(x) + parseFloat(width);
        handleRight = handleLeft.cloneNode() as SVGElement;
        handleRight.setAttribute("cx", cx.toString());
        handleTop.setAttribute("id", "right");

        //topleft
        cy = parseFloat(y);
        handleTopLeft = handleLeft.cloneNode() as SVGElement;
        handleTopLeft.setAttribute("cy", cy.toString());
        handleTopLeft.setAttribute("id", "top-left");

        //topright
        cx = parseFloat(x) + parseFloat(width);
        handleTopRight = handleTopLeft.cloneNode() as SVGElement;
        handleTopRight.setAttribute("cx", cx.toString());
        handleTopRight.setAttribute("id", "top-right");

        //botleft
        cy = parseFloat(y) + parseFloat(height);
        handleBottomLeft = handleTopLeft.cloneNode() as SVGElement;
        handleBottomLeft.setAttribute("cy", cy.toString());
        handleBottomLeft.setAttribute("id", "bottom-left");

        //botright
        cx = parseFloat(x) + parseFloat(width);
        handleBottomRight = handleBottomLeft.cloneNode() as SVGElement;
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
            newSvgElement.style.pointerEvents = 'none';
            let name = "layer" + layerCounter.toString();
            newSvgElement.setAttribute("id", name);
            let listEntry = document.createElement("li") as HTMLLIElement;
            let newLayer = new Layer(name, newSvgElement, 'rect', listEntry);
            layers.push([name, newLayer]);

            listEntry.setAttribute("id", name);
            listEntry.setAttribute("class", "layer-listentry")
            console.log(layerCounter.toString());
            layerCounter++;

            //Tworzenie nazwy i przycisku usuwania
            let listEntryName = document.createElement("h4");
            listEntryName.innerHTML = name;
            listEntryName.style.pointerEvents = 'none';
            listEntry.appendChild(listEntryName);
            let deleteButton = document.createElement("button") as HTMLButtonElement;
            deleteButton.setAttribute("class", "delete-layer-button");
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


            // let targetElement = ev.target as HTMLElement;
            // let targetRect = targetElement.getBoundingClientRect();
            // let x = ev.clientX - targetRect.left; //x position within the element.
            // let y = ev.clientY - targetRect.top;  //y position within the element.
            svgCanavs.appendChild(newSvgElement);

            //Przypisywanie domyślnych wartości dla nowej warstwy
            newSvgElement.setAttribute("height", "100");
            newSvgElement.setAttribute("width", "100");
            newSvgElement.setAttribute("fill", "red");
            newSvgElement.setAttribute("x", mouseX.toString());
            newSvgElement.setAttribute("y", mouseY.toString());
            //Przepisytwanie wartości do odpowiednich pól
            //Tworzenie modyfikowalnych pól x,y,height,width;
            function createParameterField(name: string, svgAttribute: string, container: HTMLDivElement){
                let xField = document.createElement("div") as HTMLDivElement;
                xField.setAttribute("class","layer-parameter-field");
                xField.setAttribute("id","layer-parameter-"+name);
                let xInput = document.createElement("input") as HTMLInputElement;
                xInput.setAttribute("type", "text");
                xInput.setAttribute("class", "layer-parameter-textinput");
                let xName = document.createElement("h4");
                xName.setAttribute("class","layer-parameter-name");
                xName.innerHTML = name;
    
                xField.appendChild(xInput);
                xField.appendChild(xName);
                container.appendChild(xField);
                xInput.value = newSvgElement.getAttribute(svgAttribute) as string;
            }
            let layerParametersContainer = document.createElement("div");
            layerParametersContainer.setAttribute("class","layer-parameters-container")
            createParameterField('x','x',layerParametersContainer);
            createParameterField('y','y',layerParametersContainer);
            createParameterField('width','width',layerParametersContainer);
            createParameterField('height','height',layerParametersContainer);
            listEntry.appendChild(layerParametersContainer);
            //Dopisanie przycisku usuwania na końcu;
            listEntry.appendChild(deleteButton)

            clearLayerHandles()
            createLayerHandles(newLayer);
        }
    }


    svgCanavs.addEventListener("click", (e) => {
        addLayer(e);
    });

    function scaleElement() {
        if (handleHeld != null && selectedLayer != null) {
            let element = selectedLayer.svgElement;
            switch (handleHeld) {
                case 'top':
                        
                    break;
            }
        }
    }

    setInterval(scaleElement, 100);

}