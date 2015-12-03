/**
 * Created by Rodey on 2015/12/2.
 */
var iot;
(function (iot) {
    iot._cache = {};
    iot._depth = 3000;
    function dialog(options) {
        var option = options || {}, id = option['id'], dialog;
        if (id) {
            if (iot._cache[id]) {
                dialog = iot._cache[id];
            }
            else {
                dialog = new Dialog(option);
                iot._cache[id] = dialog;
            }
        }
        else {
            id = Date.now() + '-' + Math.random() * 999;
            option['id'] = id;
            dialog = new Dialog(option);
            iot._cache[id] = dialog;
        }
        return dialog;
    }
    iot.dialog = dialog;
    function getDialog(id) {
        var dialog = iot._cache[id];
        if (dialog && dialog instanceof Dialog) {
            return dialog;
        }
        return null;
    }
    iot.getDialog = getDialog;
    /**
     * Dialog Class
     */
    var Dialog = (function () {
        function Dialog(options) {
            this.ok = {};
            this.cancel = {};
            //private vars
            this._domIdPrefix = 'iot-dialog-';
            this._empty = function () { };
            this._eventType = ('ontouchstart' in window || window['TouchEvent']) ? 'touchend' : 'click';
            this.lock = true;
            for (var k in options) {
                this[k] = options[k];
            }
            //初始化
            this._init();
        }
        /**
         * 重置当前属性
         * @param options
         */
        Dialog.prototype.setOptions = function (options) {
            for (var k in options) {
                this[k] = options[k];
            }
        };
        /**
         * 打开指定的dialog对象，并可选的重置该对象属性
         * @param id
         * @param options
         */
        Dialog.prototype.open = function (id, options) {
            if (id) {
                var dialog = iot._cache[id];
                if (dialog && dialog instanceof Dialog) {
                    options && dialog.setOptions(options);
                    dialog.show();
                }
            }
            else {
                this.show();
            }
        };
        /**
         * 关闭指定弹框或者当前弹框
         * @param id
         */
        Dialog.prototype.close = function (id) {
            if (id) {
                var dialog = iot._cache[id];
                if (dialog && dialog instanceof Dialog) {
                    dialog.hide();
                }
                else {
                    this.hide();
                }
            }
            else {
                this.hide();
            }
        };
        /**
         * 设置当前弹框标题
         * @param title
         */
        Dialog.prototype.setTitle = function (title) {
            if (title && '' != title) {
                this._titleDom.innerHTML = title;
            }
            return this;
        };
        /**
         * 设置当前弹框内容
         * @param message
         */
        Dialog.prototype.setMessage = function (message) {
            if (message && '' != message) {
                this._contentDom.innerHTML = message;
            }
            return this;
        };
        /**
         * 设置弹框关闭时间
         * @param time
         */
        Dialog.prototype.setTime = function (time, callback) {
            var _this = this;
            if (!time || Number(time) === 0)
                return;
            this.time = time;
            window.clearTimeout(this._stin);
            this._stin = window.setTimeout(function () {
                _this._stin = null;
                _this.hide();
                callback && (typeof callback === 'function') && callback.call(_this);
            }, this.time * 1000);
        };
        /**
         * 是否开启当前弹框模态
         * @param lock
         */
        Dialog.prototype.isLock = function (lock) {
            this.lock = lock;
            if (this.lock === true && !this._maskDom) {
                this._createMask();
                this._showElement(this._maskDom);
            }
            else {
                this._hideElement(this._maskDom);
            }
            return this;
        };
        /**
         * 当前弹框确认按钮
         * @param text
         * @param callback
         * @returns {iot.Dialog}
         */
        Dialog.prototype.affirm = function (text, callback) {
            this.ok['text'] = text;
            this.ok['callback'] = callback;
            this._okBtn.innerHTML = text;
            return this;
        };
        /**
         * 当前对象取消弹框
         * @param text
         * @param callback
         * @returns {iot.Dialog}
         */
        Dialog.prototype.shut = function (text, callback) {
            this.cancel['text'] = text;
            this.cancel['callback'] = callback;
            this._cancelBtn.innerHTML = text;
            return this;
        };
        /**
         * 显示当前弹框
         */
        Dialog.prototype.show = function () {
            if (this.lock && this._maskDom) {
                this._showElement(this._maskDom);
            }
            this._dom && this._showElement(this._dom);
            return this;
        };
        /**
         * 隐藏当前弹框
         */
        Dialog.prototype.hide = function () {
            this._dom && this._hideElement(this._dom);
            this._maskDom && this._hideElement(this._maskDom);
            return this;
        };
        /**
         * 从dom中移除当前弹框
         */
        Dialog.prototype.remove = function () {
            this._removeEvent();
            this._dom && (this._dom['remove']());
            this._maskDom && (this._maskDom['remove']());
            if (iot._cache[this.id]) {
                iot._cache[this.id] = null;
                delete iot._cache[this.id];
            }
        };
        /**
         * 初始化弹框
         * @private
         */
        Dialog.prototype._init = function () {
            //开始渲染
            this._render();
        };
        /**
         * 开始渲染弹框，创建需要的元素
         * @private
         */
        Dialog.prototype._render = function () {
            //创建背景遮罩
            this.lock && this._createMask();
            //创建主面板
            !this._dom && this._createContanier();
            //创建标题
            this.title && this._createTitle();
            //创建内容区
            this.message && this._createContent();
            //创建按钮区
            this._createButton();
            //监听事件
            this._addEvent();
            //显示弹框
            this.show();
            //设置弹框隐藏时间
            this.time && this.setTime(this.time);
        };
        /**
         * 创建背景遮罩(如果lock为true的话)
         * @private
         */
        Dialog.prototype._createMask = function () {
            var mask = this._addElement('div', document.body);
            mask.setAttribute('class', 'iot-dialog-mask');
            mask.style.display = 'none';
            this._maskDom = mask;
        };
        /**
         * 创建主元素
         * @private
         */
        Dialog.prototype._createContanier = function () {
            if (!this.id) {
                var id = Date.now() + '-' + Math.random() * 999;
                this.id = id;
            }
            //创建主标签
            var frame = document.createDocumentFragment(), contanier = this._addElement('div');
            contanier.setAttribute('class', 'iot-dialog');
            contanier.setAttribute('id', this._domIdPrefix + this.id);
            contanier.style.zIndex = '' + iot._depth++;
            contanier.style.display = 'none';
            if (this.width) {
                contanier.style.width = typeof this.width === 'number' ? this.width + 'px' : this.width;
            }
            if (this.height) {
                contanier.style.height = typeof this.height === 'number' ? this.height + 'px' : this.height;
            }
            this._dom = contanier;
            frame.appendChild(contanier);
            document.body.appendChild(frame);
        };
        /**
         * 创建标题区
         * @private
         */
        Dialog.prototype._createTitle = function () {
            var titleElm = this._addElement('h3');
            titleElm.setAttribute('class', 'iot-dialog-title');
            titleElm.innerHTML = this.title || '';
            this._titleDom = titleElm;
            this._dom.appendChild(titleElm);
        };
        /**
         * 创建内容区
         * @private
         */
        Dialog.prototype._createContent = function () {
            var messageElm = this._addElement('div');
            messageElm.setAttribute('class', 'iot-dialog-content');
            messageElm.innerHTML = this.message || '';
            this._contentDom = messageElm;
            this._dom.appendChild(messageElm);
        };
        /**
         * 创建按钮
         * @private
         */
        Dialog.prototype._createButton = function () {
            var btnconElm = this._addElement('div');
            btnconElm.setAttribute('class', 'iot-dialog-btn-con');
            this._dom.appendChild(btnconElm);
            if (this.cancel && Object.keys(this.cancel).length !== 0 && !this._cancelBtn) {
                var btn = this._addElement('span', btnconElm);
                btn.setAttribute('class', 'iot-dialog-btn cancel');
                btn.innerHTML = this.cancel.text;
                this._cancelBtn = btn;
            }
            if (this.ok && Object.keys(this.ok).length !== 0 && !this._okBtn) {
                var btn = this._addElement('span', btnconElm);
                btn.setAttribute('class', 'iot-dialog-btn ok');
                btn.innerHTML = this.ok.text;
                this._okBtn = btn;
            }
            /*if(!this._okBtn && !this._cancelBtn){
                this.setTime(this.time || 3);
            }*/
        };
        /**
         * 按钮开始监听事件
         * @private
         */
        Dialog.prototype._addEvent = function () {
            var eventType = this._eventType;
            this._okBtn && this._okBtn.addEventListener(eventType, this._okEventHandler.bind(this), false);
            this._cancelBtn && this._cancelBtn.addEventListener(eventType, this._cancelEventHandler.bind(this), false);
        };
        /**
         * 移除按钮事件监听
         * @private
         */
        Dialog.prototype._removeEvent = function () {
            var eventType = this._eventType;
            this._okBtn && this._okBtn.removeEventListener(eventType, this._okEventHandler.bind(this), false);
            this._cancelBtn && this._cancelBtn.removeEventListener(eventType, this._cancelEventHandler.bind(this), false);
        };
        /**
         * 事件监听回调
         * @param evt
         * @private
         */
        Dialog.prototype._okEventHandler = function (evt) {
            if (this.ok.callback) {
                var result = this.ok.callback.call(this);
                if (result !== false) {
                    this.close();
                }
            }
        };
        Dialog.prototype._cancelEventHandler = function (evt) {
            if (this.cancel.callback) {
                var result = this.cancel.callback.call(this);
                if (result !== false) {
                    this.close();
                }
            }
            else {
                this.close();
            }
        };
        /**
         * 添加标签
         * @param tagname
         * @param parent
         * @returns {HTMLElement}
         */
        Dialog.prototype._addElement = function (tagname, parent) {
            var elm = document.createElement(tagname);
            if (parent) {
                parent.appendChild(elm);
            }
            return elm;
        };
        /**
         * 隐藏元素
         * @param element
         * @private
         */
        Dialog.prototype._showElement = function (element) {
            element.style.display = 'block';
        };
        /**
         * 显示元素
         * @param element
         * @private
         */
        Dialog.prototype._hideElement = function (element) {
            element.style.display = 'none';
        };
        return Dialog;
    })();
    iot.Dialog = Dialog;
})(iot || (iot = {}));
//# sourceMappingURL=iot-dialog.js.map