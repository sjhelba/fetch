import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const isPrimaryColor = color => ['red', 'blue', 'yellow'].indexOf(color) !== -1;
const createReqUri = (limit, idx, colors) => {
  const uri = new URI(window.path)
    .addQuery('limit', limit)
    .addQuery('offset', idx);
  if (colors) uri.addQuery('color[]', colors);
  return uri;
};

const retrieve = (options = {}) => {
  const {colors, page = 1} = options;
  const index = (page - 1) * 10;
  const result = {ids: [], open: [], closedPrimaryCount: 0};

  return fetch(createReqUri(10, index, colors))
    .then(res => res.json())
    .then(data => {
      result.previousPage = page - 1 || null;

      data.forEach((item) => {
        result.ids.push(item.id);
        item.isPrimary = isPrimaryColor(item.color);
        if (item.disposition === 'open'){
          result.open.push(item);
        } else if (item.isPrimary){
          result.closedPrimaryCount++;
        }
      });

      return createReqUri(1, index + 10);
    })
    .then(nextPageUri => fetch(nextPageUri))
    .then(res => res.json())
    .then(nextPgItem => {
      result.nextPage = result.ids.length && nextPgItem.length ? page + 1 : null;
      return result;
    })
    .catch(err => console.log('Fetch Request Failed', err));
};


export default retrieve;
