from flask import Flask,render_template,request, jsonify, send_file
import flask
import pandas as pd
import random
from flask_cors import CORS
from collections import OrderedDict
from flask import Response
import json
import os
import base64
import pymysql

app = Flask(__name__, subdomain_matching=True)
CORS(app)
# app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False
app.config['static_folder'] = 'static'

# 创建一个函数来获取数据库连接和游标
def get_db_cursor():
    db = pymysql.connect(host='localhost',
                         user='root',
                         password='727626',
                         database='data-xcpetc',
                         charset='utf8')
    cursor = db.cursor()
    return db, cursor

# 创建一个上下文管理器来管理数据库连接和游标的生命周期
@app.teardown_appcontext
def close_db_connection(exception):
    db, cursor = get_db_cursor()
    db.close()

@app.route('/')
def index():
    return render_template('可运行代码保存.html')

@app.route('/zero')
def rex():
    return render_template('test.html')

@app.route('/Ajax')
def tex():
    return render_template('AJAXTest.html')

@app.route('/Inner')
def InnerOne():
    return render_template('InnerTest.html')

@app.route('/Inner2')
def InnerTwo():
    return render_template('Inner2.html')

@app.route('/Inner3')
def InnerThree():
    return render_template('Inner3.html')

@app.route('/SmallWindow')
def SmallWindow():
    return render_template('SmallWindow.html')


@app.route('/ppi', methods=['POST'])
def process_query():
    query = request.get_json()['query']
    print(query)
    File_Name = str(query) + '.xlsx'
    file_path = os.path.join(app.config['static_folder'], File_Name)
    df = pd.read_excel(file_path)
    df = df.round(2)
    df.fillna('-', inplace=True)
    data = []

    columns = df.columns.tolist()  # 提取列索引
    df.reset_index(drop=True, inplace=True)  # 重置索引
    data = df.values.tolist()  # 转换为列表
    print(data)

    return jsonify({'columns': columns, 'data': data})


    # print(data)
    # print(type(data[1]))
    #
    # return jsonify({'data': data})

@app.route('/XCPHomePageData', methods=['POST'])
def XCPHomePageData():
    query = request.get_json()['query']
    File_Name = '车辆数据总览.xlsx'
    file_path = os.path.join(app.config['static_folder'],'Data', File_Name)
    print(file_path)
    df = pd.read_excel(file_path)
    df = df.round(2)
    df.fillna('-', inplace=True)
    data = []


    #获取行数传给前端以便于进行分页
    RowNum = len(df.index);
    columns = df.columns.tolist()  # 提取列索引
    df.reset_index(drop=True, inplace=True)  # 重置索引
    data = df.values.tolist()  # 转换为列表
    print(data)

    return jsonify({'columns': columns, 'data': data, 'RowNum': RowNum})






@app.route('/Imageppi', methods=['POST'])
def image_query():
    data = request.get_json()
    #query = data.get('Imagequery')
    query = request.get_json()['Imagequery']

    # 获取static目录下同名目录中的所有图片文件
    image_folder = os.path.join(app.static_folder, query)
    print(image_folder)
    image_files = []
    if os.path.isdir(image_folder):
        for filename in os.listdir(image_folder):
            if filename.endswith('.jpg') or filename.endswith('.png'):
                print(filename)
                image_files.append(os.path.join(image_folder, filename))

    # 返回图片文件给前端
    image_data_list = []
    for image_file in image_files:
        with open(image_file, 'rb') as f:
            image_data = f.read()
        #     注释掉的为GPT提供的初始源代码
        # image_data_list.append(image_data)
        # 将二进制数据转换为base64编码的字符串
        image_data_base64 = base64.b64encode(image_data).decode()
        image_data_list.append(image_data_base64)
    print(image_data_list)

    # return image_data_list
    return jsonify({'imgDataList': image_data_list})

