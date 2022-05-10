// DOM utilities

// format a data entry; if URL, link-ify it
function formatData(data) {
  // if null, return empty string
  if (null === data) return "";
  // if a number, return its repr
  if (typeof data === 'number') {
    return data;
  }
  // if a valid URL, make it a link
  try {
    url = new URL(data);
    return "<a target='_blank' href='" + data + "'>Link</a>";
  }
  // orderwise, return string
  catch (_) {
    return data;
  }
}

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

// linear interpolation
function interpolate(val, minx, maxx, miny, maxy) {
  return miny + (val-minx) / (maxx-minx) * (maxy-miny);
}

// geometry
function dsin(a) {
  return Math.sin(a * Math.PI / 180.0);
}
function dcos(a) {
  return Math.cos(a * Math.PI / 180.0);
}

function ar(a, r) {
  return [r*dsin(a), r*dcos(a)]
}

// create the SVG path commands for an n-gon of radius r
function polygon(n, r) {
  points = []
  da = 360.0/n;
  for (a = da/2; a < 360.0; a += da) {
    points.push(ar(a, r));
  }
  str = "M" + points[0][0] + " " + points[0][1];
  for (i = 1; i < points.length; i++) {
    str += " L" + points[i][0] + " " + points[i][1];
  }
  str += "Z";
  return str;
}