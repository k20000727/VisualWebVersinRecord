//引入同级目录下的js文件中的变量
// import {HTMLContents} from './HTMLContent.js';

let url = "http://127.0.0.1:5000/Inner";
let url2 = "http://127.0.0.1:5000/Inner2";
let url3 = "http://127.0.0.1:5000/Inner3";
let openWindows = {};  // 存储已打开的窗口
let activeWindow = null;  // 存储当前活动窗口
let counter = 1;
//存储小窗文本内容和要打开的url（HTMLContents对应的HTML内容）的对应关系
const ContentAndUrl = { '数据总览': 1, '统计任务': 2, '首页': 3 , '任务统计结果内容':1000};

const HTMLContents = {
    1: `  <div id="OtherMainBlock">
    <li class="document-toc-item">
      <div id="OtherBasicSQL">
        <div id="inputSection">
          <input type="text" id="textInput" placeholder="请输入VIN码">
          <button onclick="addText()">确认添加</button>
          <button onclick="">查询所有 </button>
        </div>
    
        <div id="outputSection"></div>
    
        <!-- <input type="text" id="queryInput"> -->
        <select id="DataType" class="document-toc-link" style="margin-right: 20px;  display: inline-block;">
          <option value="">--选择要查看的数据类型--</option>
          <option value="车辆总体运行状况">车辆总体运行状况</option>
          <option value="发动机运行状况统计">发动机运行状况统计</option>
    
        </select>
        <button onclick="queryData()">表格查询</button>
    
        <div id="tableContainer"></div>
    
        <!-- 图片信息查询 -->
        <input type="text" id="ImagequeryInput">
        <button onclick="ImagequeryData()">图片查询</button>
    
        <div id="ImagequeryContainer"></div>
    
      </div>
    </li>
    <div id="container">
    
      <div class="chart" id="chart"></div>
      <!-- 右侧坐标轴页面内容 -->
    
    </div>
    
    </div>
    
    `,
    2: `    <div id="OtherMainBlock">
    <li class="document-toc-item">
        <div id="OtherBasicSQL">
            <div id="inputSection" style="margin-left: 150px; display: inline;">
                <input type="text" id="textInput" placeholder="请输入VIN码">
                <button onclick="addText()">确认添加</button>
                <!-- <button onclick="">查询所有 </button> -->
            </div>
    
    
    
            <!-- <input type="text" id="queryInput"> -->
            <select id="YearSelect" class="document-toc-link"
                style="margin-right: 20px;  margin-left: 20px; display: inline;">
                <option value="0">--选择要查询的数据年份--</option>
                <option value="2023">2023年</option>
    
            </select>
    
    
            <select id="MonthSelect" class="document-toc-link"
                style="margin-right: 10px;  margin-left: 20px; display: inline;">
                <option value="0">--数据月份--</option>
                <option value="01">1月</option>
                <option value="02">2月</option>
                <option value="03">3月</option>
                <option value="04">4月</option>
                <option value="05">5月</option>
                <option value="06">6月</option>
                <option value="07">7月</option>
                <option value="08">8月</option>
                <option value="09">9月</option>
                <option value="10">10月</option>
                <option value="11">11月</option>
                <option value="12">12月</option>
    
    
    
            </select>
            <!-- <button onclick="queryData()">表格查询</button> -->
    
            <button id="CreateTask" style="display: inline; margin-left: 20px;" onclick="createTask()">创建任务</button>
            <div id="outputSection" style="margin-left: 150px;"></div>
            <hr>
    
    
        </div>
    </li>
    
    <div id="TaskList">
        
    </div>
    
    </div>
    
    <script>generateTasks()</script>
    `,
    3: `<div id="DataShowForm">
    </div>
    <div id="Pages"></div>`,
    1000:`<div id="Forms">
    </div>
    <div id="EchartsPointsPicture"></div>
    <div id="Images"></div>`
}
// 创建一个对象来存储已缓存的页面内容
const cache = {};
let windowNum = 0;
let tempurl = 0;
let tempcontent = 0;

function openWindow(content, url) {
    console.log("当前openwindows存储情况：", openWindows);
    //用existingWindow记录对应文本内容的窗口目前打开与否的状态
    const existingWindow = openWindows[content];


    //如果目前cache中还没有保存过目前已经打开（不是这一次要打开的）的窗口内容
    if (!cache[tempurl]) {
        cache[tempurl] = {}; // 创建一个对象来存储该URL的缓存数据
    }

    // 获取 id 为 "content" 的 div 元素，即主要内容组件显示窗口
    const contentDiv = document.getElementById('content');

    // 使用 innerHTML 属性获取目前网页显示窗口中的HTML 内容，保存在TempContent中
    const TempContent = contentDiv.innerHTML;
    // console.log('正在缓存页面数据：', TempContent);

    //此处需要先保存当前页面（活动页面）的内容到cache中，所以不能使用原本的url（openwindow此次调用的url参数指向的是要打开的网页），需要通过一个tempurl记录目前处于打开状态的网页
    // 将id为"content"的div的innerHTML内容，即目前打开的网页对应的url编号和对应网页内容保存到cache中
    cache[tempurl][tempcontent] = TempContent;
    console.log('缓存后的cache情况:', cache);
    //更新tempurl
    tempurl = url;
    tempcontent = content;
    console.log('当前调用的url：', url);


    // 如果已存在同名窗口，则将焦点切换到已存在的窗口
    if (existingWindow) {
        if (activeWindow === existingWindow) {
            //url等于2，说明触发生成的是任务管理界面，原本Inner2界面中的初始化调用generateTasks函数就需要挪一下位置，直接增添到HTML页面中也不会触发，需要手动调用
            if (url === 2) {
                console.log('触发打开已存在的任务管理');
                generateTasks();

            }
            return; // 如果已存在的窗口已经是活动窗口，则不需要再次激活
        }


        removeActiveClass(); // 移除其他窗口的活动状态
        const windowElement = document.getElementById(existingWindow);
        const windowContentElement = windowElement.querySelector('.window-content');
        if (!windowContentElement) {
            // 如果窗口内容元素不存在，则创建并添加到窗口元素中
            const newWindowContentElement = createWindowContentElement(content, existingWindow, url);
            windowElement.appendChild(newWindowContentElement);
            activeWindow = existingWindow; // 更新活动窗口
            // 在打开窗口时加载其他 HTML 文件的组件
            loadContent(url, 'content', content);
            return;
        }
        windowContentElement.classList.add('active');
        activeWindow = existingWindow; // 更新活动窗口

        // 在打开窗口时加载其他 HTML 文件的组件
        loadContent(url, 'content', content);


        return;
    }

    const windowId = `smallwindow${windowNum}`; // 生成唯一的窗口ID(请注意这里采用的是一个不断自增的变量，因为关闭小窗后再打开会造成id重复问题)
    windowNum += 1;

    // 创建窗口元素
    const windowElement = document.createElement('div');
    windowElement.setAttribute('id', windowId); // 设置窗口ID
    windowElement.classList.add('window');

    // 创建窗口内容元素并添加到窗口元素中
    const windowContentElement = createWindowContentElement(content, windowId, url);
    windowElement.appendChild(windowContentElement);

    // 将窗口添加到容器中
    const container = document.getElementById('SmallWindows');
    container.appendChild(windowElement);

    // 存储已打开的窗口
    openWindows[content] = windowId;

    // 设置活动窗口
    removeActiveClass();
    windowContentElement.classList.add('active');
    activeWindow = windowId;

    // 加载HTML页面或组件到内容容器中
    loadContent(url, 'content', content);
}

