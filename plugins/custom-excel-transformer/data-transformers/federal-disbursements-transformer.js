'use strict'
/**
 *
 * This takes the input of the disbursements spreadsheet and transforms the data to
 * application friendly graphql node. This will allow the app to easily filter, sort and
 * group the data using graphql queries and have it ready to be displayed on our site.
 *
 **/

/* Use ES5 require in order to be compatible with version 1.x of gatsby */

const CONSTANTS = require('../../../src/js/constants')

const DISBURSEMENT_TO_STATE = 'Disbursements to the state'

/* Define the column names found in the excel file */
const SOURCE_COLUMNS = {
  Year: 'Fiscal Year',
  Fund: 'Fund Type',
  OnshoreOffshore: 'Onshore/Offshore',
  Total: ' Total ',
  USState: 'State',
  County: 'County',
  CalendarYear: 'Calendar Year',
  FiscalYear: 'Fiscal Year',
  Month: 'Month',
  Commodity: 'Commodity',
  Category: 'Category',
  Disbursement: 'Disbursement',
  Disbursement_Type: 'Disbursement Type'
}

const FUND_TO_DISBURSEMENTS_CATEGORY = {
  'American Indian Tribes': CONSTANTS.NATIVE_AMERICAN,
}

const ONSHOREOFFSHORE_TO_DISBURSEMENTS_CATEGORY = {
  'onshore & offshore': CONSTANTS.FEDERAL_ONSHORE,
  'offshore': CONSTANTS.FEDERAL_OFFSHORE,
  'onshore': CONSTANTS.FEDERAL_ONSHORE,
  'gomesa': CONSTANTS.FEDERAL_OFFSHORE,
  '8(g)': CONSTANTS.FEDERAL_OFFSHORE,
}

/* Use ES5 exports in order to be compatible with version 1.x of gatsby */
module.exports = (node, type) => {
  return createDisbursementsNode(node, type)
}
const createDisbursementsNode = (disbursementsData, type) => {
  let fund = disbursementsData[SOURCE_COLUMNS.Fund]
  let source = disbursementsData[SOURCE_COLUMNS.OnshoreOffshore]
  if (fund.toLowerCase().includes('gomesa')) {
    let result = fund.split(/([^-]+)/)
    fund = result[1].trim()
    source = 'GOMESA'
  }
  else if (fund.includes('8(g)')) {
    fund = 'State'
    source = '8(g)'
  }

  let totalProp = Object.keys(disbursementsData).filter(prop => prop.trim().includes(SOURCE_COLUMNS.Total.trim()))
  let disbursementValue = disbursementsData[totalProp] || disbursementsData[SOURCE_COLUMNS.Disbursement]

  let disbursementNode = {
	  Year: disbursementsData[SOURCE_COLUMNS.Year],
    DisplayYear: (disbursementsData[SOURCE_COLUMNS.Year])
      ? "'" + disbursementsData[SOURCE_COLUMNS.Year].toString().substr(2) : "'" + disbursementsData[SOURCE_COLUMNS.CalendarYear].toString().substr(2),
	  Fund: fund,
	  Source: source,
	  Disbursement: disbursementValue,
	  USState: disbursementsData[SOURCE_COLUMNS.USState],
	  County: disbursementsData[SOURCE_COLUMNS.County],
    CalendarYear: disbursementsData[SOURCE_COLUMNS.CalendarYear],
    FiscalYear: disbursementsData[SOURCE_COLUMNS.FiscalYear],
	  Month: disbursementsData[SOURCE_COLUMNS.Month],
	  Commodity: disbursementsData[SOURCE_COLUMNS.Commodity],
	  Category: disbursementsData[SOURCE_COLUMNS.Category],
	  Disbursement_Type: disbursementsData[SOURCE_COLUMNS.Disbursement_Type],
	  internal: {
	    type: type,
	  },
  }





    let year = disbursementNode.CalendarYear || disbursementNode.FiscalYear
  let month = (disbursementNode.Month) ? getMonthFromString(disbursementNode.Month) : 0

  disbursementNode.DisbursementDate = new Date(year, month, 15)
   if (disbursementNode.FiscalYear === undefined) {
    disbursementNode.FiscalYear = (disbursementNode.DisbursementDate.getMonth() >= 9)
      ? (disbursementNode.DisbursementDate.getYear() + 1901).toString()
      : (disbursementNode.DisbursementDate.getYear() + 1900).toString()
  }
 
  disbursementNode.DisbursementCategory = FUND_TO_DISBURSEMENTS_CATEGORY[disbursementNode.Fund]
  if (!disbursementNode.DisbursementCategory) {
    disbursementNode.DisbursementCategory = disbursementNode.Source && ONSHOREOFFSHORE_TO_DISBURSEMENTS_CATEGORY[disbursementNode.Source.toLowerCase()]
  }

  if (['GOMESA', '8(g)'].includes(disbursementNode.Source)) {
    disbursementNode.County = disbursementNode.County || DISBURSEMENT_TO_STATE
  }

  if (typeof disbursementNode.Disbursement !== 'number') {
    disbursementNode.Disbursement = 0
  }

  return disbursementNode
}

function toTitleCase (str) {
  str = str.toLowerCase().split(' ')
  for (let i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1)
  }
  return str.join(' ')
}

function getMonthFromString (month) {
  let d = Date.parse(month + '1, 2012')
  if (!isNaN(d)) {
    return new Date(d).getMonth()
  }
  return -1
}
