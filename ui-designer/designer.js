/*
 * Sudoclet UI Designer
 * Version 0.1
 *
 * The central idea is that the design is stored independently
 * from the HTML preview.
 *
 * Later, code generators will translate this same object into:
 *
 *   - Jetpack Compose
 *   - SwiftUI
 *   - HTML/CSS
 */


/* ============================================================
   DESIGN MODEL
   ============================================================ */

/*
 * This object is our platform-independent description
 * of the interface element.
 */

const design = {

  type: "button",

  text: "Add Entry",

  width: 180,
  height: 60,

  cornerRadius: 14,

  fontSize: 18,

  backgroundColor: "#5865f2",
  textColor: "#ffffff"

};


/* ============================================================
   GET REFERENCES TO THE HTML CONTROLS
   ============================================================ */

const buttonText =
  document.getElementById("buttonText");

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


/*
 * Output labels beside the sliders.
 */

const buttonWidthValue =
  document.getElementById("buttonWidthValue");

const buttonHeightValue =
  document.getElementById("buttonHeightValue");

const cornerRadiusValue =
  document.getElementById("cornerRadiusValue");

const fontSizeValue =
  document.getElementById("fontSizeValue");


/*
 * The button being displayed in the preview.
 */

const previewButton =
  document.getElementById("previewButton");


/*
 * The <pre> element displaying our JSON design model.
 */

const designModel =
  document.getElementById("designModel");


/* ============================================================
   RENDER THE DESIGN
   ============================================================ */

/*
 * This function takes the values stored in the design object
 * and applies them to the preview.
 *
 * The controls do NOT directly manipulate the preview.
 *
 * Instead:
 *
 *      control
 *         ↓
 *      design model
 *         ↓
 *      render()
 *         ↓
 *      preview
 *
 * That separation will become very useful when we add
 * code generation.
 */

function render() {

  previewButton.textContent =
    design.text;

  previewButton.style.width =
    design.width + "px";

  previewButton.style.height =
    design.height + "px";

  previewButton.style.borderRadius =
    design.cornerRadius + "px";

  previewButton.style.fontSize =
    design.fontSize + "px";

  previewButton.style.backgroundColor =
    design.backgroundColor;

  previewButton.style.color =
    design.textColor;


  /*
   * Update the slider-value displays.
   */

  buttonWidthValue.textContent =
    design.width + " px";

  buttonHeightValue.textContent =
    design.height + " px";

  cornerRadiusValue.textContent =
    design.cornerRadius + " px";

  fontSizeValue.textContent =
    design.fontSize + " px";


  /*
   * Display the underlying design object as formatted JSON.
   */

  designModel.textContent =
    JSON.stringify(design, null, 2);

}


/* ============================================================
   EVENT HANDLERS
   ============================================================ */

/*
 * Each control modifies the design model and then asks
 * render() to redraw the preview.
 */

buttonText.addEventListener("input", function () {

  design.text =
    buttonText.value;

  render();

});


buttonWidth.addEventListener("input", function () {

  design.width =
    Number(buttonWidth.value);

  render();

});


buttonHeight.addEventListener("input", function () {

  design.height =
    Number(buttonHeight.value);

  render();

});


cornerRadius.addEventListener("input", function () {

  design.cornerRadius =
    Number(cornerRadius.value);

  render();

});


fontSize.addEventListener("input", function () {

  design.fontSize =
    Number(fontSize.value);

  render();

});


backgroundColor.addEventListener("input", function () {

  design.backgroundColor =
    backgroundColor.value;

  render();

});


textColor.addEventListener("input", function () {

  design.textColor =
    textColor.value;

  render();

});


/* ============================================================
   INITIAL DISPLAY
   ============================================================ */

/*
 * Draw the initial design when the page first loads.
 */

render();