function createWindowContentElement(content, windowId, url) {
    const windowContentElement = document.createElement('div');
    windowContentElement.classList.add('window-content');
    windowContentElement.addEventListener('click', () => {
        openWindow(content, url);
    });

    const aElement = document.createElement('a');
    aElement.textContent = content;
    const deleteBtnElement = document.createElement('div');
    deleteBtnElement.classList.add('delete-btn');
    const deleteButton = document.createElement('button');

    deleteButton.innerHTML = '<svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>';
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡，避免触发父元素的点击事件
        closeWindow(windowId, url);
    });
    deleteBtnElement.appendChild(deleteButton);
    windowContentElement.appendChild(aElement);
    windowContentElement.appendChild(deleteBtnElement);

    // // 添加窗口内容元素到窗口元素中
    // const windowElement = document.getElementById(windowId);
    // if (!windowElement.querySelector('.window-content')) {
    //     windowElement.appendChild(windowContentElement);
    // }


    return windowContentElement;
}

function closeWindow(windowId, url) {
    //很可能存在关闭的窗口并非目前最后一个窗口或者虽然关闭最后一个窗口但当前显示的active窗口并非最后一个窗口的情况，如果使用原有代码会出现点击关闭按钮后content组件显示窗格变为空白的情况
    //这种情况很可能是因为代码顺序有问题且缺失了一定模块功能没有执行。点击关闭按钮后，若按照原有流程，更新后的active活动窗口会变成当前为active状态的activewindow，但实际上应该变成目前处于最后的小窗
    //经查，问题应该是出在了窗口的active状态切换上，详见const windowContentElements之后的代码。原本的代码是将寻找原本就处于active状态的窗口实际上等于没操作
    //现在改为了清除所有窗口的active状态后将active窗口改为最后一个小窗，直觉上应该没完全解决问题，但是好像前端能用了暂时看不出问题来，如果有问题再继续改
    // 查找并删除指定ID的窗口
    const windowElement = document.getElementById(windowId);
    const container = document.getElementById('content');
    if (windowElement) {
        const content = windowElement.querySelector('a').textContent;
        // if(url === tempurl){
        //     container.innerHTML = ''; // 清空容器的内容
        // }
        windowElement.remove();
        delete openWindows[content];
        delete cache[url];


        // 如果关闭的是当前打开处于活动状态的小窗，则需要更新活动窗口
        if(url === tempurl){
            container.innerHTML = ''; // 清空容器的内容
 
            activeWindow = null;
            const windowContentElements = document.getElementsByClassName('window-content');
        // for (let i = 0; i < windowContentElements.length; i++) {
        //     if (windowContentElements[i].classList.contains('active')) {
        //         activeWindow = windowContentElements[i].parentElement.id;
        //         break;
        //     }
        // }
            removeActiveClass();
            const windowContentElement = windowContentElements[windowContentElements.length - 1];
            windowContentElement.classList.add('active');
        }
    }
    //在原本的代码中存在一个问题：比如当前窗口为第一个，要关闭的窗口为第二个，最后一个窗口为第三个，则此时直接点击第二个窗口的关闭键会造成
    //跳转到窗口三，但实际上应该留在窗口1才对

    //所以只有当目前活动窗口的url号和要关闭窗口的url号相同时才进行其他操作，自动跳转到最后一个打开窗口，否则结束页面关闭流程
    if(url !== tempurl)
    {
        return;
    }



    //打开最后的小窗
    let WindowNum = Object.keys(openWindows).length;
    console.log("正在关闭窗口，目前记录的处于打开状态的小窗数量为：", WindowNum);
    //若所有的小窗均已关闭，则不需要再从cache中取出网页缓存数据，清空页面即可，同时清空缓存，重置tempurl进入下一轮轮回流程
    if (WindowNum === 0) {
        Object.keys(cache).forEach((key) => {
            delete cache[key];
        });
        tempurl = 0;
        return;
    }
    
    const maxSmallWindowNumber = findMaxSmallWindowNumber();
    const OpenId = "smallwindow" + maxSmallWindowNumber;
    console.log('关闭当前窗口后要打开的窗口ID为:', OpenId);
    console.log('而目前的openwindows存储情况为：', openWindows);
    const divElement = document.getElementById(OpenId);
    const textContent = divElement.textContent;
    openWindow(textContent, ContentAndUrl[textContent]);
    // if(textContent === '数据总览'){
    //     openWindow('数据总览',1);
    // }
    // else if(textContent === '统计任务'){
    //     openWindow('统计任务',2);
    // }
    // else if(textContent === '总览'){
    //     openWindow('总览',3);
    // }
    // 调用函数触发点击事件，打开最后的小窗
    console.log("要打开的窗口id：", OpenId);
    triggerClickWithoutMouseMove(OpenId);

}


