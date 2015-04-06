#移动端图片滑动组件介绍说明
使用translate3d和translate都可以，不过translate3d可以使用GPU加速，加快图片的渲染，使图片滑动得更顺滑。改变x轴的值，使图片发生左右位移。

用transition属性，表示从一个值到另一个值的过渡过程

图片为横排列表，所以我们用ul li对图片进行布局

设计为可重用的组件，假设图片从后台返回，获取图片的宽高

##html，css部分
canvas部分（图片画布）设置为与屏幕等宽等高。

注意：
    本来由于canvas里li的图片无法如我们所想的布满全局，所以我在body中设置了height为100%，当设置元素的宽高为100%时，需要有父元素的宽高作为比照，可是由于现在是在body中设置height，无法比照，因此设置body的position为absolute，使得元素的宽高占满布满全局。
    可是由于在移动开发中，为整个页面设置position为absolute极耗内存。当页面中内容较多，占用内存的情况会更加明显，导致的后果：（IOS）浏览器崩溃；（安卓）页面非常“卡”。所以最后没有使用这种方式设置图片高度，而是使用了js来计算图片的宽高。
    设置图片居中显示：
    可以设置相等的line-height和height。不过因为这是移动端的图片滑动组件，所以我们可以有更优雅的解决方式——改变盒模型（-webkit-box），配合-webkit-box-pack和-webkit-box-align使用，可以使图片内容居中
    设置图片并排显示：
    我们没有使用浮动，而是使用绝对定位加上translate3d，因为在制作动画的时候会对单个的li进行操作。

##javascript部分
首先新建图片数组，模拟后台返回的图片数据，数据中包含了图片的宽度，高度以及路径

定义构造函数Slider，通过调用构造函数传入参数生成滑动组件：
        new Slider({
            dom : document.getElementById('canvas'),    //获得dom引用
            list : list     //传入图片数据
        });
在Slider里面进行初始化（init），生成DOM（renderDOM），绑定DOM事件，进行交互（bindDOM）——构造三部曲

>第一步：init()
    定义radio算出窗口长宽比（window.innerHeight/window.innerWidth）；
    定义图片左右滚动一次的距离为屏幕的宽度（window.innerWidth）；
    定义索引值，初始值为0，表示当前图片位于整个图片列表的索引

>第二步：renderDOM()
根据数据生成html：
    根据最外层的canvas生成节点，并保存为变量wrap，设置wrap的高度为窗口的高度
    根据list数据生成图片的数据
    根据list长度生成数据的长度（data.length）
    在dom中新建ul节点，并用outer变量保存，设置宽度为窗口的宽度
    在outer里面创建li节点，用for循环加入图片数据，设置图片的宽度为window的宽度
    图片列表项为等差数列，上一项与下一项的差值为窗口的宽度，所以我们可以设置transform的x轴的值为i*this.scaleW
    通过图片数据的宽高值来决定图片等比缩放的依据是宽还是高，所以就要算出图片的宽高比，并与radio（屏幕的宽高比进行比较）：假如图片宽高比大于radio，说明图片是“长条形”的，所以图片是水平居中的（左右会有空隙），所以图片的高度会等于屏幕的高度（根据高度缩放）；假如图片宽高比小于radio，说明图片是“扁平”的，所以图片垂直居中（上下有空隙），所以图片的宽度等于屏幕的宽度（根据宽度缩放）

>第三步：bindDOM()
    定义self变量，保存this指针。因为this指针在调用的过程中会漂移（即在不同函数中this的指向不同）
    定义scale，保存屏幕的宽度
    定义outer，保存最外层的dom节点
    定义len，保存数据的长度
    定义三个事件：touchstart，touchmove，touchend，分别对应于三个事件处理函数：startHandler，moveHandler，endHandler，并用addEventListener绑定三个事件

三个事件的具体任务如下：
    touchstart：
    当手指在屏幕按下的时候，记录当前手指的位移
    touchmove：
    比较手指的位移
    touchend：
    判断临界值：当位移超过临界值的时候滚动到下一页；当位移不足临界值的时候留在本页

