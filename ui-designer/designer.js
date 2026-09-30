/*
    Sudoclet UI Designer
    Version 0.3

    This version adds button creation and selection.
    The existing coordinate model retains:

        1. A finite root surface.
        2. Dimensionless containers.
        3. Elements positioned relative to containers.
        4. Recursive container rendering.
        5. Absolute screen positions calculated from accumulated offsets.

    IMPORTANT:

    Containers are NOT graphical rectangles.

    A container represents only:

        - an X/Y offset
        - a collection of children

    A container has no width or height and does not perform clipping.

    The root surface provides the visible clipping boundary.
*/


/* =========================================================
   DESIGN MODEL
   ========================================================= */

/*
    This object is the authoritative description of our design.

    Eventually the user will be able to add, remove, move and edit
    everything in this structure through the graphical editor.
*/
const design = {

    surface: {

        width: 390,
        height: 700,

        children: [

            /*
                Container 1 establishes a new coordinate origin.

                Its children are positioned relative to this point.
            */
            {
                id: "container-1",
                type: "container",

                x: 50,
                y: 100,

                children: [

     /*
        Container 2 is positioned relative to Container 1.

        It has no size and is not drawn. It simply establishes
        another coordinate origin for its children.
    */
    {
        id: "container-2",
        type: "container",

        x: 25,
        y: 50,

        children: [

            /*
                Button 1 is now positioned relative to Container 2.
            */
            {
                id: "button-1",
                type: "button",

                x: 105,
                y: 100,

                width: 180,
                height: 60,

                text: "Add Entry",

                cornerRadius: 14,
                fontSize: 18,

                backgroundColor: "#5865f2",
                textColor: "#ffffff"
            }

        ]
    }


                ]
            }

        ]
    }
};


/* =========================================================
   HTML REFERENCES
   ========================================================= */

const previewSurface =
    document.getElementById("previewSurface");

const designModelDisplay =
    document.getElementById("designModel");


/*
    The Properties panel edits whichever button is selected.
*/
const buttonText =
    document.getElementById("buttonText");

const buttonX =
    document.getElementById("buttonX");

const buttonY =
    document.getElementById("buttonY");

const buttonWidth =
    document.getElementById("buttonWidth");

const buttonHeight =
    document.getElementById("buttonHeight");

const cornerRadius =
    document.getElementById("cornerRadius");

const fontSize =
    document.getElementById("fontSize");

const backgroundColor =
    document.getElementById("backgroundColor");

const textColor =
    document.getElementById("textColor");


/* Output fields displayed beside sliders. */

const buttonWidthValue =
    document.getElementById("buttonWidthValue");

const buttonHeightValue =
    document.getElementById("buttonHeightValue");

const cornerRadiusValue =
    document.getElementById("cornerRadiusValue");

const fontSizeValue =
    document.getElementById("fontSizeValue");


/* =========================================================
   MODEL HELPERS
   ========================================================= */

/*
    Search a tree of objects for an object with the requested ID.

    Because containers can contain other containers, this function
    calls itself whenever it encounters an object with children.

    This allows an object to be found regardless of how deeply it
    is nested in the design.
*/
function findObjectById(children, id) {

    for (const child of children) {

        // Did we find the requested object?
        if (child.id === id) {
            return child;
        }

        // If this object has children, search them recursively.
        if (child.children) {

            const result =
                findObjectById(child.children, id);

            // If the recursive search found it, return it.
            if (result) {
                return result;
            }
        }
    }

    // The object does not exist anywhere below this point.
    return null;
}

/*
    Selection belongs to the editor, not to the saved design model.
    Keep the existing first button selected when the page opens.
*/
let selectedButtonId = "button-1";
let nextButtonNumber = 2;

const addButtonControl = document.getElementById("addButton");
const buttonSelector = document.getElementById("buttonSelector");

function getSelectedButton() {
    return findObjectById(design.surface.children, selectedButtonId);
}

/* Find the parent and its accumulated origin, including nested containers. */
function findButtonParent(container, id, originX = 0, originY = 0) {
    for (const child of container.children) {
        if (child.id === id) {
            return { container, originX, originY };
        }
        if (child.type === "container") {
            const result = findButtonParent(
                child, id, originX + child.x, originY + child.y
            );
            if (result) return result;
        }
    }
    return null;
}

