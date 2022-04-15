// DOM utilities

// remove all children from an element
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// set the options of a <select> element
function setOptions(selectEl, options, required=false, findText="") {
  removeAllChildNodes(selectEl);
  // add a null option
  if (!required) {
    var optionEl = document.createElement("option");
    optionEl.setAttribute("value", "");
    optionEl.innerHTML = "None";
    optionEl.style.color = "grey";
    selectEl.appendChild(optionEl);
  }
  // add an option element for each option
  for (let opt of options) {
    optionEl = document.createElement("option");
    optionEl.setAttribute("value", opt);
    optionEl.innerHTML = opt;
    selectEl.appendChild(optionEl);
    if (findText && opt.toUpperCase().includes(findText.toUpperCase())) {
      selectEl.value = opt;
    }
  }
}