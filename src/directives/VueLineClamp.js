
/**
 * Original from https://github.com/andrejsharapov/vue3-line-clamp/blob/main/index.js
 * 
 * Modified to emit "clamped" event.
 *  Detection based on https://stackoverflow.com/a/67455839
 */


const currentValueProp = "vLineClampValue";
const truncateText = function (el, bindings) {
  let limit = parseInt(bindings.value);

  if (isNaN(limit)) {
    console.error("Parameter for vue-line-clamp must be a number");
    return;
  } else if (limit !== el[currentValueProp]) {
    el[currentValueProp] = limit;
    el.style.webkitLineClamp = limit ? limit : "";
  }
};

const isTextClamped = elm => elm.scrollHeight > elm.clientHeight

const VueLineClamp = {
  install(app, options) {

    options = Object.assign(
      {
        useClass: false,
        useImportant: false,
        textOverflow: "",
        wordBreak: "break-word",
      },
      options
    );

    const imp = options.useImportant ? "!important" : "";
    const styles = `
      display: -webkit-box ${imp};
      -webkit-box-orient: vertical ${imp};
      height: fit-content;
      overflow: hidden ${imp};
      word-break: ${options.wordBreak} ${imp};
      text-overflow: ${options.textOverflow} ${imp};
    `;

    if (options.useClass) {
      const stylesheets = window.document.styleSheets;
      const rule = `.vue-line-clamp{${styles}}`;

      if (stylesheets && stylesheets[0] && stylesheets.insertRule) {
        stylesheets.insertRule(rule);
      } else {
        let link = window.document.createElement("style");

        link.appendChild(window.document.createTextNode(rule));
        window.document.head.appendChild(link);
      }
    }

    app.directive("line-clamp", {
      currentValue: 0,

      beforeMount(el) {
        if (!options.useClass) {
          el.style.cssText += styles;
        } else {
          el.classList.add("vue-line-clamp");
        }
      },
      mounted: (el, bindings) => {
        truncateText(el, bindings)

        el.dispatchEvent(
          new CustomEvent("clamped", {
            bubbles: true,
            detail: isTextClamped(el),
          }),
        )
      },
      updated: (el, bindings) => {
        truncateText(el, bindings)

        el.dispatchEvent(
          new CustomEvent("clamped", {
            bubbles: true,
            detail: isTextClamped(el),
          }),
        )
      }
    });
  },
};

export default VueLineClamp;