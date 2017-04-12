// Copyright 2016 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const url = require('url');
const request = require('axios');

class FacebookGraph {
  constructor(accessToken, version = '2.7') {
    this.accessToken = accessToken;
    this.version = version;
  }

  async fetch(id, type, size = 10) {
    const requestPath = `${id}/${type}`;

    let result = await this.get(requestPath, { limit: 2 })
    let entities = result.data;
    let counter = entities.length;

    while (result.next && counter < size) {
      result = await this.get(result.next.path, { limit: 2 })
      entities.push(...result.data);
    }

    return entities.slice(0, size);
  }

  async get(requestPath, parameters) {
    let params = Object.assign({ access_token: this.accessToken }, parameters);

    const options = {
      url: `https://graph.facebook.com/${requestPath}`,
      params,
      headers: { 'User-Agent': 'Facebook Graph Client' }
    }

    let result;
    try {
      const response = await request(options);
      result = response.data;

      if (result.paging.next) {
        result.next = url.parse(result.paging.next);
      }
      if (result.paging.previous) {
        result.previous = url.parse(result.paging.previous);
      }
    } catch (error) {
      console.log(error.message);
    }

    return result;
  }
}

module.exports = FacebookGraph;
