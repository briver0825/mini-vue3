var extend = Object.assign;
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

var activeEffect;
var targetMap = new WeakMap();
function track(target, key) {
    if (!activeEffect) {
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
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
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
        activeEffect = this;
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
    activeEffect = null;
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
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "__v_isReadonly" /* IS_READONLY */) {
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
    return !!value["__v_isReadonly" /* IS_READONLY */];
}
function isReactive(value) {
    return !!value["__v_isReactive" /* IS_REACTIVE */];
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
            if (activeEffect) {
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
        handleSetupResult(instance, setupResult);
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
        flag |= 1 /* ELEMENT */;
    }
    else {
        flag |= 2 /* STATEFUL_COMPONENT */;
    }
    // 处理 children 的flag
    if (Array.isArray(children)) {
        flag |= 8 /* ARRAY_CHILDREN */;
    }
    else {
        flag |= 4 /* TEXT_CHILDREN */;
    }
    return flag;
}

function render(vnode, rootContainer) {
    patch(vnode, rootContainer, null);
}
function patch(vnode, container, parentComponent) {
    var type = vnode.type, shapeFlag = vnode.shapeFlag;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                // vnode 是一个component
                // h(App,{},[])
                processComponent(vnode, container, parentComponent);
            }
            else if (shapeFlag & 1 /* ELEMENT */) {
                // vnode 是一个element
                // h('div',{class:'red'},null)
                processElement(vnode, container, parentComponent);
            }
            else if (vnode) {
                // vnode 不是component 和 element 那就可能是一个文本节点
                // h('div',{},[h('p',{},null),'222',this.msg])
                var TextNode = document.createTextNode(vnode);
                container.appendChild(TextNode);
            }
    }
}
function processText(vnode, container) {
    var children = vnode.children;
    var textNode = (vnode.el = document.createTextNode(children));
    container.appendChild(textNode);
}
function processFragment(vnode, container) {
    mountChildren(vnode.children, container, null);
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
    var type = vnode.type, children = vnode.children, props = vnode.props, shapeFlag = vnode.shapeFlag;
    var el = (vnode.el = document.createElement(type));
    //children
    if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(children, el, parentComponent);
    }
    else if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    // props
    for (var key in props) {
        var value = props[key];
        var isOn = function (key) { return /^on[A-Z]*/.test(key); };
        // event
        if (isOn(key)) {
            var event_1 = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event_1, value);
        }
        else {
            // attribute
            el.setAttribute(key, value);
        }
    }
    container.append(el);
}
function mountChildren(children, container, parentComponent) {
    children.forEach(function (child) {
        patch(child, container, parentComponent);
    });
}
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function mountComponent(initinalVNode, container, parentComponent) {
    var instance = createComponentInstance(initinalVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container, instance);
    instance.vnode.el = subTree.el;
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

export { ReactiveEffect, activeEffect, cleanupEffect, computed, createApp, createTextVnode, effect, getCurrentInstance, h, inject, isProxy, isReactive, isReadonly, isRef, provide, proxyRefs, reactive, readonly, ref, renderSlots, shallowReactive, shallowReadonly, stop, track, trackEffects, trigger, triggerEffects, unRef };
