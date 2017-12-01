import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const isPrimaryColor = color => ['red', 'blue', 'yellow'].indexOf(color) !== -1;
const createReqUri = (idx, colors) => {
  const uri = new URI(window.path)
    .addQuery('limit', '11')
    .addQuery('offset', idx);
  if (colors) uri.addQuery('color[]', colors);
  return uri;
};

const retrieve = (options = {}) => {
  const {colors, page = 1} = options;
  const index = (page - 1) * 10;
  const result = {ids: [], open: [], closedPrimaryCount: 0};

  return fetch(createReqUri(index, colors))
    .then(res => res.json())
    .then(data => {
      const nextPageItem = data.splice(10, 1);
      result.previousPage = page - 1 || null;
      result.nextPage = data.length && nextPageItem.length ? page + 1 : null;

      data.forEach(item => {
        result.ids.push(item.id);
        item.isPrimary = isPrimaryColor(item.color);
        if (item.disposition === 'open'){
          result.open.push(item);
        } else if (item.isPrimary){
          result.closedPrimaryCount++;
        }
      });
      return result;
    })
    .catch(err => console.log('Fetch Request Failed', err));
};

export default retrieve;