/* Load controls only when selection changes, preserving typing while editing. */
function loadSelectedProperties() {
    const button = getSelectedButton();
    buttonText.value = button.text;
    buttonX.value = button.x;
    buttonY.value = button.y;
    buttonWidth.value = button.width;
    buttonHeight.value = button.height;
    cornerRadius.value = button.cornerRadius;
    fontSize.value = button.fontSize;
    backgroundColor.value = button.backgroundColor;
    textColor.value = button.textColor;
    updateSliderValues();
}

function updateSliderValues() {
    const button = getSelectedButton();
    buttonWidthValue.value = button.width;
    buttonHeightValue.value = button.height;
    cornerRadiusValue.value = button.cornerRadius;
    fontSizeValue.value = button.fontSize;
}

function selectButton(id) {
    const button = findObjectById(design.surface.children, id);
    if (!button || button.type !== "button") return;
    selectedButtonId = id;
    buttonSelector.value = id;
    loadSelectedProperties();

    // Update the outline without replacing the focused preview button.
    for (const previewButton of previewSurface.querySelectorAll(".designer-button")) {
        const selected = previewButton.dataset.objectId === id;
        previewButton.classList.toggle("is-selected", selected);
        previewButton.setAttribute("aria-pressed", String(selected));
    }
}

/* A flat list keeps overlapping or off-surface buttons selectable. */
function refreshButtonSelector() {
    buttonSelector.replaceChildren();
    function appendButtons(children) {
        for (const child of children) {
            if (child.type === "container") {
                appendButtons(child.children);
            } else if (child.type === "button") {
                const option = document.createElement("option");
                option.value = child.id;
                option.textContent = child.id + " — " + (child.text || "(empty text)");
                buttonSelector.appendChild(option);
            }
        }
    }
    appendButtons(design.surface.children);
    buttonSelector.value = selectedButtonId;
}

function addButton() {
    const selected = getSelectedButton();
    const parent = findButtonParent(design.surface, selectedButtonId);

    const width = 180;
    const height = 60;
    const gap = 16;

    /*
        Compare bottom edges in local coordinates: these buttons all share
        the same parent. Nested containers and their buttons are separate.
    */
    let lowestBottom = -Infinity;
    for (const child of parent.container.children) {
        if (child.type === "button") {
            lowestBottom = Math.max(lowestBottom, child.y + child.height);
        }
    }
    const x = selected.x;
    const y = lowestBottom + gap;

    // Absolute coordinates are needed only to check the root's clipping edge.
    const absoluteX = parent.originX + x;
    const absoluteY = parent.originY + y;
    const placementMessage = document.getElementById("placementMessage");
    if (absoluteX < 0 || absoluteX + width > design.surface.width ||
        absoluteY < 0 || absoluteY + height > design.surface.height) {
        placementMessage.textContent =
            "Not enough room on the surface to add a button below this container's buttons. " +
            "Move or resize existing buttons, or select a button at a different X position, then try again.";
        return;
    }
    placementMessage.textContent = "";

    // Assign an ID only after placement succeeds; failed attempts add nothing.
    while (findObjectById(design.surface.children, "button-" + nextButtonNumber)) {
        nextButtonNumber++;
    }
    const number = nextButtonNumber++;

    const button = {
        id: "button-" + number,
        type: "button",
        x,
        y,
        width,
        height,
        text: "Button " + number,
        cornerRadius: 14,
        fontSize: 18,
        backgroundColor: "#5865f2",
        textColor: "#ffffff"
    };
    parent.container.children.push(button);
    selectedButtonId = button.id;
    loadSelectedProperties();
    render();
}

addButtonControl.addEventListener("click", addButton);
buttonSelector.addEventListener("change", function () {
    selectButton(buttonSelector.value);
});

/* =========================================================
   RENDERING
   ========================================================= */

