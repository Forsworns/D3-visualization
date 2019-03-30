let serie_map = {
    'NY.GDP.MKTP.KD.ZG': 'GDP growth (annual %)',
    'NY.GDP.MKTP.CD': 'GDP (current US$)',
    'IT.NET.USER.P2': 'Internet users (per 100 people)',
    'SP.RUR.TOTL': 'Rural population',
    'SP.POP.TOTL.FE.ZS': 'Population, female (% of total)',
    'SP.POP.GROW': 'Population growth (annual %)',
    'SP.POP.TOTL': 'Population, total',
    'NY.GDP.PCAP.KD.ZG': 'GDP per capita growth (annual %)',
    'NY.GDP.PCAP.CD': 'GDP per capita (current US$)',
    'SL.TLF.TOTL.IN': 'Labor force, total',
    'SL.TLF.TOTL.FE.ZS': 'Labor force, female (% of total labor force)',
    'MS.MIL.TOTL.TF.ZS': 'Armed forces personnel (% of total labor force)',
    'AG.SRF.TOTL.K2': 'Surface area (sq. km)',
    'EN.POP.DNST': 'Population density (people per sq. km of land area)',
    'AG.LND.ARBL.ZS': 'Arable land (% of land area)',
    'SL.UEM.TOTL.ZS': 'Unemployment, total (% of total labor force) (modeled ILO estimate)',
    'SL.UEM.TOTL.FE.ZS': 'Unemployment, female (% of female labor force) (modeled ILO estimate)',
    '.. ': '数据缺失'
}

let serie_map_inv = {}
// 因为确定是唯一的键值关系，所以直接构造反向map
Object.entries(serie_map).forEach(e => Object.assign(serie_map_inv, serie_map_inv, { [e[1]]: e[0] }))

