'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var extend = Object.assign;
var isObject = function (target) { return typeof target === "object"; };
var hasChanged = function (value, newValue) { return !Object.is(value, newValue); };

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
        // 如果是object那么返回的就是context
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
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        // vnode 是一个component
        // h(App,{},[])
        processComponent(vnode, container);
    }
    else if (shapeFlag & 1 /* ELEMENT */) {
        // vnode 是一个element
        // h('div',{class:'red'},null)
        processElement(vnode, container);
    }
    else if (vnode) {
        // vnode 不是component 和 element 那就可能是一个文本节点
        // h('div',{},[h('p',{},null),'222',this.msg])
        container.textContent = vnode;
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var type = vnode.type, children = vnode.children, props = vnode.props, shapeFlag = vnode.shapeFlag;
    var el = (vnode.el = document.createElement(type));
    //children
    if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    else if (shapeFlag & 4 /* TEXT_CHILDREN */) {
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
        shapeFlag: getShapeFlag(type, children),
        el: null,
    };
    return vnode;
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
    else if (typeof children === "string") {
        flag |= 4 /* TEXT_CHILDREN */;
    }
    return flag;
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

exports.ReactiveEffect = ReactiveEffect;
exports.cleanupEffect = cleanupEffect;
exports.computed = computed;
exports.createApp = createApp;
exports.effect = effect;
exports.h = h;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
exports.stop = stop;
exports.track = track;
exports.trackEffects = trackEffects;
exports.trigger = trigger;
exports.triggerEffects = triggerEffects;
exports.unRef = unRef;
