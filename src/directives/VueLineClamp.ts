
/**
 * Original from https://github.com/andrejsharapov/vue3-line-clamp/blob/main/index.js
 * 
 * Modified to emit "clamped" event.
 *  Detection based on https://stackoverflow.com/a/67455839
 */


import {  App } from "vue";

const currentValueProp = "vLineClampValue";
const truncateText = function (el: any, bindings: any) {
  let limit = parseInt(bindings.value);

  if (isNaN(limit)) {
    console.error("Parameter for vue-line-clamp must be a number");
    return;
  } else if (limit !== el[currentValueProp]) {
    el[currentValueProp] = limit;
    el.style.webkitLineClamp = limit ? limit : "";
  }
};

const isTextClamped = (elm: HTMLElement) => elm.scrollHeight > elm.clientHeight

const VueLineClamp = {
  install(app: App, options: any) {

    options = Object.assign(
      {
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

    app.directive("line-clamp", {
      beforeMount(el: HTMLElement) {
        el.style.cssText += styles;
      },
      mounted: (el: HTMLElement, bindings: any) => {
        truncateText(el, bindings)

        el.dispatchEvent(
          new CustomEvent("clamped", {
            bubbles: true,
            detail: isTextClamped(el),
          }),
        )
      },
      updated: (el: HTMLElement, bindings: any) => {
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