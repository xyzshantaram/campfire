/**
 * Tests for DOM manipulation utilities in Campfire.js
 */

import * as chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { nu, extend, store } from '../campfire.ts';

// Setup chai
chai.use(chaiDom);
const expect = chai.expect;

describe('Tests for nu', () => {
    it('should create a div when no args are passed', () => {
        expect(nu().done()[0].tagName).to.equal('DIV');
    });

    it('the new div must be empty', () => {
        expect(nu().done()[0]).to.be.empty;
    });

    it('should parse element string correctly', () => {
        const [elt] = nu('button#click-me.btn.cls').done();
        expect(elt).to.have.class('btn');
        expect(elt).to.have.class('cls');
        expect(elt.id).to.equal('click-me');
        expect(elt.tagName).to.equal('BUTTON');
    });
});

describe('Tests for extend', () => {
    it('should work properly with nu', () => {
        const [elt] = nu('#id', { style: { textAlign: 'center' }, attrs: { 'data-an-attribute': 32 } }).done();
        expect(elt.id).to.equal('id');
        expect(elt.tagName).to.equal('DIV');
        expect(elt).to.have.attr('style', 'text-align: center;');
        expect(elt).to.have.attr('data-an-attribute', '32');
    });

    it('should add styles', () => {
        const [elt] = nu().done();
        extend(elt, { style: { margin: 0 } });
        expect(elt).to.have.attr('style', 'margin: 0px;');
    });

    it('should escape and set contents', () => {
        const [elt] = nu().done();
        extend(elt, { contents: "<b> bold </b>" });
        expect(elt.innerHTML).to.equal('&lt;b&gt; bold &lt;/b&gt;');
    });

    it('should not escape contents with raw flag', () => {
        const [elt] = nu().done();
        extend(elt, { contents: "<b> bold </b>", raw: true });
        expect(elt.innerHTML).to.equal('<b> bold </b>');
    });

    it('should return elements passed in gimme param', () => {
        const [elt, span] = nu(`div#container`, {
            raw: true,
            contents: `<span class=some-span>42</span>`,
            gimme: ['span.some-span']
        }).done();
        expect(elt.id).to.equal('container');
        expect(span.tagName).to.equal('SPAN');
        expect(span).to.have.class('some-span');
        expect(span.innerHTML).to.equal('42');
    });
});

describe('Tests for NuBuilder', () => {
    it('should support fluent method chaining', () => {
        const [btn] = nu('button')
            .content('Click me')
            .attr('type', 'submit')
            .style('backgroundColor', 'blue')
            .style('color', 'white')
            .attr('data-test', 'test-button')
            .on('click', () => { })
            .done();

        expect(btn.tagName).to.equal('BUTTON');
        expect(btn.innerHTML).to.equal('Click me');
        expect(btn).to.have.attr('type', 'submit');
        expect(btn).to.have.attr('data-test', 'test-button');
        expect(btn.style.backgroundColor).to.equal('blue');
        expect(btn.style.color).to.equal('white');
    });

    it('should support multiple style setting via styles method', () => {
        const [div] = nu('div')
            .styles({
                color: 'red',
                fontWeight: 'bold',
                marginTop: '10px'
            })
            .done();

        expect(div.style.color).to.equal('red');
        expect(div.style.fontWeight).to.equal('bold');
        expect(div.style.marginTop).to.equal('10px');
    });

    it('should support multiple attribute setting via attrs method', () => {
        const [input] = nu('input')
            .attrs({
                type: 'text',
                placeholder: 'Enter your name',
                required: 'true'
            })
            .done();

        expect(input).to.have.attr('type', 'text');
        expect(input).to.have.attr('placeholder', 'Enter your name');
        expect(input).to.have.attr('required', 'true');
    });

    it('should support raw HTML content', () => {
        const [div] = nu('div')
            .content('<span>Hello</span>')
            .raw(true)
            .done();

        expect(div.innerHTML).to.equal('<span>Hello</span>');
        expect(div.firstChild?.nodeName).to.equal('SPAN');
    });

    it('should support multiple event listeners', () => {
        const clickHandler = sinon.spy();
        const mouseoverHandler = sinon.spy();

        const [btn] = nu('button')
            .content('Interactive')
            .on('click', clickHandler)
            .on('mouseover', mouseoverHandler)
            .done();

        btn.click();
        btn.dispatchEvent(new MouseEvent('mouseover'));

        expect(clickHandler.calledOnce).to.be.true;
        expect(mouseoverHandler.calledOnce).to.be.true;
    });

    it('should support querying multiple elements with gimme', () => {
        const html = `
            <h2 class="title">Hello</h2>
            <p class="content">Paragraph 1</p>
            <p class="content">Paragraph 2</p>
        `;

        const [container, title, firstContent, secondContent] = nu('div')
            .content(html)
            .raw(true)
            .gimme('.title', '.content:first-of-type', '.content:last-child')
            .done();

        expect(title.innerHTML).to.equal('Hello');
        expect(firstContent.innerHTML).to.equal('Paragraph 1');
        expect(secondContent.innerHTML).to.equal('Paragraph 2');
    });

    it('should handle misc properties', () => {
        const checkbox = document.createElement('input');

        extend(checkbox, {
            misc: { type: 'checkbox', checked: true, disabled: false }
        });

        expect(checkbox.type).to.equal('checkbox');
        expect(checkbox.checked).to.be.true;
        expect(checkbox.disabled).to.be.false;
    });

    it('Slotted children should be preserved across parent updates', () => {
        const greeting = store({ value: 'Hello' });
        const to = store({ value: 'World' });

        const [parent] = nu('div')
            .deps({ greeting })
            .html(({ greeting }) => `<div>Parent: ${greeting}</div><cf-slot name="to"></cf-slot>`)
            .children({
                to: nu('span')
                    .deps({ to })
                    .html(({ to }) => `Child: ${to}`)
                    .done()[0]
            })
            .done();

        expect(parent.innerHTML).to.equal(
            `<div>Parent: Hello</div><span data-cf-reactive="true" data-cf-slot="to">Child: World</span>`
        );

        // Update parent store – child should stay untouched
        greeting.update('Hi');
        expect(parent.innerHTML).to.equal(
            `<div>Parent: Hi</div><span data-cf-reactive="true" data-cf-slot="to">Child: World</span>`
        );

        to.update('Universe');
        expect(parent.innerHTML).to.equal(
            `<div>Parent: Hi</div><span data-cf-reactive="true" data-cf-slot="to">Child: Universe</span>`
        );
    });
});