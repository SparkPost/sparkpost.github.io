const algoliasearch = require('algoliasearch');
const chunk = require('lodash.chunk');

/**
 * give back the same thing as this was called with.
 *
 * @param {any} obj what to keep the same
 */
const identity = obj => obj;

exports.onPostBuild = function(
  { graphql },
  { appId, apiKey, queries, indexName: mainIndexName, chunkSize = 1000 }
) {
  const client = algoliasearch(appId, apiKey);

  const jobs = queries.map(async function doQuery({
    indexName = mainIndexName,
    query,
    transformer = identity,
  }) {
    const index = client.initIndex(indexName);
    const tmpIndex = client.initIndex(`${indexName}_tmp`);

    await scopedCopyIndex(client, index, tmpIndex);

    const result = await graphql(query);
    const objects = transformer(result);
    const chunks = chunk(objects, chunkSize);

    const chunkJobs = chunks.map(async function(chunked) {
      const { taskID } = await tmpIndex.addObjects(chunked);
      return tmpIndex.waitTask(taskID);
    });

    await Promise.all(chunkJobs);

    return moveIndex(client, tmpIndex, index);
  });

  return Promise.all(jobs);
};


/**
 * Copy the settings, synonyms, and rules of the source index to the target index
 * @param client
 * @param sourceIndex
 * @param targetIndex
 * @return {Promise}
 */
async function scopedCopyIndex(client, sourceIndex, targetIndex) {
  const { taskID } = await client.copyIndex(sourceIndex.indexName, targetIndex.indexName, [ 'settings', 'synonyms', 'rules' ]);
  return targetIndex.waitTask(taskID);
}

/**
 * moves the source index to the target index
 * @param client
 * @param sourceIndex
 * @param targetIndex
 * @return {Promise}
 */
async function moveIndex(client, sourceIndex, targetIndex) {
  const { taskID } = await client.moveIndex(sourceIndex.indexName, targetIndex.indexName)
  return targetIndex.waitTask(taskID);
}