Sui.namespace('Sui.upload');

/**
 * 文件处理类
 * @class  Sui.upload.FileHandler
 * @constructor
 * @param {Object} config 配置参数
 * @param {Function} config.onSelect  文件被选择后执行
 * @param {Function} config.onDelete  一个文件被删除后执行
 * @param {Function} config.onProgress  一个文件上传过程中执行
 * @param {Function} config.onSuccess  一个文件上传成功时执行
 * @param {Function} config.onFailure  一个文件上传失败时执行
 * @param {Function} config.onComplete  文件全部上传完毕时执行
 * @param {Function} config.onCancel  点击取消上传时执行
 * @param {DOM} config.fileInput 添加文件按钮
 * @param {DOM} config.uploadButton 上传文件按钮
 * @param {DOM} config.cancelButton  取消上传按钮
 */
Sui.upload.FileHandler = {
    fileInput:null,
    uploadButton:null,
    cancelButton:null,
    url:'',
    filteredFiles:[],
    scope:null,                   //作用范围
    filter:function(files) {
        //需要将Object类型的files改为Array
        return files;
    },
    onSelect: function() {},		//
	onDelete: function() {},		//
	onProgress: function() {},		//
	onSuccess: function() {},		//
	onFailure: function() {},		//
	onComplete: function() {},		//
    onCancel: function() {},        //

    /**
     * 类的初始化
     * @method init
     * @private
    **/
    init:function() {
        var self = this;

        if(this.isSupportFileReader()){
            //支持html5新API
            if (this.fileInput) {
                this.fileInput.bind('change', function(e) {
                    self.handleFiles(e);
                });
            }
        }else{
            if(this.fileInput){
                this.fileInput.attr('name', 'attach[]');
                this.fileInput.bind('change',function(e){
                    self.handleFilesComp(e);
                });
            }
        }

        //上传按钮
        if(this.uploadButton){
            this.uploadButton.bind('click',function(e){
                self.uploadFiles();
            })
        }
        //取消上传
        if(this.cancelButton){
            this.cancelButton.bind('click',function(e){
                self.clearFiles();
                self.onCancel();
            })
        }
    } ,
    /**
     * 在不支持FileReader情况下，处理有变化的文件控件
     * @method  handleFilesComp
     * @param {Event} e
    **/
    handleFilesComp:function(e) {

        var self = this;
        self.handleFiles(e);

        //创建一个新的按钮
        $(e.target).hide();
        var container = $(e.target).parent();
        var fileEle = $('<input type="file" name="attach[]">').appendTo(container);
        fileEle.bind('change', function(e) {
            self.handleFilesComp(e);
        });
    },
    /**
     * 处理有变化的文件控件
     * @method handleFiless
     * @param {Event} e
    **/
    handleFiles:function(e){

        var files = [];

        if( this.isSupportFileReader() ){
            files = this.filter( e.target.files || e.dataTransfer.files );
            this.markFiles(files);
        } else{
            var url = e.target.value,
                arr = url.split(/\\|\//g),
                input = e.target;

            //IE6-9需为每个文件创建一个input标签
            files.push({
                src:e.target.value,
                name: arr[arr.length - 1],
                id:null ,
                element: input
            });
            this.markFiles(files);
            input.setAttribute('id', 'input_' + files[0]['id']);
        }

        this.filteredFiles = this.filteredFiles.concat(files);

        this.onSelect(files);
    },
    /**
     * 给每个文件一个单独的标识
     * @method markFiles
     * @param {Array} files
    **/
    markFiles:function(files) {

        var date = new Date();
        for (var i = 0,len = files.length; i < len; i++) {
            files[i].id = date.getTime() + files[i]['name'].replace(/(\.)|(\s+)/g, '_');
        }
    },
    /**
     * 判断文件是否已经在待传输文件列中
     * @method isExist
     * @param {File} file
     * @return {Boolean}
    **/
    isExist:function(file){
        for (var i = 0,len = this.filteredFiles.length; i < len; i++) {
            var exitfile = this.filteredFiles[i];
            if(file.name == exitfile.name && file.size == exitfile.size ){
                return true;
            }
        }
        return false;
    } ,
    /**
     * 通过索引获取待选文件
     * @method getFileById
     * @param {String} id
     * @return {File}
    **/
    getFileById:function(id) {

        var files = this.filteredFiles;
        for (var i = 0 ,len = files.length; i < len; i++) {
            if (files[i]['id'] == id) {
                return files[i];
            }
        }
        return null;
    },
    /**
     * 通过索引删除待选文件
     * @method deleteFileById
     * @param {String} Id
    **/
    deleteFileById: function(Id) {

        var files = this.filteredFiles,arr = [];
        for (var i = 0 ,len = files.length; i < len; i++) {
            if (files[i]['id'] == Id) {
                this.onDelete(files[i]);
                //对于低版本浏览器，仍需删除对应标签
                if (!this.isSupportFileReader()) {
                    $('#input_' + files[i]['id']).remove();
                }
            } else {
                arr.push(files[i]);
            }
        }
        this.filteredFiles = arr;

    },
    /**
     * 清空所有待上传文件
     * @method clearFiles
    **/
    clearFiles: function() {
        var files = this.filteredFiles,arr = [];
        for (var i = 0 ,len = files.length; i < len; i++) {
            this.onDelete(files[i]);
            //对于低版本浏览器，仍需删除对应标签
            if (!this.isSupportFileReader()) {
                $('#input_' + files[i]['id']).remove();
            }
        }
        this.filteredFiles = [];
    },
    /**
     * 删除待选文件
     * @method  deleteFile
     * @param {File}  file
    **/
    deleteFile:function(file) {

        if (file['id']) {
            this.deleteFileById(file['id']);
        } else {
            return false;
        }
    } ,
    /**
     * 上传文件
     * @method uploadFile
    **/
    uploadFiles:function() {

        var self = this;

        if (/file:.*/.test(window.location.protocol)) {
            return; //静态站点页面不提交
        }
        //一次性上传的文件数量限制
        var climit = this.scope.imagesCountLimit;
        if (this.filteredFiles.length > climit) {
            alert('一次性上传的文件数量过多，最多为' + climit + '个');
            return;
        }

        if( !this.filteredFiles.length ){
            alert('目前没有可上传的文件');
            return;
        }

        if(window.FileReader){

            for (var i = 0 ,file; file = this.filteredFiles[i]; i++) {
                (function(file) {
                    var xhr = new XMLHttpRequest();
                    if (xhr.upload) {

                        xhr.upload.addEventListener('progress', function(e) {
                            self.onProgress(file, e.loaded, e.total);
                        }, false);

                        xhr.onreadystatechange = function(e) {
                            if (xhr.readyState == 4) {
                                if (xhr.status == 200) {
                                    self.onSuccess(file, xhr.responseText);
                                    self.deleteFile(file);
                                    if (!self.filteredFiles.length) {
                                        //上传完毕
                                        self.onComplete();
                                    }
                                } else {
                                    self.onFailure(file, xhr.responseText);
                                }
                            }
                        }

                        xhr.open('POST', self.url, true);
                        xhr.setRequestHeader('X_FILENAME', file.name);
                        xhr.send(file);
                    }
                })(file);
            }
        }else{
            //不支持html5文件读取，需要form和iframe配合
            this.scope.form[0].submit();
            this.scope.hideFrame.load(function(e) {
                //上传完毕
                self.onComplete();
                //清除所有文件
                self.clearFiles();
            });
        }
    },
    /**
     *
     * @method
     * @param {}
     * @return
    **/
    isSupportFileReader:function() {

        if(this._isSupport == null){
            this._isSupport = (window.FileReader !== undefined && window.FileReader !== null);
        }
        return this._isSupport;
    }
}

/**
 * 图片上传工具
 * @class Sui.upload.ImageUpload
 * @extends Sui.Container
 * @constructor
 * @param {Object} config  配置参数
 * @param {Number} config.imagesCountLimit 图片数量限制
 * @param {Number} config.imageSizeLimit  图片总大小限制
 * @param {String} config.url 文件上传路径
 * @param {Function} config.onSuccess 一个文件上传成功时执行
 * @param {Function} config.onComplete  所有文件上传成功时执行
 * @param {Function} config.onFailure 一个文件上传失败时执行
 */
Sui.upload.ImageUpload = Sui.extend(Sui.Container,{

    defaultClass:'sui_imgupload',
    itemClass:'sui_imgbox',

    /**
     * 一次性提交上传的图片最大数量
     * @property imagesCountLimit
     * @type Number
     * @default 100
    **/
    imagesCountLimit:100,
    /**
     * 文件大小限制，单位为KB
     * @property imageSizeLimit
     * @type Number
     * @default 500
    **/
    imageSizeLimit:500,

    url:'',

    fileHandler:null,
    filteredFiles:[],

    addButton: null,


    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig:function(config) {
        Sui.upload.ImageUpload.superclass.initConfig.apply(this,arguments);
        Sui.applyProps(this, config, ["imagesCountLimit","imageSizeLimit","url","onSuccess","onComplete","onFailure"]);
    },
    /**
     * 渲染当前组件
     * @method render
     * @param {Object} container
     * @param {Object} insertBefore
     */
    render:function(container, insertBefore) {
        Sui.upload.ImageUpload.superclass.render.apply(this,arguments);

        this.buildDom();
        this.createFileHandler();
    },
    /**
     * 创建文件处理器
     * @method createFileHandler
    **/
    createFileHandler:function() {
        this.fileHandler = $.extend({}, Sui.upload.FileHandler);

        //初始化各项属性
        $.extend(this.fileHandler, {
            url : this.url,
            fileInput: this.addButton,
            uploadButton: this.uploadButton,
            cancelButton: this.cancelButton,
            onSelect: this._onSelect,
            filter : this._fileFilter,
            scope:this ,
            onSuccess:this._onSuccess,
            onFailure:this.onFailure,
            onComplete:this._onComplete,
            onProgress:this._onProgress,
            onCancel:this._onCancel
        });
        this.fileHandler.init();
    },
    /**
     * 渲染表格后执行
     * @method afterRender
     */
    afterRender:function() {
        Sui.upload.ImageUpload.superclass.afterRender.apply(this,arguments);
    } ,
    /**
     * 初始化事件
     * @method initEvent
     */
    initEvent:function() {
       Sui.upload.ImageUpload.superclass.initEvent.apply(this,arguments);
    },
    /**
     * 创建相关标签
     * @method buildDom
     * @private
    **/
    buildDom: function() {

        var dom = this.getApplyToElement();
        this.form = $('<form action="'+ this.url +'" method="post" enctype="multipart/form-data" target="_files_multiple_frame"></form>').appendTo(dom);
        var toolbar = $('<div class="sui_imgtool"></div>').appendTo(this.form);
        var btnwrap = $('<div class="btn">+ 添加图片 </div>').appendTo(toolbar);

        this.addButton = $('<input type="file" multiple accept="image/*">').appendTo(btnwrap);
        this.grid = $('<div class="sui_imggrid"></div>').appendTo(dom);
        this.uploadButton = $('<a class="btn">开始上传</a>').appendTo(toolbar);

        this.cancelButton = $('<a class="btn">取消上传</a>').appendTo(toolbar);

        this.hideFrame = $('<iframe name="_files_multiple_frame" style="display: none;"></iframe>').appendTo(dom);
    },
    /**
     * 创建一个图片单元格
     * @method createImgBox
     * @param {Event} e
     * @param {File} file
    **/
    createImgBox:function(e,file) {

        var self = this,
            imgSrc ;

        var item = $('<div></div>').addClass(this.itemClass).attr('id','_file_'+file.id).appendTo(this.grid);
        var item_con = $('<div></div>').addClass('sui_imgbox_con').appendTo(item);

        if(e){
            imgSrc =  e.target.result;
            var img = $('<img src="' + imgSrc + '">').appendTo(item_con);
        }else{

            var fake = document.createElement('img'),
                _div = document.createElement('div');
            fake.className = 'sui_imgbox_fake';
            item_con.append(fake);
            item_con.append(_div);

            file.element.select();
            file.element.blur();
            imgSrc = document.selection.createRange().text;
            fake.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = imgSrc;

            setTimeout(function(){
                //滤镜图片加载有延时
                var rect = self.clacImgZoomParam(192, 122, fake.offsetWidth, fake.offsetHeight);
                $(fake).remove();

                _div.style.cssText = 'position:absolute;width:' + rect.width + 'px;height:' + rect.height + 'px;top:' + rect.top + 'px;left:' + rect.left
                    + 'px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="'+imgSrc;

            },50);

        }

        var process = $('<span class="process" style="display: none;">0%</span>').appendTo(item_con);
        $('<span class="name">' + file.name + '</span>').appendTo(item_con);
        var remove = $('<span class="remove">删除</span>').attr('data-id', file.id).appendTo(item_con);
        remove.bind('click', function() {
            var _id = $(this).attr('data-id');
            $('#_file_' + _id).remove();
            self.fileHandler.deleteFileById(_id);
        });

    },
    /**
     * 低版本IE下计算图片尺寸
     * @method  clacImgZoomParam
     * @param {Number} maxWidth
     * @param {Number} maxHeight
     * @param {Number} width
     * @param {Number} height
     * @return {Object}
    **/
    clacImgZoomParam : function (maxWidth, maxHeight, width, height) {
        var param = {top:0, left:0, width:width, height:height};
        if (width > maxWidth || height > maxHeight) {
            var rateWidth = width / maxWidth;
            var rateHeight = height / maxHeight;
            if (rateWidth > rateHeight) {
                param.width = maxWidth;
                param.height = Math.round(height / rateWidth);
            } else {
                param.width = Math.round(width / rateHeight);
                param.height = maxHeight;
            }
        }
        param.left = Math.round(( maxWidth - param.width) / 2);
        param.top = Math.round((maxHeight - param.height) / 2);
        return param;
    } ,
    /**
     * 通过文件格式、文件大小过滤文件
     * @method fileFilter
     * @param {Array} files
     * @return {Array}
    **/
    _fileFilter:function(files) {

        if (!window.FileReader) {
            //不支持html5文件读取
            return files;
        }

        var arr = [];
        for (var i = 0,len = files.length; i < len; i++) {
            if( /^image\/(jpeg|png|gif|svg)$/.test(files[i]['type'])){
                if (files[i]['size'] <= this.scope.imageSizeLimit * 1024) {
                    if( !this.isExist(files[i])){
                        arr.push(files[i]);
                    }else{
                        alert('文件已存在。');
                    }
                }else{
                    alert('文件' + files[i]['name'] + '体积过大，不应超过' + this.scope.imageSizeLimit + 'K');
                }
            }else{
                alert('文件' + files[i]['name'] + '不是图片');
            }
        }
        return arr;
    },
    /**
     * 选择文件后执行
     * @method _onSelect
     * @param {Array} files
    **/
    _onSelect:function(files) {
        var self = this;

        if(window.FileReader){

            for (var i = 0,len = files.length; i < len; i++) {
                (function(file) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        self.scope.createImgBox(e, file);
                    }
                    reader.readAsDataURL(file);
                })(files[i]);
            }

        }else {
            for (var i = 0, len = files.length; i < len; i++) {
                (function(file) {
                    self.scope.createImgBox(null, file);
                })(files[i])
            }
        }
    },
    /**
     * 一个文件上传成功时执行
     * @method onSuccess
     * @param {Object} file
     * @param {String} responseText
    **/
    _onSuccess:function(file, responseText) {
        $('#_file_' + file['id']).fadeOut();
        this.scope.onSuccess && this.scope.onSuccess(file, responseText);
    } ,
    /**
     * 一个文件上传失败时执行
     * @method onFailure
     * @param {Object} file
     * @param {String} responseText
    **/
    onFailure:function(file, responseText) {
        $('#_file_' + file['id']).addClass('sui_imgbox-fail');
    } ,
    /**
     * 文件上传过程中执行
     * @method _onProgress
     * @param {Object} file
     * @param {Number} loaded
     * @param {Number} total
     * @private
    **/
    _onProgress:function(file, loaded, total){
        console.log(file.name + ' ________ ' + (loaded / total * 100));
        $('#_file_' + file['id']).find('.process').show().html((loaded / total * 100).toFixed(0) + '%');
    },
    /**
     * 上传过程完成后执行
     * @method _onComplete
     * @private
    **/
    _onComplete:function() {
        this.scope.onComplete && this.scope.onComplete();
    },
    /**
     * 取消上传时执行
     * @method _onCancel
     * @private
    **/
    _onCancel:function() {
        this.scope.grid.html('');
    }

});