//查询当前场上最后打开的小窗id号
function findMaxSmallWindowNumber() {
    // 获取场上所有的元素
    const elements = document.querySelectorAll('[id*="smallwindow"]');

    let maxNumber = -Infinity; // 初始化最大值为负无穷大

    // 遍历所有元素，找到最大的数字部分
    elements.forEach((element) => {
        // 获取id属性值
        const idValue = element.id;

        // 使用正则表达式匹配id中的数字部分
        const matchResult = idValue.match(/\d+/);

        if (matchResult) {
            const number = parseInt(matchResult[0], 10); // 将匹配到的数字部分转换为整数

            // 如果该数字大于当前最大值，则更新最大值
            if (number > maxNumber) {
                maxNumber = number;
            }
        }
    });

    return maxNumber;
}

//模拟触发屏幕上的元素
function triggerClickWithoutMouseMove(elementId) {
    // 获取要触发点击事件的元素
    const element = document.getElementById(elementId);

    // 获取元素的位置信息
    const rect = element.getBoundingClientRect();
    const { left, top, width, height } = rect;

    // 创建鼠标事件的模拟对象
    const mouseEvent = new MouseEvent("click", {
        clientX: left + width / 2, // 设置鼠标点击的横坐标为元素中心
        clientY: top + height / 2, // 设置鼠标点击的纵坐标为元素中心
        view: window, // 设置事件的视图窗口为当前窗口
        bubbles: true, // 允许事件冒泡
        cancelable: true, // 允许事件取消
        composed: true, // 允许事件穿越Shadow DOM
    });

    // 触发点击事件
    element.dispatchEvent(mouseEvent);
}


function removeActiveClass() {
    const windowContentElements = document.getElementsByClassName('window-content');
    for (let i = 0; i < windowContentElements.length; i++) {
        windowContentElements[i].classList.remove('active');
    }
}




// 加载内容，先检查缓存，如果有则使用缓存内容，否则打开新页面，url格式为1234，用来对应HTMLContent1234的内容
function loadContent(url, containerId, content) {
    console.log('666');
    console.log(cache);
    const container = document.getElementById(containerId);
    if (container) {
        const contentKey = `HTMLContent${url}`;
        if (cache[url] && cache[url][content]) {
            // 如果缓存存在该URL和content的数据，则使用缓存内容
            console.log('正在使用缓存数据');
            container.innerHTML = cache[url][content];
            //url等于2，说明触发生成的是任务管理界面，原本Inner2界面中的初始化调用generateTasks函数就需要挪一下位置，直接增添到HTML页面中也不会触发，需要手动调用
            if (url === 2) {
                generateTasks();

            }

            return; // 终止后续操作
        } else {
            console.log('正在使用全新初始数据');
            // 否则加载 iframe
            container.innerHTML = ''; // 清空容器的内容

            if (!cache[url]) {
                cache[url] = {}; // 创建一个对象来存储该URL的缓存数据
            }
            const htmlContent = HTMLContents[url];



            // 将id为"content"的div的innerHTML内容保存到cache中
            container.innerHTML = htmlContent;
            cache[url][content] = htmlContent;
            //url等于2，说明触发生成的是任务管理界面，原本Inner2界面中的初始化调用generateTasks函数就需要挪一下位置，直接增添到HTML页面中也不会触发，需要手动调用
            if (url === 2) {
                generateTasks();

            }
            if (url === 3){
                XCPShowAllData();
            }


        }
    }
}

// 清空缓存对象
function clearCache() {
    for (const key in cache) {
        delete cache[key];
    }
}



//从后台获取表格数据
function queryData() {
    var query = document.getElementById('DataType').value;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
 
            updateTable(response.columns, response.data);
        }
    };
    xhr.open('POST', '/ppi', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ query: query }));
}

//更新前端表格数据
function updateTable(columns, data) {
    var tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';

    if (data.length > 0) {
        var table = document.createElement('table');
        var tbody = document.createElement('tbody');

        var headerRow = document.createElement('tr');
        var headerWidths = [];

        columns.forEach(function (column) {
            var th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);

            // Calculate the maximum width for each column in header
            var headerTextWidth = getTextWidth(column);
            headerWidths.push(headerTextWidth);
        });
        tbody.appendChild(headerRow);

        data.forEach(function (row, rowIndex) {
            var tr = document.createElement('tr');

            // Use the modulo operator to alternate between RowOne and RowTwo styles
            if (rowIndex % 2 === 0) {
                tr.classList.add('RowOne');
            } else {
                tr.classList.add('RowTwo');
            }



            row.forEach(function (value, columnIndex) {
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);

                // Calculate the maximum width for each column in data cells
                var cellTextWidth = getTextWidth(value);
                var maxColumnWidth = Math.max(headerWidths[columnIndex], cellTextWidth);
                td.style.width = maxColumnWidth + 'em';
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }
}

// Function to calculate text width using a hidden canvas
function getTextWidth(text) {
    var hiddenCanvas = document.createElement('canvas');
    var context = hiddenCanvas.getContext('2d');
    context.font = '16px Arial'; // Set the font and font size (16px is arbitrary, you can adjust it as needed)
    var textMetrics = context.measureText(text);
    var textWidth = textMetrics.width / 16; // Convert pixel width to em
    return textWidth;
}

//从后台查询图片信息
function ImagequeryData() {
    var query = document.getElementById('ImagequeryInput').value;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // container.innerHTML = '';
            // var message = "后台图片查询完成1。";
            // alert(message);
            var imgDataList = JSON.parse(xhr.responseText);
            ImageupdateContainer(imgDataList.imgDataList);
        }
    };
    xhr.open('POST', '/Imageppi', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ Imagequery: query }));
}

