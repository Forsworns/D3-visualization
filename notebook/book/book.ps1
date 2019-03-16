python -m venv venv
.\venv\Scripts\activate 
pip install -e .
$env:FLASK_ENV="development"
$env:FLASK_APP="book"
flask init-db
flask run