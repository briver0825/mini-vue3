'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var extend = Object.assign;
var EMPTY_OBJ = {};
var isObject = function (target) { return typeof target === "object"; };
var hasChanged = function (value, newValue) { return !Object.is(value, newValue); };
var hasOwn = function (value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
};
var camelize = function (str) {
    return str.replace(/-(\w)/g, function (_, c) { return (c ? c.toUpperCase() : ""); });
};
var capitalize = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };
var toHandlerKey = function (str) { return (str ? "on" + capitalize(str) : ""); };

exports.activeEffect = void 0;
var targetMap = new WeakMap();
function track(target, key) {
    if (!exports.activeEffect) {
        return;
    }
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    var dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    dep.add(exports.activeEffect);
    exports.activeEffect.deps.push(dep);
}
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    var dep = depsMap.get(key);
    if (!dep) {
        return;
    }
    triggerEffects(dep);
}
function triggerEffects(dep) {
    dep.forEach(function (effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(_fn, scheduler) {
        this._fn = _fn;
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        exports.activeEffect = this;
    }
    ReactiveEffect.prototype.run = function () {
        return this._fn();
    };
    ReactiveEffect.prototype.stop = function () {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    };
    return ReactiveEffect;
}());
function cleanupEffect(effect) {
    effect.deps.forEach(function (dep) {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function effect(fn, options) {
    var _effect = new ReactiveEffect(fn);
    if (options) {
        extend(_effect, options);
    }
    _effect.run();
    exports.activeEffect = null;
    var runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}

var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReactiveGet = createGetter(false, true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly, isShallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (isShallow === void 0) { isShallow = false; }
    return function (target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        var value = Reflect.get(target, key);
        if (isObject(value) && !isShallow) {
            return isReadonly ? readonly(value) : reactive(value);
        }
        if (!isReadonly) {
            track(target, key);
        }
        return value;
    };
}
function createSetter() {
    return function set(target, key, value) {
        var oldValue = Reflect.get(target, key);
        if (hasChanged(oldValue, value)) {
            var result = Reflect.set(target, key, value);
            trigger(target, key);
            return result;
        }
        return oldValue;
    };
}
var mutableHandlers = {
    get: get,
    set: set,
};
var shallowMutableHandlers = extend({}, shallowReactiveGet, {
    get: shallowReadonlyGet,
});
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn("key: ".concat(key, " set \u5931\u8D25 \u56E0\u4E3A target \u662F readonly"), key);
        return true;
    },
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReactive(raw) {
    return createActiveObject(raw, shallowMutableHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.log("target ".concat(raw, " \u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61"));
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}
function isReadonly(value) {
    return !!value["__v_isReadonly" /* ReactiveFlags.IS_READONLY */];
}
function isReactive(value) {
    return !!value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}

var ComputedRefImpl = /** @class */ (function () {
    function ComputedRefImpl(getter) {
        var _this = this;
        this._dirty = true;
        this._getter = getter;
        this._effect = new ReactiveEffect(getter, function () {
            if (!_this._dirty) {
                _this._dirty = true;
            }
        });
    }
    Object.defineProperty(ComputedRefImpl.prototype, "value", {
        get: function () {
            if (this._dirty) {
                this._dirty = false;
                this._value = this._effect.run();
            }
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    return ComputedRefImpl;
}());
function computed(getter) {
    return new ComputedRefImpl(getter);
}

var refImpl = /** @class */ (function () {
    function refImpl(value) {
        this.__v_ref = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    Object.defineProperty(refImpl.prototype, "value", {
        get: function () {
            if (exports.activeEffect) {
                trackEffects(this.dep);
            }
            return this._value;
        },
        set: function (value) {
            if (hasChanged(value, this._rawValue)) {
                this._rawValue = value;
                this._value = convert(value);
                triggerEffects(this.dep);
            }
        },
        enumerable: false,
        configurable: true
    });
    return refImpl;
}());
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new refImpl(value);
}
function isRef(ref) {
    return !!ref.__v_ref;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectwithRefs) {
    return new Proxy(objectwithRefs, {
        get: function (target, key) {
            return unRef(Reflect.get(target, key));
        },
        set: function (target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

function emit(instance, event) {
    var props = instance.props;
    var handlerName = toHandlerKey(camelize(event));
    var handler = props[handlerName];
    handler && handler();
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; },
};
var publicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        if (hasOwn(props, key)) {
            return props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    instance.slots = children;
}

var currentInstance = null;
function createComponentInstance(vnode, parentComponent) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: {},
        isMounted: false,
        subTree: {},
        parent: parentComponent,
        emit: function (instance, event) { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        setCurrentInstance(instance);
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, proxyRefs(setupResult));
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        // 如果是object那么返回的就是context
        instance.setupState = setupResult;
    }
    finishCompoentSetup(instance);
}
function finishCompoentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

var Fragment = Symbol("Fragment");
var Text = Symbol("Text");
function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type, children),
        el: null,
    };
    return vnode;
}
function createTextVnode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type, children) {
    var flag = 0;
    // 处理 element 和 component 的flag
    if (typeof type === "string") {
        flag |= 1 /* ShapeFlags.ELEMENT */;
    }
    else if (type === Text) {
        flag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else {
        flag |= 2 /* ShapeFlags.STATEFUL_COMPONENT */;
    }
    // 处理 children 的flag
    if (Array.isArray(children)) {
        flag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return flag;
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount: function (rootContainer) {
                var vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

function createRender(options) {
    var createTextNode = options.createTextNode, insert = options.insert, createElement = options.createElement, hostPatchProps = options.hostPatchProps, setElementInnerContext = options.setElementInnerContext;
    function render(vnode, rootContainer) {
        patch(null, vnode, rootContainer, null);
    }
    function patch(n1, n2, container, parentComponent) {
        var type = n2.type, shapeFlag = n2.shapeFlag;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // vnode 是一个component
                    // h(App,{},[])
                    processComponent(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // vnode 是一个element
                    // h('div',{class:'red'},null)
                    processElement(n1, n2, container, parentComponent);
                }
                else {
                    // vnode 不是component 和 element 那就可能是一个文本节点
                    // h('div',{},[h('p',{},null),'222',this.msg])
                    insert(createTextNode(n2), container);
                }
        }
    }
    function processText(n1, n2, container) {
        var children = n2.children;
        var textNode = (n2.el = createTextNode(children));
        insert(textNode, container);
    }
    function processFragment(n1, n2, container) {
        mountChildren(n2.children, container, null);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            updateElement(n1, n2);
        }
    }
    function updateElement(n1, n2, container) {
        var oldProps = n1.props || EMPTY_OBJ;
        var newProps = n2.props || EMPTY_OBJ;
        var el = (n2.el = n1.el);
        // 对比props
        patchProps(el, oldProps, newProps);
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (var key in newProps) {
                var prevProp = oldProps[key];
                var nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProps(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (var key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProps(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent) {
        var type = vnode.type, children = vnode.children, props = vnode.props, shapeFlag = vnode.shapeFlag;
        var el = (vnode.el = createElement(type));
        //children
        if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(children, el, parentComponent);
        }
        else if (!!(children.shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */)) {
            var vlaue = children.children;
            insert(createTextNode(vlaue), el);
        }
        else {
            setElementInnerContext(el, children);
        }
        // props
        for (var key in props) {
            var val = props[key];
            hostPatchProps(el, key, null, val);
        }
        insert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach(function (child) {
            patch(null, child, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initinalVNode, container, parentComponent) {
        var instance = createComponentInstance(initinalVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        effect(function () {
            var proxy = instance.proxy;
            if (!instance.isMounted) {
                console.log("init");
                var subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                var subTree = instance.render.call(proxy);
                var preSubTree = instance.subTree;
                instance.vnode.el = subTree.el;
                patch(preSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render),
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    var slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, handleSlotChilren(slot(props)));
        }
    }
}
function handleSlotChilren(slot) {
    return Array.isArray(slot) ? slot : [slot];
}

function provide(key, value) {
    var instance = getCurrentInstance();
    if (instance) {
        var provides = instance.provides;
        provides[key] = value;
    }
}
function inject(key) {
    var instance = getCurrentInstance();
    if (instance) {
        var value = null;
        while (value === null) {
            var parent_1 = instance.parent;
            if (parent_1) {
                if (parent_1.provides[key]) {
                    return parent_1.provides[key];
                }
            }
        }
    }
}

function createTextNode(text) {
    return document.createTextNode(text);
}
function insert(child, container) {
    container.appendChild(child);
}
function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, prevVal, nextVal) {
    var isOn = function (key) { return /^on[A-Z]*/.test(key); };
    // event
    if (isOn(key)) {
        var event_1 = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event_1, nextVal);
    }
    else {
        // attribute
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function setElementInnerContext(el, context) {
    el.textContent = context;
}
var renderer = createRender({
    createTextNode: createTextNode,
    insert: insert,
    createElement: createElement,
    hostPatchProps: patchProps,
    setElementInnerContext: setElementInnerContext,
});
function createApp(rootComponent) {
    return renderer.createApp(rootComponent);
}

exports.ReactiveEffect = ReactiveEffect;
exports.cleanupEffect = cleanupEffect;
exports.computed = computed;
exports.createApp = createApp;
exports.createTextVnode = createTextVnode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
exports.stop = stop;
exports.track = track;
exports.trackEffects = trackEffects;
exports.trigger = trigger;
exports.triggerEffects = triggerEffects;
exports.unRef = unRef;
