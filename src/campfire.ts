import { empty, insert, onload, rm, select } from "./dom/mod.ts";
import { extend, nu, x } from "./dom/nu.ts";
import { ListStore, MapStore, Store, store } from "./stores/mod.ts";
import { html, r } from "./templating/html.ts";
import { mustache, template } from "./templating/mustache.ts";
import { callbackify, escape, ids, poll, seq, unescape } from "./utils.ts";
import { CfDom } from "./dom/mod.ts";
import { track, tracked, untrack } from "./dom/tracking.ts";

import type { NuBuilder } from "./dom/NuBuilder.ts";
import type { SelectParams } from "./dom/mod.ts";
import type { RawHtmlOptions } from "./templating/html.ts";
import type {
    AnySubscriber,
    ElementPosition,
    ElementProperties,
    EventSubscriber,
    Template,
} from "./types.ts";
import type { Callback, Callbackified } from "./utils.ts";

/**
 * Default export for campfire. Same as doing a synthetic import with
 * `import * as cf from "@campfire/core";`
 */
export default {
    ListStore,
    MapStore,
    Store,
    store,
    nu,
    mustache,
    template,
    escape,
    unescape,
    extend,
    insert,
    empty,
    rm,
    select,
    onload,
    html,
    r,
    seq,
    CfDom,
    callbackify,
    poll,
    ids,
    track,
    tracked,
    untrack,
    x,
};

export {
    callbackify,
    CfDom,
    empty,
    escape,
    extend,
    html,
    ids,
    insert,
    ListStore,
    MapStore,
    mustache,
    nu,
    onload,
    poll,
    r,
    rm,
    select,
    seq,
    Store,
    store,
    template,
    track,
    tracked,
    unescape,
    untrack,
    x,
};

export type {
    AnySubscriber,
    Callback,
    Callbackified,
    ElementPosition,
    ElementProperties,
    EventSubscriber,
    NuBuilder,
    RawHtmlOptions,
    SelectParams,
    Template,
};
