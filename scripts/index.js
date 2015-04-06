var list = [
    {height: 950, width: 800, img: "images/pic1.jpg"},
    {height: 1187, width: 900, img: "images/pic2.jpg"},
    {height: 766, width: 980, img: "images/pic3.jpg"},
    {height: 754, width: 980, img: "images/pic4.jpg"},
    {height: 493, width: 750, img: "images/pic5.jpg"},
    {height: 500, width: 750, img: "images/pic6.jpg"},
    {height: 600, width: 400, img: "images/pic7.jpg"},
    {height: 580, width: 400, img: "images/pic8.jpg"},
    {height: 600, width: 595, img: "images/pic9.jpg"}
];

/*构造函数*/
function Slider(opts) {
    this.wrap = opts.dom;
    this.list = opts.list;  //构造函数需要的参数

    this.init();
    this.renderDOM();
    this.bindDOM(); //构造三步
};

/*初始化*/
Slider.prototype.init = function() {
    this.radio = window.innerHeight/window.innerWidth;  //设定窗口比例
    this.scaleW = window.innerWidth;    //设定一页的宽度
    this.idx = 0;   //设定初始索引值
};

/*根据数据渲染DOM*/
Slider.prototype.renderDOM = function() {
    var wrap = this.wrap;
    var data = this.list;
    var len = data.length;

    this.outer = document.createElement('ul');

    for(var i=0; i<len; i++) {
        var li = document.createElement('li');
        var item = data[i];
        li.style.width = window.innerWidth +'px';
        li.style.webkitTransform = 'translate3d('+ i*this.scaleW +'px, 0, 0)';
        if(item){
            if(item['height']/item['width'] > this.radio){
                li.innerHTML = '<img height="'+ window.innerHeight +'" src="'+ item['img'] +'">';
            }else{
                li.innerHTML = '<img width="'+ window.innerWidth +'" src="'+ item['img'] +'">';
            }
        }
        this.outer.appendChild(li);
        /*根据窗口的比例与图片的比例来确定图片是根据宽度来等比缩放还是根据高度来等比缩放*/
    };

    this.outer.style.cssText = 'width:' + this.scaleW + 'px';  //ul宽度与画布宽度一致

    wrap.style.height = window.innerHeight + 'px';
    wrap.appendChild(this.outer);
};

Slider.prototype.goIndex = function(n) {
    var idx = this.idx;
    var lis = this.outer.getElementsByTagName('li');
    var len = lis.length;
    var cidx;

    if(typeof n == 'number') {
        /*传数字可以直接获得索引*/
        cidx = idx;
    }else if(typeof n == 'string') {
        /*传字符则为索引的变化*/
        cidx = idx + n*1;
    };

    if(cidx > len-1) {
        /*当索引右超出*/
        cidx = len - 1;
    }else if(cidx < 0) {
        /*当索引左超出*/
        cidx = 0;
    };

    /*保留当前索引值*/
    this.idx = cidx;

    /*改变过渡的方式，从无动画变为有动画*/
    lis[cidx].style.webkitTransition = '-webkit-transform 0.2s ease-out';
    lis[cidx-1] && (lis[cidx-1].style.webkitTransition = '-webkit-transform 0.2s ease-out');
    lis[cidx+1] && (lis[cidx+1].style.webkitTransition = '-webkit-transform 0.2s ease-out');

    //改变动画后所应该的位移值
    lis[cidx].style.webkitTransform = 'translate3d(0, 0, 0)';
    lis[cidx-1] && (lis[cidx-1].style.webkitTransform = 'translate3d(-'+ this.scaleW +'px, 0, 0)');
    lis[cidx+1] && (lis[cidx+1].style.webkitTransform = 'translate3d('+ this.scaleW +'px, 0, 0)');
}

/*绑定DOM事件*/
Slider.prototype.bindDOM = function() {
    var self = this;
    var scaleW = self.scaleW;
    var outer = self.outer;
    var len = self.list.length;

    /*手指按下的处理事件*/
    var startHandler = function(evt) {
        self.startTime = new Date()*1;  //记录刚刚开始按下的时间
        self.startX = evt.touches[0].pageX;    //记录手指按下的坐标
        self.offsetX = 0;   //清除偏移量

        /*事件对象*/
        /*var target = evt.target;
        while(target.nodeName != 'LI' && target.nodeName != 'BODY'){
            target = target.parentNode;
        }
        self.target = target;*/
    };

    /*手指移动的处理事件*/
    var moveHandler = function(evt) {
        evt.preventDefault();   //兼容Chrome Android，阻止浏览器的默认行为

        self.offsetX = evt.targetTouches[0].pageX - self.startX;    //计算手指的偏移量
        var lis = outer.getElementsByTagName('li');
        var i = self.idx - 1;   //起始索引
        var m = i + 3;  //结束索引

        for(i; i < m; i++){
            lis[i] && (lis[i].style.webkitTransform = 'translate3d('+ ((i-self.idx)*self.scaleW + self.offsetX) +'px, 0, 0)');
            lis[i] && (lis[i].style.webkitTransition = 'none');
        };
    };

    /*手指抬起的处理事件*/
    var endHandler = function(evt) {
        evt.preventDefault();

        var boundary = scaleW/6;    //计算边界翻页的值
        var endTime = new Date()*1;     //手指抬起的时间值

        var lis = outer.getElementsByTagName('li');     //所有列表项

        /*当手指移动时间超过300ms的时候，按位移算*/
        if(endTime - self.startTime > 300) {
            if(self.offsetX >= boundary) {
                self.goIndex('-1');
            }else if(self.offsetX < 0 && self.offsetX < -boundary) {
                self.goIndex('+1');
            }else{
                self.goIndex('0');
            }
        }else{
            /*优化：使快速移动的时候也可以翻页*/
            if(self.offsetX > 50) {
                self.goIndex('-1');
            }else if(self.offsetX < -50) {
                self.goIndex('+1');
            }else {
                self.goIndex('0');
            }
        };
    };
    /*绑定事件*/
    outer.addEventListener('touchstart', startHandler);
    outer.addEventListener('touchmove', moveHandler);
    outer.addEventListener('touchend', endHandler);
};

/*初始化Slider实例*/
new Slider({
    dom : document.getElementById('canvas'),
    list : list
});