let country_map_inv = { "China": "CHN", "Bhutan": "BTN", "Timor-Leste": "TMP", "Taiwan- China": "TWN", "Macao SAR- China": "MAC", "Hong Kong SAR- China": "HKG", "Central African Republic": "CAF", "Denmark": "DNK", "Ukraine": "UKR", "Uzbekistan": "UZB", "Uganda": "UGA", "Uruguay": "URY", "Chad": "TCD", "Yemen- Rep.": "YEM", "Armenia": "ARM", "Israel": "ISR", "Iraq": "IRQ", "Iran- Islamic Rep.": "IRN", "Belize": "BLZ", "Cabo Verde": "CPV", "Russian Federation": "RUS", "Bulgaria": "BGR", "Croatia": "HRV", "Guam": "GUM", "Gambia- The": "GMB", "Iceland": "ISL", "Guinea": "GIN", "Guinea-Bissau": "GNB", "Liechtenstein": "LIE", "Congo- Rep.": "COG", "Congo- Dem. Rep.": "ZAR", "Libya": "LBY", "Liberia": "LBR", "Canada": "CAN", "Ghana": "GHA", "Gabon": "GAB", "Hungary": "HUN", "Northern Mariana Islands": "MNP", "South Sudan": "SSD", "South Africa": "ZAF", "Botswana": "BWA", "Qatar": "QAT", "Rwanda": "RWA", "Luxembourg": "LUX", "India": "IND", "Indonesia": "IDN", "Guatemala": "GTM", "Ecuador": "ECU", "Eritrea": "ERI", "Cuba": "CUB", "Kyrgyz Republic": "KGZ", "Djibouti": "DJI", "Kazakhstan": "KAZ", "Colombia": "COL", "Costa Rica": "CRI", "Cameroon": "CMR", "Tuvalu": "TUV", "Turkmenistan": "TKM", "Turkey": "TUR", "St. Lucia": "LCA", "St. Kitts and Nevis": "KNA", "Sao Tome and Principe": "STP", "St. Vincent and the Grenadines": "VCT", "St. Martin (French part)": "MAF", "Sint Maarten (Dutch part)": "SXM", "San Marino": "SMR", "Guyana": "GUY", "Tanzania": "TZA", "Ethiopia": "ETH", "Kiribati": "KIR", "Tajikistan": "TJK", "Senegal": "SEN", "Serbia": "SRB", "Sierra Leone": "SLE", "Cyprus": "CYP", "Seychelles": "SYC", "Mexico": "MEX", "Togo": "TGO", "Dominica": "DMA", "Dominican Republic": "DOM", "South Korea": "KOR", "Austria": "AUT", "Venezuela- RB": "VEN", "Bangladesh": "BGD", "Angola": "AGO", "Antigua and Barbuda": "ATG", "Andorra": "ADO", "Micronesia- Fed. Sts.": "FSM", "Nicaragua": "NIC", "Nigeria": "NGA", "Niger": "NER", "Nepal": "NPL", "Bahamas- The": "BHS", "Pakistan": "PAK", "Barbados": "BRB", "Papua New Guinea": "PNG", "Paraguay": "PRY", "Panama": "PAN", "Bahrain": "BHR", "Brazil": "BRA", "Burkina Faso": "BFA", "Burundi": "BDI", "Greece": "GRC", "Palau": "PLW", "Curacao": "CUW", "Cayman Islands": "CYM", "Germany": "DEU", "Italy": "ITA", "Solomon Islands": "SLB", "Latvia": "LVA", "Norway": "NOR", "Czech Republic": "CZE", "Moldova": "MDA", "Morocco": "MAR", "Monaco": "MCO", "Brunei Darussalam": "BRN", "Fiji": "FJI", "Swaziland": "SWZ", "Slovak Republic": "SVK", "Slovenia": "SVN", "Sri Lanka": "LKA", "Singapore": "SGP", "New Caledonia": "NCL", "New Zealand": "NZL", "Japan": "JPN", "Chile": "CHL", "North Korea": "PRK", "Cambodia": "KHM", "Grenada": "GRD", "Greenland": "GRL", "Georgia": "GEO", "Belgium": "BEL", "Mauritania": "MRT", "Mauritius": "MUS", "Tonga": "TON", "Saudi Arabia": "SAU", "France": "FRA", "French Polynesia": "PYF", "Faeroe Islands": "FRO", "Poland": "POL", "Puerto Rico": "PRI", "Bosnia and Herzegovina": "BIH", "Thailand": "THA", "Zimbabwe": "ZWE", "Honduras": "HND", "Haiti": "HTI", "Channel Islands": "CHI", "Australia": "AUS", "Ireland": "IRL", "Estonia": "EST", "Jamaica": "JAM", "Turks and Caicos Islands": "TCA", "Trinidad and Tobago": "TTO", "Bolivia": "BOL", "Sweden": "SWE", "Switzerland": "CHE", "Vanuatu": "VUT", "Belarus": "BLR", "Bermuda": "BMU", "Kuwait": "KWT", "Comoros": "COM", "Cote d'Ivoire": "CIV", "Kosovo": "KSV", "Peru": "PER", "Tunisia": "TUN", "Lithuania": "LTU", "Somalia": "SOM", "Jordan": "JOR", "West Bank and Gaza": "WBG", "Namibia": "NAM", "Myanmar": "MMR", "Romania": "ROM", "United States of America": "USA", "Virgin Islands (U.S.)": "VIR", "American Samoa": "ASM", "Lao PDR": "LAO", "Kenya": "KEN", "Finland": "FIN", "Sudan": "SDN", "Suriname": "SUR", "United Kingdom": "GBR", "Netherlands": "NLD", "Mozambique": "MOZ", "Lesotho": "LSO", "Philippines": "PHL", "El Salvador": "SLV", "Samoa": "WSM", "Portugal": "PRT", "Mongolia": "MNG", "Spain": "ESP", "Benin": "BEN", "Zambia": "ZMB", "Equatorial Guinea": "GNQ", "Vietnam": "VNM", "Azerbaijan": "AZE", "Afghanistan": "AFG", "Algeria": "DZA", "Albania": "ALB", "Syrian Arab Republic": "SYR", "Egypt- Arab Rep.": "EGY", "United Arab Emirates": "ARE", "Oman": "OMN", "Argentina": "ARG", "Aruba": "ABW", "Macedonia- FYR": "MKD", "Maldives": "MDV", "Isle of Man": "IMY", "Malawi": "MWI", "Malaysia": "MYS", "Marshall Islands": "MHL", "Malta": "MLT", "Madagascar": "MDG", "Mali": "MLI", "Lebanon": "LBN", "Montenegro": "MNE" }

let country_map = {}
Object.entries(country_map_inv).forEach(e => Object.assign(country_map, country_map, { [e[1]]: e[0] }))

export { serie_map, serie_map_inv, country_map, country_map_inv }