//在前端更新图片
function ImageupdateContainer(imgDataList) {
    var container = document.getElementById('ImagequeryContainer');
    container.innerHTML = '';
    // var message = "后台图片查询完成2.";
    // alert(message);

    for (var i = 0; i < imgDataList.length; i++) {
        var img = document.createElement('img');
        img.src = 'data:image/jpeg;base64,' + imgDataList[i];

        // 添加样式，使图片自适应父元素宽度
        img.style.maxWidth = '95%';
        img.style.height = 'auto'; // 保持原始图片的高宽比

        container.appendChild(img);
    }
}

// let counter = 1;

//点击更新VIN码
function addText() {
    const textInput = document.getElementById('textInput');
    const outputSection = document.getElementById('outputSection');

    const text = textInput.value.trim();
    if (text === '') {
        return;
    }

    const id = 'Maindata' + counter;
    const className = 'Vin';
    const textLine = document.createElement('div');
    textLine.setAttribute('id', id);
    textLine.setAttribute('class', className);
    textLine.setAttribute('data-value', text);
    // textLine.setAttribute('class', className);

    textLine.innerHTML = text + ' <button class="delete-button" style="margin-left:40px;" onclick="removeText(\'' + id + '\')">删除</button>';

    outputSection.appendChild(textLine);

    textInput.value = '';
    counter++;
}

//移除前端vin码
function removeText(id) {
    const element = document.getElementById(id);
    element.remove();
}



let taskStarted = false; // Variable to track whether the task has been started or not

//更新统计算法勾选状态
function toggleCheck(checkbox, isChecked) {
    var svg = checkbox.querySelector('svg');

    if (taskStarted) {
        // If the task has started, disable the checkboxes and return
        checkbox.setAttribute('disabled', 'disabled');
        return;
    }

    if (isChecked) {
        // 创建SVG图形
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 24 24');

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z');
        path.setAttribute('fill', 'red');

        svg.appendChild(path);
        checkbox.appendChild(svg);
    } else {
        // 移除SVG图形
        checkbox.removeChild(svg);
    }
}

//监听勾选栏状态
document.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
    checkbox.addEventListener('click', function () {
        // 调用 toggleCheck 函数，传入 checkbox 和 checkbox 的状态作为参数
        var isChecked = this.checked;
        toggleCheck(this, isChecked);
    });
});

function CheckStatus(fb, db) {
    var fuelCheckbox = document.getElementById(fb);
    var dpfCheckbox = document.getElementById(db);

    var Fuel = fuelCheckbox.checked;
    var DPF = dpfCheckbox.checked;

    // 在此处您可以根据需要使用 Fuel 和 DPF 变量
    message = 'Fuel状态：' + Fuel + ' DPF状态：' + DPF
    window.parent.postMessage(message, '*');

}

//任务创建功能
function createTask() {
    const allVinElements = document.querySelectorAll('.Vin[data-value]'); // 获取所有class名为Vin的元素且带有data-value属性
    const allVinValues = Array.from(allVinElements).map(vinElement => vinElement.dataset.value); // 提取data-value的值
    // 获取当前id为YearSelect的选框所选内容对应的value值的内容
    const yearSelectElement = document.getElementById("YearSelect");
    const selectedYearValue = yearSelectElement.value;

    // 获取当前id为MonthSelect的选框所选内容对应的value值的内容
    const monthSelectElement = document.getElementById("MonthSelect");
    const selectedMonthValue = monthSelectElement.value;
    //获取任务的创建时间
    const currentDate = new Date();

    // 构建要发送给FLASK后台的数据对象
    console.log(allVinValues)
    const data = {
        AllVin: allVinValues.join(","),
        Year: selectedYearValue,
        Month: selectedMonthValue,
        Time: currentDate
    };
    let AllVin = allVinValues.join(",");
    let Year = selectedYearValue;
    let Month = selectedMonthValue;
    let Time = currentDate;

    if (AllVin === '') {
        alert('未输入VIN号，请重新选择！', '*');
        return;
    }
    if (Year === '0') {
        alert('未选择数据年份，请重新选择！', '*');
        return;
    }

    if (Month === '0') {
        alert('未选择数据月份，请重新选择！', '*');
        return;
    }

    // 使用AJAX请求将数据发送给FLASK后台
    fetch('/CreateTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            // 处理后台返回的响应数据
            console.log(data);
            const Num = data.Num; // 获取Num的值
            alert('任务创建成功！', '*');
            //特别注意：原本下方的页面刷新代码是放在本函数（CreateTask）最后一行的，但是这样必然会出现failed to fetch报错，原因在于函数在完成任务创建请求后立即使用location.reload()重新加载页面。
            //这样在请求发出后，页面可能会在请求得到响应之前就刷新了，导致请求得不到响应。因为fetch()是一个异步操作，执行完后续代码时请求可能还未完成,这样修改后可以有效解决此问题。
            const SelectList = document.getElementById('OtherBasicSQL');
            SelectList.innerHTML = '';
            SelectList.innerHTML = `    <div id="inputSection" style="margin-left: 150px; display: inline;">
            <input type="text" id="textInput" placeholder="请输入VIN码">
            <button onclick="addText()">确认添加</button>
            <!-- <button onclick="">查询所有 </button> -->
        </div>



        <!-- <input type="text" id="queryInput"> -->
        <select id="YearSelect" class="document-toc-link"
            style="margin-right: 20px;  margin-left: 20px; display: inline;">
            <option value="0">--选择要查询的数据年份--</option>
            <option value="2023">2023年</option>

        </select>


        <select id="MonthSelect" class="document-toc-link"
            style="margin-right: 10px;  margin-left: 20px; display: inline;">
            <option value="0">--数据月份--</option>
            <option value="01">1月</option>
            <option value="02">2月</option>
            <option value="03">3月</option>
            <option value="04">4月</option>
            <option value="05">5月</option>
            <option value="06">6月</option>
            <option value="07">7月</option>
            <option value="08">8月</option>
            <option value="09">9月</option>
            <option value="10">10月</option>
            <option value="11">11月</option>
            <option value="12">12月</option>



        </select>
        <!-- <button onclick="queryData()">表格查询</button> -->

        <button id="CreateTask" class="waves-effect" style="display: inline; margin-left: 20px;" onclick="createTask()">创建任务</button>
        <div id="outputSection" style="margin-left: 150px;"></div>
        <hr>`;
            const TaskList = document.getElementById('TaskList');
            TaskList.innerHTML = '';
            generateTasks();
        })
        //本函数经测试明明会正确向后端发送请求，后端也会正确创建任务但就是会报错，可能是因为跨域问题，不影响使用，所以就当是没问题吧
        .catch(error => {
            console.error('Error:', error);
            console.log(error.message); // 输出错误信息
            console.log(error.response); // 输出响应信息
            alert('任务创建失败！', '*');
        });

}

