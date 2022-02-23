'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isObject = function (target) { return typeof target === "object"; };

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var publicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance) {
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishCompoentSetup(instance);
}
function finishCompoentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, rootContainer) {
    patch(vnode, rootContainer);
}
function patch(vnode, container) {
    if (isObject(vnode.type)) {
        // component
        processComponent(vnode, container);
    }
    else if (typeof vnode.type === "string") {
        // element
        processElement(vnode, container);
    }
    else if (typeof vnode === "string") {
        container.textContent = vnode;
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var type = vnode.type, children = vnode.children, props = vnode.props;
    var el = (vnode.el = document.createElement(type));
    //children
    if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    else if (typeof children === "string") {
        el.textContent = children;
    }
    // props
    for (var key in props) {
        var value = props[key];
        el.setAttribute(key, value);
    }
    container.append(el);
}
function mountChildren(children, container) {
    children.forEach(function (child) {
        patch(child, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initinalVNode, container) {
    var instance = createComponentInstance(initinalVNode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
