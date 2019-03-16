import sqlite3

import click
from flask import current_app, g # g为全局对象
from flask.cli import with_appcontext

# 不存在就进行连接，用g可以防止同一个请求中多次调用get_db时创建一个新的连接
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop('db',None)

    if db is not None:
        db.close()

# 读入sql文件建表
def init_db():
    db = get_db()
    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf-8'))

# 命令行指令重置表
@click.command('init-db')
@with_appcontext
def init_db_command():
    init_db()
    click.echo('Initialize the database.')

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
