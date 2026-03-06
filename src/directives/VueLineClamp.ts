import { type Plugin, type App, type DirectiveBinding } from "vue";

const currentValueProp = "vLineClampValue";

interface LineClampElement extends HTMLElement {
  [currentValueProp]?: number;
}

interface LineClampOptions {
  useImportant?: boolean;
  textOverflow?: string;
  wordBreak?: string;
}

const truncateText = function (el: LineClampElement, bindings: DirectiveBinding<number>) {
  const limit = parseInt(String(bindings.value));

  if (isNaN(limit)) {
    console.error("Parameter for vue-line-clamp must be a number");
    return;
  } else if (limit !== el[currentValueProp]) {
    el[currentValueProp] = limit;
    el.style.webkitLineClamp = limit ? String(limit) : "";
  }
};

const isTextClamped = (elm: HTMLElement) => elm.scrollHeight > elm.clientHeight

const VueLineClamp: Plugin = {
  install(app: App, options?: LineClampOptions) {
    const opts: Required<LineClampOptions> = Object.assign(
      {
        useImportant: false,
        textOverflow: "",
        wordBreak: "break-word",
      },
      options
    );

    const imp = opts.useImportant ? "!important" : "";
    const styles = `
      display: -webkit-box ${imp};
      -webkit-box-orient: vertical ${imp};
      height: fit-content;
      overflow: hidden ${imp};
      word-break: ${opts.wordBreak} ${imp};
      text-overflow: ${opts.textOverflow} ${imp};
    `;

    app.directive("line-clamp", {
      beforeMount(el: HTMLElement) {
        el.style.cssText += styles;
      },
      mounted: (el: HTMLElement, bindings: DirectiveBinding<number>) => {
        truncateText(el, bindings)

        el.dispatchEvent(
          new CustomEvent("clamped", {
            bubbles: true,
            detail: isTextClamped(el),
          }),
        )
      },
      updated: (el: HTMLElement, bindings: DirectiveBinding<number>) => {
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
