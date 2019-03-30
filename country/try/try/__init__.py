import os
from flask import Flask
from flask_cors import CORS # 前后端分离跨域

def create_app(test_config=None):
    app = Flask(__name__,instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY = 'dev',
    )
    CORS(app)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py',silent=True)
    else:
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/ping')
    def ping():
        return 'Hello world from flask'
    
    from . import country 
    app.register_blueprint(country.bp)

    return app