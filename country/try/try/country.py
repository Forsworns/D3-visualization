from flask import (
	Blueprint, flash, g, request, json, jsonify
)

import pandas as pd
import numpy as np
import os
import json
FILENAME = 'data/countriesData.csv'

bp = Blueprint('country', __name__)


def extractCountryCode():
	os.chdir('..')
	csv_data = pd.read_csv(FILENAME)
	csv_data.dropna(how='any', inplace=True)
	name_list = tolist(csv_data['CountryName']) # 选取多列用csv_data[['CountryName','CountryCode']]
	code_list = tolist(csv_data['CountryCode'])
	country_dict = dict(zip(name_list,code_list))
	with open("country.json", "w") as f:
		f.write(json.dumps(country_dict))


def tolist(df):
	return np.array(df).tolist()


@bp.route('/query_all')
def query_all():
	csv_data = pd.read_csv(FILENAME)
	csv_data.drop('CountryName', axis=1, inplace=True)
	csv_data.drop('SeriesName', axis=1, inplace=True)
	csv_data.dropna(how='any', inplace=True)
	return jsonify(tolist(csv_data))


@bp.route('/query_column_name')
def query_column_name():
	csv_data = pd.read_csv(FILENAME)
	column_name = csv_data.columns
	column_name = [item.split('[')[0]
				   for item in column_name if "Code" not in item]
	return jsonify(column_name)


@bp.route('/country_add', methods=('POST',))
def note_add_temp():
	if request.method == 'POST':
		form_dict = dict()
		form_dict.update({'CountryName':[request.form['CountryName']]}) # df需要保存为[]可遍历的形式
		form_dict.update({'CountryCode':[request.form['CountryCode']]})
		form_dict.update({'SeriesName':[request.form['SeriesName']]})
		form_dict.update({'SeriesCode':[request.form['SeriesCode']]})
		form_dict.update({'2010[YR2010]':[request.form['2010']]})
		form_dict.update({'2011[YR2011]':[request.form['2011']]})
		form_dict.update({'2012[YR2012]':[request.form['2012']]})
		form_dict.update({'2013[YR2013]':[request.form['2013']]})
		form_dict.update({'2014[YR2014]':[request.form['2014']]})
		df = pd.DataFrame(form_dict)
		df.to_csv(FILENAME, mode='a', header=False, na_rep=".. ", index=False)
		return jsonify([])


if __name__ == "__main__":
	extractCountryCode()