/*
    Render one graphical element.

    parentX and parentY contain the accumulated offsets of every
    container above this element in the hierarchy.
*/
function renderElement(element, parentX, parentY) {

    /*
        Calculate the element's absolute position on the surface.

        This is the heart of our coordinate system.
    */
    const absoluteX =
        parentX + element.x;

    const absoluteY =
        parentY + element.y;


    /*
        At the moment we only support buttons.

        More element types will be added later.
    */
    if (element.type === "button") {

        const button =
            document.createElement("button");

        button.classList.add(
            "designer-element",
            "designer-button"
        );

        button.type = "button";
        button.dataset.objectId = element.id;
        button.classList.toggle("is-selected", element.id === selectedButtonId);
        button.setAttribute("aria-pressed", String(element.id === selectedButtonId));
        button.setAttribute("aria-label", element.id + ": " + (element.text || "Empty button"));
        button.addEventListener("click", function () {
            selectButton(element.id);
        });

        button.textContent =
            element.text;


        /*
            Position the button at its calculated absolute position.
        */
        button.style.left =
            absoluteX + "px";

        button.style.top =
            absoluteY + "px";


        /*
            Apply the remaining graphical properties.
        */
        button.style.width =
            element.width + "px";

        button.style.height =
            element.height + "px";

        button.style.borderRadius =
            element.cornerRadius + "px";

        button.style.fontSize =
            element.fontSize + "px";

        button.style.backgroundColor =
            element.backgroundColor;

        button.style.color =
            element.textColor;


        previewSurface.appendChild(button);

    }

}


/*
    Recursively process the children of a container.

    offsetX and offsetY represent the accumulated position of the
    parent container.
*/
function renderChildren(children, offsetX, offsetY) {

    for (const child of children) {

        if (child.type === "container") {

            /*
                Containers aren't drawn.

                Instead, their offsets are added to the accumulated
                offsets passed to their children.

                This is what makes nested containers recursive.
            */
            const newOffsetX =
                offsetX + child.x;

            const newOffsetY =
                offsetY + child.y;


            /*
                Render this container's children using the newly
                calculated coordinate origin.
            */
            renderChildren(
                child.children,
                newOffsetX,
                newOffsetY
            );

        } else {

            /*
                This is a visible element rather than a container.
            */
            renderElement(
                child,
                offsetX,
                offsetY
            );

        }

    }

}


/*
    Render the complete design.
*/
function render() {

    /*
        Remove the previously generated elements.

        The model remains untouched.
    */
    previewSurface.innerHTML = "";


    /*
        Make sure the HTML surface matches the dimensions stored in
        the design model.
    */
    previewSurface.style.width =
        design.surface.width + "px";

    previewSurface.style.height =
        design.surface.height + "px";


    /*
        Begin recursive rendering at the root surface.

        The root coordinate system starts at (0,0).
    */
    renderChildren(
        design.surface.children,
        0,
        0
    );


    /*
        Display the current model so we can inspect it while developing.
    */
    designModelDisplay.textContent =
        JSON.stringify(design, null, 2);


    refreshButtonSelector();
    updateSliderValues();

}


/* =========================================================
   PROPERTY EDITING
   ========================================================= */

/*
    Every control modifies the DESIGN MODEL first.

    We then call render().

    This is an important architectural rule:

        User input
            ↓
        Design model changes
            ↓
        Renderer redraws preview

    The preview itself is never our authoritative source of data.
*/


buttonText.addEventListener("input", function () {

    getSelectedButton().text =
        buttonText.value;

    render();

});


buttonX.addEventListener("input", function () {

    getSelectedButton().x =
        Number(buttonX.value);

    render();

});


buttonY.addEventListener("input", function () {

    getSelectedButton().y =
        Number(buttonY.value);

    render();

});


buttonWidth.addEventListener("input", function () {

    getSelectedButton().width =
        Number(buttonWidth.value);

    render();

});


buttonHeight.addEventListener("input", function () {

    getSelectedButton().height =
        Number(buttonHeight.value);

    render();

});


cornerRadius.addEventListener("input", function () {

    getSelectedButton().cornerRadius =
        Number(cornerRadius.value);

    render();

});


fontSize.addEventListener("input", function () {

    getSelectedButton().fontSize =
        Number(fontSize.value);

    render();

});


backgroundColor.addEventListener("input", function () {

    getSelectedButton().backgroundColor =
        backgroundColor.value;

    render();

});


textColor.addEventListener("input", function () {

    getSelectedButton().textColor =
        textColor.value;

    render();

});


/* =========================================================
   INITIAL RENDER
   ========================================================= */

/*
    Draw the design when the page first loads.
*/
loadSelectedProperties();
render();
