const axios = require('axios');

const ddiApi = 'https://app.drawdraw.ink/api'
//const ddiApi = 'http://localhost:3000/api'

let requestCount = 0

function incrementRequestCount () {
  requestCount++;
  console.log('requestCount', requestCount)
}

async function doUserFlow () {
  try {
    // get comics
    const {data: {comics}} = await axios.get(`${ddiApi}/comics`);
    incrementRequestCount();
    
    comics.forEach(async comic => {
      console.log('comic', comic)
      const {updated_at, url_id} = comic;

      const {data: {cells}} = await axios.get(`${ddiApi}/comic/${url_id}`);
      incrementRequestCount();
      console.log('cells', cells);

      const {data: cellData} = await axios.get(`${ddiApi}/cell/${cells[0].urlId}`);
      incrementRequestCount();
      console.log('cellData', cellData)

      const {data} = await axios.get(`${ddiApi}/comics/latest?latestUpdatedAt=${comic.updated_at}`);
      incrementRequestCount();
      console.log('data', data)
    })

    // when out of comics, grab the next page and repeat
    console.log('done')
  }
  catch(error) {
    console.error(error)
  }
}

async function userLoop () {
  while(true) {
    await doUserFlow();
  }
}

userLoop();