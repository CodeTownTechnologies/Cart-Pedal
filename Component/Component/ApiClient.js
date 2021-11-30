export const BASE_URL = 'http://www.cartpedal.com/';

const add_product = 'api-product/add-product';

export async function saveProduct(productDetail) {
  let url = add_product;
  let responce = await postMultipart(url, productDetail);
  return responce;
}

export async function get(url) {
  let response;
  await fetch(BASE_URL + url)
    .then((res) => res.json())
    .then((responseJson) => {
      console.log('responseJson -> ');
      console.log(responseJson);
      response = responseJson;
    })
    .catch((error) => {
      console.error(error);
    });

  return response;
}

export async function postMultipart(url, body) {
  let responseJson;
  await fetch(BASE_URL + url, {
    method: 'Post',
    headers: new Headers({
      'Content-Type': 'multipart/form-data',
      device_id: '1111',
      device_token: '1111',
      device_type: 'android',
      Authorization: 'Bearer xriPJWJGsQT-dUgP4qH11EMM357_kEaan7zJ4Vty',
    }),
    body: body,
  })
    .then((response) => response.json())
    .then((response) => {
      responseData = response;
    })
    .catch((error) => {
      this.hideLoading();
      console.error(error);
    })
    .done();
  responseJson = responseJson.json();
  return responseJson;
}

export async function post(url, body) {
  let responseJson;
  responseJson = await fetch(BASE_URL + url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  responseJson = responseJson.json();
  return responseJson;
}

export async function postWithfile(url, photoUri) {
  let responseJson;
  const data = new FormData();
  data.append('photo', photoUri);

  let options = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    method: 'POST',
  };
  options.body = data;

  responseJson = await fetch(BASE_URL + url, options);
  responseJson = responseJson.json();

  return responseJson;
}