三个事件的具体说明：
    startHandler：
    记录开始位移startX：用touches属性（一个数组，包含手指触摸屏幕的点的集合），由于是单点触摸，所以我们只需要数组的第一项touches[0]，然后记录触摸点的坐标pageX，保存为变量startX
    设置offsetX为0，因为在后面的moveHandler中，根据位移，我们会改变offsetX的值，所以要在这里把它设置为0，避免在下一次触发移动的时候采用之前的offsetX的数据
    记录手指触摸的时间startTime

    moveHandler：
    阻止浏览器的默认行为，因为不同的浏览器在touchmove事件的时候会触发不同的行为
    然后要记录offsetX的值（pageX与startX的差）

    实现移动，需要改变li的translate3d的x坐标值，可是我们不需要改变所有li的x坐标，因为在滑动图片的时候，我们最多只能看到3张图片，所以我们只需要改变这3张图片的坐标值就可以了。那么我们如何知道这三张图片是哪三张呢？首先我们要获取所有的li列表（lis），然后我们要设置循环改变li的位移，应该从哪个li开始呢？我们的初始值应该是当前坐标的上一个（self.idx - 1），而结束值当然就是初始值+3了。在for循环中，我们要改变位移值。那么如何确定位移值的大小呢？方法是，如果lis存在的话，那么我们要改变当前这个li的translate3d的x坐标值（ ((i-self.idx)*self.scaleW + self.offsetX)）

    endHandler：
    定义变量boundary为屏幕的1/6，这是一个临界值，判断图片是否切换
    定义变量endTime，与startTime对比
    获取li的节点集合lis
    判断：
    假如位移值大于等于boundary时，图片切换到上一张；
    假如位移值小于-boundary时，图片切换到下一张；
    假如位移值在±boundary之间，图片不进行切换
    优化判断（保证滑动的流畅性）：
    当用户快速拖动的时候，也许图片的位移值并没有达到临界值boundary，可是用户的目的也是需要切换图片的。所以当“快操作”的情况出现的时候（endTime与startTime的差小于等于800毫秒）
    假如位移值大于50px，图片切换到上一页
    假如位移值小于-50px，图片切换到下一页
    假如位移值在±50px之间，图片不进行切换

>第四步：self.go()
    这个函数实际上是通过DOM节点的操作改变当前图片的状态，我们用-1，+1，0来表示图片是去到上一页，去到下一页还是留在本页。
    用idx表示当前状态（this.idx）
    用cidx表示下一个状态
    保存当前所有图片列表为lis
    获取图片列表的长度为len

    判断go中传进来的是数字还是字符串：
    假如go中传进来的是一个数字，那么我们认为图片直接切换到该页面；
    假如go中传进来的是一个字符串，那么我们认为图片会进行上一页，下一页，留在本页三种行为的判断

    判断图片索引值是否超出图片列表项的总数（索引值是否有效）：
    假如图片索引值从右边超出（即当前图片为最后一张），那么我们使当前索引值等于最后一张图片的索引值
    假如图片索引值从左边超出（即当前图片为第一张），那么我们使当前索引值等于0

    当索引值有效，那么我们就可以改变当前的索引值为cidx

    在我们确定了当前图片的索引值的时候，我们就可以改变translate3d的x轴值：
    当前索引值的translate3d的x轴的值为0，因为当前图片显示在屏幕可视区域内；
    当前索引值的前一项（cidx-1）的translate3d的x轴的值为负的屏幕的宽度；
    当前索引值的后一项（cidx+1）的translate3d的x轴的值为正的屏幕的宽度

    最后为图片设置transition属性，添加图片移动的过渡动画效果为ease-out（淡出）

##遇到的问题以及解决方法：
图片拖动的时候出现延迟的解决方法：
在moveHandler中设置图片的transition属性为none

在手机上做translate3d动画的时候，有可能会出现图片闪烁的情况，解决方法：
为li加上-webkit-backface-visibility: hidden;
