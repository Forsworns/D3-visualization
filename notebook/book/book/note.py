from flask import (
    Blueprint, flash, g, request, json, jsonify
)
# from book.auth import login_required
from book.db import get_db

bp = Blueprint('note', __name__)

# 未登陆状态下查阅（暂时
@bp.route('/note_get_temp')
def note_get_temp():
    db = get_db()
    notes = db.execute(
        'SELECT title, content, created'
        ' FROM note' # 换行后记得加开头的空格
        ' ORDER BY created DESC'
    ).fetchall()
    
    notes = [{
        'title': note['title'],
        'content': note['content'],
        'created': note['created']
    } for note in notes]
    return jsonify(notes)

# 未登陆状态下添加（暂时
@bp.route('/note_add_temp',methods=('POST',))
def note_add_temp():
    if request.method == 'POST':
        db = get_db()
        created = request.form['created']
        title = request.form['title']
        content = request.form['content'] # 前端已作验证
        db.execute(
            'INSERT INTO note (author_id, title, content, created)'
            ' VALUES (?, ?, ?, ?)',
            (0,title,content,created)
        )
        db.commit() # 记得commit
        return jsonify([])

        
# 未登陆状态下删除（暂时
@bp.route('/note_delete_temp',methods=('POST',))
def note_add():
    if request.method == 'POST':
        db = get_db()
        createds = request.form['selected'].split(',') # 否则对整个字符串进行遍历
        for item in createds:
            db.execute(
                'DELETE FROM note where created = ?', (item,)
            )
            db.commit()
        return jsonify([])