//任务启动功能（其中有附带禁用勾选栏功能）
function startTask(fb, db, TaskNum) {
    var fuelCheckbox = document.getElementById(fb);
    var dpfCheckbox = document.getElementById(db);
    var Fuel = fuelCheckbox.checked;
    var DPF = dpfCheckbox.checked;

    // 检查本行的两个选框是否都未被勾选
    if (!Fuel && !DPF) {
        window.parent.postMessage('请选择您要启用的算法！', '*');
        return;
    }

    const data = {
        TaskNum: TaskNum,
        Fuel: Fuel,
        DPF: DPF
    };

    // 使用AJAX请求将数据发送给FLASK后台
    fetch('/StartTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            // 处理后台返回的响应数据
            console.log(data);
            alert('任务启动成功！', '*');
            // 获取任务启动按钮元素，并设置为禁用状态
            const taskRow = fuelCheckbox.closest('.Task');
            const startTaskButton = taskRow.querySelector('.StartTask');
            startTaskButton.setAttribute('disabled', 'disabled');
        })
        //本函数经测试明明会正确向后端发送请求，后端也会正确启动任务但就是会报错，可能是因为跨域问题，不影响使用，所以就当是没问题吧
        .catch(error => {
            console.error('Error:', error);
            console.log(error);
            alert('任务启动失败！', '*');
        });

    // 设置 taskStarted 为 true，表示任务已经启动
    taskStarted = true;

    // 获取当前点击按钮所在的任务行（父元素）
    const taskRow = fuelCheckbox.closest('.Task');

    // 在任务行中查找对应的油耗统计勾选框和DPF再生统计勾选框
    const fuelCheckboxInRow = taskRow.querySelector('input[data-target^="Fuel"]');
    const dpfCheckboxInRow = taskRow.querySelector('input[data-target^="DPF"]');

    // 只禁用这两个勾选框
    fuelCheckboxInRow.setAttribute('disabled', 'disabled');
    dpfCheckboxInRow.setAttribute('disabled', 'disabled');


}

function showTaskResult(fb, db, TaskNum){
    var fuelCheckbox = document.getElementById(fb);
    var dpfCheckbox = document.getElementById(db);
    const data = {
        TaskNum: TaskNum,
    };

        // 使用AJAX请求将数据发送给FLASK后台
    fetch('/ShowTaskResult', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            // 处理后台返回的响应数据
            console.log(data);
            //如果后台查看对应编号任务的文件夹中还未生成代表统计结果文件已经生成完毕的提示文件
            if(data === 'No'){
                alert('统计结果未生成完毕！');
                
                return;
            }
            alert('查看统计结果！', '*');
            //如果统计结果文件已经生成完毕，则打开一个新页面展示统计结果内容
            openWindow('任务统计结果内容',1000);
            //传递参数，更新任务统计结果页面的内容
            updateTaskResultContent(TaskNum);
            // 获取查看统计结果按钮元素，并设置为禁用状态
            //实际操作中发现似乎没必要这么做
            // const taskRow = fuelCheckbox.closest('.Task');
            // const showTaskRusultButton = taskRow.querySelector('.ShowResult');
            // showTaskRusultButton.setAttribute('disabled', 'disabled');
        })
        //本函数经测试明明会正确向后端发送请求，后端也会正确启动任务但就是会报错，可能是因为跨域问题，不影响使用，所以就当是没问题吧
        .catch(error => {
            console.error('Error:', error);
            console.log(error);
            alert('统计结果生成存在问题！', '*');
        });
}

//更新任务统计结果页面的内容
function updateTaskResultContent(TaskNum){
    const data = {
        TaskNum: TaskNum,
    };
    // 使用AJAX请求将数据发送给FLASK后台
    fetch('/UpdateTaskResultContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            // 处理后台返回的响应数据
            console.log(data);
            var Forms = data.Forms;
            var Images = data.images;
            let FormToTalDiv = document.getElementById('Forms');
            if (Forms.length > 0) {
                for(i = 1; i <= Forms.length; i++){
    
                    var thisForm = Forms[i - 1]; 
                    var columns = thisForm.columns;

                    var formData = thisForm.data;
                    
                    var formName = thisForm.FormName;
                    var RowNum = thisForm.RowNum;
                    var AloneFormName = 'AloneForm' + i;
                    var AlonePageSelectName = 'PageSelect' + i;
                    var FormAloneElement = `<div id=FormName${i}></div><div id=AloneForm${i}></div><div id=PageSelect${i}></div>`;
                    FormToTalDiv.insertAdjacentHTML('beforeend', FormAloneElement);
                    AddFormToElement(columns,formData,AloneFormName);
                    var NameDiv = document.getElementById('FormName' + i);
                    NameDiv.innerHTML = formName;

                    //获取前端应该有多少个分页
                    // let pages = Math.floor(RowNum/10) + 1;
                    // PagesAllNum = pages;         
                    
                    //注意：由于要用的到AllData在任务统计结果生成页面会出现需要调用全局变量的问题（否则总不能直接把表格内容作为参数传递），解决起来很麻烦，目前先不写，等后面再完善          
                    //CurrentPageSelectForm(pages,1,AlonePageSelectName);
                    
        
                }
            }
    
            // Accessing Image Data
            if (Images.length > 0) {
                for(i = 1; i <= Images.length; i++){
                    var firstImageBase64 = Images[i - 1];
                    var ImgElement = document.createElement('img');
        

                    ImgElement.src = 'data:image/jpeg;base64,' + firstImageBase64; // Update the MIME type accordingly
                    // 添加样式，使图片自适应父元素宽度
                    ImgElement.style.maxWidth = '95%';
                    ImgElement.style.height = 'auto'; // 保持原始图片的高宽比

                    var ImageDiv = document.getElementById('Images');

                    var ImageAloneElement = `<div id=Img${i}></div>`;
                    // ImageDiv.insertAdjacentHTML('beforeend', ImageAloneElement);
                    ImageDiv.appendChild(ImgElement); // Add the image element to the body or a specific container
                }

            }
        })

        //本函数经测试明明会正确向后端发送请求，后端也会正确启动任务但就是会报错，可能是因为跨域问题，不影响使用，所以就当是没问题吧
        .catch(error => {
            console.error('Error:', error);
        });
}

