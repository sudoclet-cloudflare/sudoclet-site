/*
    Sudoclet UI Designer
    Version 0.2

    This version introduces:

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
                        Button 1 is positioned relative to container-1.

                        Because container-1 currently has offset (0,0),
                        the button's local and absolute positions are
                        currently identical.
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
};


/* =========================================================
   HTML REFERENCES
   ========================================================= */

const previewSurface =
    document.getElementById("previewSurface");

const designModelDisplay =
    document.getElementById("designModel");


/*
    For version 0.2 the Properties panel edits Button 1 directly.

    Later we will replace this with a general selection system.
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
    For this version we know exactly where Button 1 lives.

    Later we will replace this with a function that finds any object
    in the tree by its unique ID.
*/
function getButton1() {

    return design.surface.children[0].children[0];

}


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


    /*
        Update slider value displays.
    */
    const button =
        getButton1();

    buttonWidthValue.value =
        button.width;

    buttonHeightValue.value =
        button.height;

    cornerRadiusValue.value =
        button.cornerRadius;

    fontSizeValue.value =
        button.fontSize;

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

    getButton1().text =
        buttonText.value;

    render();

});


buttonX.addEventListener("input", function () {

    getButton1().x =
        Number(buttonX.value);

    render();

});


buttonY.addEventListener("input", function () {

    getButton1().y =
        Number(buttonY.value);

    render();

});


buttonWidth.addEventListener("input", function () {

    getButton1().width =
        Number(buttonWidth.value);

    render();

});


buttonHeight.addEventListener("input", function () {

    getButton1().height =
        Number(buttonHeight.value);

    render();

});


cornerRadius.addEventListener("input", function () {

    getButton1().cornerRadius =
        Number(cornerRadius.value);

    render();

});


fontSize.addEventListener("input", function () {

    getButton1().fontSize =
        Number(fontSize.value);

    render();

});


backgroundColor.addEventListener("input", function () {

    getButton1().backgroundColor =
        backgroundColor.value;

    render();

});


textColor.addEventListener("input", function () {

    getButton1().textColor =
        textColor.value;

    render();

});


/* =========================================================
   INITIAL RENDER
   ========================================================= */

/*
    Draw the design when the page first loads.
*/
render();