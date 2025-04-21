// deno-lint-ignore-file no-window no-window-prefix
import cf from "https://esm.sh/campfire.js@4.0.0-rc14";
import { editorReady } from "./editor.js";

window.addEventListener("DOMContentLoaded", () => {
    const mask = document.querySelector("#mask");
    const h1 = document.querySelector("h1");

    const [nav] = cf.nu("nav")
        .styles({
            display: "flex",
            width: "100%",
            justifyContent: "center",
        })
        .done();

    cf.insert([nav], { after: h1 });

    // Tab navigation URLs
    const getTabURL = (name) => {
        const params = new URLSearchParams();
        params.set("tab", name);
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    };

    // Tab visibility function
    const focusTab = (name) => {
        cf.select({ s: ".cf-site-div", all: true }).forEach((elt) => {
            elt.style.display = elt.getAttribute("data-heading") === name ? "block" : "none";
        });

        window.history.pushState({}, "", getTabURL(name));

        Array.from(nav.querySelectorAll("button")).forEach((elem) => {
            elem.classList[elem.innerHTML === name ? "add" : "remove"]("active-tab");
        });
    };

    const sections = ["home", "playground", "docs", "get"];
    sections.forEach((section) => {
        const [button] = cf.nu("button")
            .attr("type", "button")
            .content(section)
            .on("click", function () {
                document.querySelector(".active-tab")?.classList.remove("active-tab");
                this.classList.add("active-tab");
                focusTab(section);
            })
            .done();

        cf.insert([button], { into: nav });
    });

    // Initialize the page
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    focusTab(tab || "home");

    editorReady();
    mask.style.display = "none";
});
