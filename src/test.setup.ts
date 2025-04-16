import { JSDOM } from "jsdom";
import { use } from "chai";
export { expect } from "chai";
import chaiDom from "chai-dom";
import { CfDom } from "./dom/config.ts";

const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
    url: "http://localhost/",
    pretendToBeVisual: true,
});

const { window } = dom;

export const setupTests = () => {
    CfDom.configure({
        window,
        document: window.document,
        HTMLElement: window.HTMLElement,
    });
    use(chaiDom);
};