function generateTasks() {
    console.log('正在调用任务生成函数');
    // 获取任务列表容器
    const TaskListDiv = document.getElementById('TaskList');
    TaskListDiv.innerHTML = '';

    // 定义要发送给后端的数据
    const data = {}; // 你可以根据需要将属性和值添加到这个对象中

    // 使用AJAX请求从后端获取任务数据
    fetch('/ShowTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            // 处理从后端接收的数据
            const tasks = data.data;
            const taskCount = data.Num;


            // 遍历每个任务数据并在taskListDiv中生成相应的HTML元素来展示任务信息
            for (let i = 1; i <= taskCount; i++) {
                const task = tasks[i - 1];
                const fuelChecked = task.FuelEconomy === 'True'; // 判断值是否等于"TRUE"
                const dpfChecked = task.DPF === 'True'; // 判断值是否等于"TRUE"
                const TaskNumInSQL = task.TaskNum;
                let VINs = task.VINs;
                //后台有多个VIN号传来的时候可能造成显示溢出框格，所以只截取前面一部分VIN号，后面用省略号
                if (VINs.length > 55) {

                    VINs = VINs.slice(0, 55) + '…………';
                }


                const html = `
                <div class="Task" data-TaskNum="${task.TaskNum}">
                    <span class="TaskName">
                        <p style="color: rgb(255, 255, 255); font-weight: bolder; font-size: 1.6em; letter-spacing: 0.3em;">任务${i}</p>
                    </span>
                    <div class="ShowInformation">
                        <div class="ShowVin"><p class="VinData">所选VIN号：${VINs}</p></div>
                        <div class="DataChoice">
                            <span class="ChooseText"><a>选择统计方式:</a></span>
                            <span class="InforChoose">
                                <input type="checkbox" id="Fuelcheckbox${i}" data-target="Fuel${i}" ${fuelChecked ? 'checked' : ''}><a>油耗统计</a>
                                <input type="checkbox" id="DPFcheckbox${i}" data-target="DPF${i}" ${dpfChecked ? 'checked' : ''}><a>DPF再生统计</a>
                            </span>
                        </div>
                    </div>
                    <span class="TaskChoice">
                        <button class="StartTask" onclick="startTask('Fuelcheckbox${i}', 'DPFcheckbox${i}', '${task.TaskNum}')">启动任务</button>
                        <button class="ShowResult" onclick="showTaskResult('Fuelcheckbox${i}', 'DPFcheckbox${i}', '${task.TaskNum}')">查看统计结果</button>
                        <button class="DeleteTask" onclick="deleteTask('${task.TaskNum}')">删除任务</button>
                    </span>
                </div>
            `;

                TaskListDiv.insertAdjacentHTML('beforeend', html);
            }

            // 获取所有的勾选框元素
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');

            // 遍历勾选框，根据FuelEconomy和DPF的值来决定是否添加禁用状态
            checkboxes.forEach(checkbox => {
                const target = checkbox.getAttribute('data-target');
                const index = parseInt(target.match(/\d+/)[0], 10); // 获取末尾的数字，用于对应tasks中的索引

                if (target.includes('Fuel') || target.includes('DPF')) {
                    // 如果"FuelEconomy"或"DPF"有一项为True，则禁用该行的两个勾选项
                    const fuelEconomy = tasks[index - 1].FuelEconomy;
                    const dpf = tasks[index - 1].DPF;

                    // 禁用或启用相应行的按钮
                    const taskRow = checkbox.closest('.Task'); // 获取当前勾选框所在的任务行
                    const startTaskButton = taskRow.querySelector('.StartTask'); // 获取该行的 StartTask 按钮

                    if (fuelEconomy === 'True' || dpf === 'True') {
                        checkbox.setAttribute('disabled', 'disabled');
                    }

                    if (fuelEconomy === 'True' || dpf === 'True') {
                        startTaskButton.setAttribute('disabled', 'disabled'); // 禁用按钮
                    } else {
                        startTaskButton.removeAttribute('disabled'); // 启用按钮
                    }
                }
            });

        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//删除任务
function deleteTask(taskNum) {
    const data = {
        TaskNum: taskNum
    };

    // 使用AJAX请求将数据发送给后端进行删除任务的处理
    fetch('/DeleteTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            // 处理后台返回的响应数据
            console.log(data);
            // 这里可以做一些删除成功的提示操作
            window.alert('任务删除完成！')
            // window.parent.postMessage('任务删除完成！', '*');
            generateTasks();
        })
        .catch(error => {
            console.error('Error:', error);
            window.parent.postMessage('任务删除失败！', '*');
        });
}

//Echarts双坐标轴图形的一种展示方式
function createDualAxisChartSpeedMile(containerId, textData) { 
    var dom = document.getElementById(containerId);
    var myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    var app = {};

    var option;

    // Convert external text data to arrays
    var data0 = textData.split(';').map(function (item) {
        var arr = item.split(',');
        return [arr[0], arr[1], arr[2]];
    });

    var data1 = [
        [100, 3000],
        [38, 1400]
    ];
    option = {
        xAxis: {
            name: '平均车速（KM）',
            scale: true,
            nameLocation: 'middle',
            nameGap: 30
        },
        yAxis: [
            {
                scale: true,
                name: '行驶里程（KM）',
                nameLocation: 'middle',
                nameGap: 30
            }
        ],

        series: [
            {
                type: 'effectScatter',
                data: data1 // Use another array
            },
            {
                type: 'effectScatter', // Effect scatter plot with ripple animation
                data: data0, // Use the original array
                showEffectOn: 'emphasis', // Configure when to show the effect
                rippleEffect: {
                    color: '#8e2c49',
                    period: 2,
                    scale: 5,
                    brushType: 'stroke'
                }
            },
            // Delete other series
            {
                type: 'scatter',
                color: 'rgba(12, 18, 151, 1)',
                markLine: {
                    data: [
                        {
                            xAxis: 30,
                            label: { formatter: '市区/市郊', color: 'rgba(12, 18, 151, 1)' },
                            color: 'rgba(12, 18, 151, 82)',
                            silent: false,
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    ]
                }
            },
            {
                type: 'scatter',
                color: 'rgba(249, 159, 3, 82)',
                data: [],
                markLine: {
                    data: [
                        {
                            xAxis: 70,
                            label: { formatter: '市郊/高速', color: 'rgba(28, 111, 110, 92)' },
                            color: 'rgba(249, 159, 3, 82)',
                            silent: false,
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    ]
                }
            }
        ],
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                if (params.componentType === 'series' && params.seriesType === 'effectScatter') {
                    var x = params.data[0];
                    var y = params.data[1];
                    // 隐藏数据值，一般用来存储VIN码
                    var hiddenValue = params.data[2];

                    if (typeof hiddenValue !== 'undefined') {
                        ShowCarData(hiddenValue);
                    }

                    return (
                        "<div style='border:1px solid #ccc;padding:5px'>" +
                        '<p>VIN码：' +
                        hiddenValue +
                        '</p>' +
                        '<p>横坐标：' +
                        x +
                        '</p>' +
                        '<p>纵坐标：' +
                        y +
                        '</p>' +
                        '</div>'
                    );
                } else {
                    return;
                }
            }
        },
        visualMap: {
            type: 'piecewise',
            orient: 'horizontal',
            left: 'center',
            bottom: 70,
            dimension: 0,
            pieces: [
                { min: 70, color: 'rgba(249, 64, 3, 1)', label: '高速路         ' },
                { max: 70, min: 30, color: 'rgba(249, 159, 3, 1)', label: '市郊路      ' },
                { max: 30, color: 'rgba(12, 18, 151, 1)', label: '市区路     ' }
            ],
            seriesIndex: [1, 2]
        }
    };

    myChart.on('click', function (params) {
        if (
            (params.componentType === 'series' &&
                params.seriesType === 'effectScatter') ||
            'scatter'
        ) {
            var x = params.data[0];
            var y = params.data[1];
            var hiddenValue = params.data[2];

            if (typeof hiddenValue !== 'undefined') {
                ShowCarData(hiddenValue);
            }

            if (x === undefined || y === undefined) {
                return;
            }
            var url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(x + ',' + y);
            window.open(url);
        }
    });

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

//点击坐标轴上点后跳转展示单车具体数据的函数
function ShowCarDataByPoint(Value) {

}


//设定XCP数据首页要展示的所有数据和索引名为全局变量
let XCPData = '';
let XCPColumns = '';
let PagesAllNum = '';
//XCP数据的首页，用于向后端申请全部信息，并展示第一页的十行数据，更新下方分页栏
function XCPShowAllData() {
    //直接申请即可，没有变量参数信息需要传递，下面的定义无实际作用
    let query = 'NeedAllData';

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            XCPData = response.data;
            XCPColumns =response.columns;
            let slicedData = response.data.slice(1, 11);
            XCPHomePageupdateTable(response.columns, slicedData);
            let RowNum = response.RowNum;
            console.log(RowNum);
            //获取前端应该有多少个分页
            let pages = Math.floor(RowNum/10) + 1;
            PagesAllNum = pages;
            console.log(pages);
            PageSelectForm(pages,1);
        }
    };
    xhr.open('POST', '/XCPHomePageData', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ query: query }));
}