@app.route('/CreateTask', methods=['POST'])
def Create_Task():
    # 获取数据库连接和游标
    db, cursor = get_db_cursor()
    if request.method == 'POST':
        data = request.json  # 获取前端发送的JSON数据，解析为Python字典
        AllVin = data.get('AllVin', '')
        Year = data.get('Year', '')
        Month = data.get('Month', '')
        Time = data.get('Time', '')
        FuelEconomy = 'False'
        DPF = 'False'
        print(Time)


        # 在这里对接收到的数据进行进一步处理，执行你的任务逻辑

        # 假设你有一个名为result的变量来存储处理结果
        result = {
            'status': 'success',
            'message': 'Task created successfully',
            'data': {
                'AllVin': AllVin,
                'Year': Year,
                'Month':Month
            }
        }
        sql = "INSERT IGNORE INTO taskdata (VINs,Year,Month,Time,FuelEconomy,DPF) VALUES ('{}', '{}', '{}', '{}', '{}', '{}')".format(AllVin,Year,Month,Time, FuelEconomy, DPF)
        cursor.execute(sql)
        db.commit()
        cursor.close()
        return jsonify('0')  # 返回处理结果给前端

@app.route('/StartTask', methods=['POST'])
def Start_Task():
    # 获取数据库连接和游标
    db, cursor = get_db_cursor()
    if request.method == 'POST':
        data = request.json  # 获取前端发送的JSON数据，解析为Python字典
        TaskNum = data.get('TaskNum', '')
        Fuel = data.get('Fuel', '')
        DPF = data.get('DPF', '')



        sql = "UPDATE taskdata SET FuelEconomy = '{}' , DPF = '{}' WHERE TaskNum = '{}' ".format(Fuel,DPF,TaskNum)
        cursor.execute(sql)
        db.commit()
        cursor.close()
        #在D盘的TaskData文件夹下生成与当前任务在数据库中编号相同的文件夹
        New_folder_path = 'D:\\TaskData\\' + TaskNum;
        os.makedirs(New_folder_path)

        return jsonify('0')  # 返回处理结果给前端

@app.route('/ShowTaskResult', methods=['POST'])
def ShowTaskResult():
    # 获取数据库连接和游标
    db, cursor = get_db_cursor()
    data = request.json  # 获取前端发送的JSON数据，解析为Python字典
    TaskNum = data.get('TaskNum', '')
    New_folder_path = 'D:\\TaskData\\' + TaskNum;
    os.makedirs(New_folder_path)


    cursor.close()
    return jsonify('0')


@app.route('/ShowTask', methods=['POST'])
def Show_Task():
    # 获取数据库连接和游标
    db, cursor = get_db_cursor()
    sql = "SELECT * FROM taskdata ORDER BY Time DESC"
    cursor.execute(sql)
    results = cursor.fetchall()

    # 构建包含任务属性的列表
    tasks = []
    for row in results:
        task = {
            'TaskNum': row[0],
            'VINs': row[1],
            'FuelEconomy': row[2],
            'DPF': row[3]

            # 添加其他属性...
        }
        print(tasks)
        tasks.append(task)

    Num = len(tasks)
    cursor.close()
    return jsonify({'data': tasks, 'Num': Num})  # 返回处理结果给前端


@app.route('/DeleteTask', methods=['POST'])
def Delete_Task():
    # 获取数据库连接和游标
    db, cursor = get_db_cursor()
    data = request.json
    TaskNum = data.get('TaskNum')  # 假设'TaskNum'是JSON数据中的键名
    print(TaskNum)
    sql = "DELETE FROM taskdata WHERE TaskNum = '{}'".format(TaskNum)
    cursor.execute(sql)
    #一开始没想起来还要提交，所以只有cursor游标就会造成由于内存等原因，或许呈现出来的数据暂时完成了删除操作，但实际上数据库并未更改，程序重新运行就会返回原形
    db.commit()
    cursor.close()

    return jsonify('0')  # 返回处理结果给前端




@app.route('/Total')
def total():
    return render_template('Total.html')

@app.route('/DataHomePage')
def DataHomePage():
    return render_template('DataHomePage.html')


if __name__ == '__main__':
    app.run()