function XCPHomePageupdateTable(columns, data) {
    var tableContainer = document.getElementById('DataShowForm');
    tableContainer.innerHTML = '';

    if (data.length > 0) {
        var table = document.createElement('table');
        var tbody = document.createElement('tbody');

        var headerRow = document.createElement('tr');
        var headerWidths = [];

        columns.forEach(function (column) {
            var th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);

            // Calculate the maximum width for each column in header
            var headerTextWidth = getTextWidth(column);
            headerWidths.push(headerTextWidth);
        });
        tbody.appendChild(headerRow);

        data.forEach(function (row, rowIndex) {
            var tr = document.createElement('tr');

            // Use the modulo operator to alternate between RowOne and RowTwo styles
            if (rowIndex % 2 === 0) {
                tr.classList.add('RowOne');
            } else {
                tr.classList.add('RowTwo');
            }



            row.forEach(function (value, columnIndex) {
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);

                // Calculate the maximum width for each column in data cells
                var cellTextWidth = getTextWidth(value);
                var maxColumnWidth = Math.max(headerWidths[columnIndex], cellTextWidth);
                td.style.width = maxColumnWidth + 'em';
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }
}

// 根据传入的要生成多少分页进行分页操作
function PageSelectForm(PagesNum,ActivePage){
    let HTMLContent = ``;
    if(ActivePage === 1){    
        HTMLContent = `<ul class="pagination">
        <li class="disabled"><a href="#!"><i class="material-icons">chevron_left</i></a></li>`;
    }
    else{
        HTMLContent = `<ul class="pagination">
        <li class="waves-effect" onclick="ChangePage(${ActivePage - 1})"><a href="#!"><i class="material-icons">chevron_left</i></a></li>`;
    }
    for(i = 1;i <= PagesNum;i++){
        if(i === ActivePage){
            HTMLContent += `<li class="active" onclick="ChangePage(${i})"><a href="#!">${i}</a></li>`;
            continue;
        }
        HTMLContent += `<li class="waves-effect" onclick="ChangePage(${i})"><a href="#!">${i}</a></li>`;
    }
    if(ActivePage === PagesNum){
        HTMLContent += `<li class="disabled"><a href="#!"><i class="material-icons">chevron_right</i></a></li>
        </ul>`;
    }
    else{
        HTMLContent += `<li class="waves-effect" onclick="ChangePage(${ActivePage + 1})"><a href="#!"><i class="material-icons">chevron_right</i></a></li>
        </ul>`;
    }
    const Page = document.getElementById('Pages');
    Page.innerHTML = HTMLContent;
}

//将表格内容切换到其他的页面，且修改分页栏各页的状态
function ChangePage(Page){
    //取应刷新生成展示的数据
    let slicedData = XCPData.slice(10*Page -9, 10 * Page + 1);
    XCPHomePageupdateTable(XCPColumns, slicedData);
    PageSelectForm(PagesAllNum,Page);
}   

//通用的通过指定元素名来在对应元素区域内生成表格的函数
function AddFormToElement(columns, data, ElementName){
    var tableContainer = document.getElementById(ElementName);
    // tableContainer.innerHTML = '';

    if (data.length > 0) {
        var table = document.createElement('table');
        var tbody = document.createElement('tbody');

        var headerRow = document.createElement('tr');
        var headerWidths = [];

        columns.forEach(function (column) {
            var th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);

            // Calculate the maximum width for each column in header
            var headerTextWidth = getTextWidth(column);
            headerWidths.push(headerTextWidth);
        });
        tbody.appendChild(headerRow);

        data.forEach(function (row, rowIndex) {
            var tr = document.createElement('tr');

            // Use the modulo operator to alternate between RowOne and RowTwo styles
            if (rowIndex % 2 === 0) {
                tr.classList.add('RowOne');
            } else {
                tr.classList.add('RowTwo');
            }



            row.forEach(function (value, columnIndex) {
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);

                // Calculate the maximum width for each column in data cells
                var cellTextWidth = getTextWidth(value);
                var maxColumnWidth = Math.max(headerWidths[columnIndex], cellTextWidth);
                td.style.width = maxColumnWidth + 'em';
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }

}


//通用的表格分页生成函数
function CurrentPageSelectForm(PagesNum,ActivePage,ElementName,AllData){
    let HTMLContent = ``;
    if(ActivePage === 1){    
        HTMLContent = `<ul class="pagination">
        <li class="disabled"><a href="#!"><i class="material-icons">chevron_left</i></a></li>`;
    }
    else{
        HTMLContent = `<ul class="pagination">
        <li class="waves-effect" onclick="CurrentChangePage(${ActivePage - 1})"><a href="#!"><i class="material-icons">chevron_left</i></a></li>`;
    }
    for(i = 1;i <= PagesNum;i++){
        if(i === ActivePage){
            HTMLContent += `<li class="active" onclick="CurrentChangePage(${i})"><a href="#!">${i}</a></li>`;
            continue;
        }
        HTMLContent += `<li class="waves-effect" onclick="CurrentChangePage(${i})"><a href="#!">${i}</a></li>`;
    }
    if(ActivePage === PagesNum){
        HTMLContent += `<li class="disabled"><a href="#!"><i class="material-icons">chevron_right</i></a></li>
        </ul>`;
    }
    else{
        HTMLContent += `<li class="waves-effect" onclick="CurrentChangePage(${ActivePage + 1})"><a href="#!"><i class="material-icons">chevron_right</i></a></li>
        </ul>`;
    }
    const Page = document.getElementById(ElementName);
    Page.innerHTML = HTMLContent;
}

//注意：由于要用的到AllData在任务统计结果生成页面会出现需要调用全局变量的问题（否则总不能直接把表格内容作为参数传递），解决起来很麻烦，目前先不写，等后面再完善
//通用的将表格内容切换到其他的页面，且修改分页栏各页的状态的函数
function CurrentChangePage(AllData,Page,PagesAllNum,ElementName){
    //取应刷新生成展示的数据
    // let slicedData = AllData.slice(10*Page -9, 10 * Page + 1);
    // CurrentPageupdateTable(XCPColumns, slicedData, ElementName);
    // CurrentPageSelectForm(PagesAllNum,Page,ElementName);
}   

//通用的更新切片页面内容信息的函数
function CurrentPageupdateTable(columns, data, ElementName) {
    var tableContainer = document.getElementById(ElementName);
    tableContainer.innerHTML = '';

    if (data.length > 0) {
        var table = document.createElement('table');
        var tbody = document.createElement('tbody');

        var headerRow = document.createElement('tr');
        var headerWidths = [];

        columns.forEach(function (column) {
            var th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);

            // Calculate the maximum width for each column in header
            var headerTextWidth = getTextWidth(column);
            headerWidths.push(headerTextWidth);
        });
        tbody.appendChild(headerRow);

        data.forEach(function (row, rowIndex) {
            var tr = document.createElement('tr');

            // Use the modulo operator to alternate between RowOne and RowTwo styles
            if (rowIndex % 2 === 0) {
                tr.classList.add('RowOne');
            } else {
                tr.classList.add('RowTwo');
            }



            row.forEach(function (value, columnIndex) {
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);

                // Calculate the maximum width for each column in data cells
                var cellTextWidth = getTextWidth(value);
                var maxColumnWidth = Math.max(headerWidths[columnIndex], cellTextWidth);
                td.style.width = maxColumnWidth + 'em';
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }
}