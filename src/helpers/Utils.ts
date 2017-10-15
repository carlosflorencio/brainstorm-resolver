import * as request from 'request'

/**
 * Sleep
 *
 * @param ms
 * @returns {Promise<any>}
 */
export const sleep = function(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get random int between two values
 * Minimum and maximum are inclusive
 *
 * @param min inclusive
 * @param max inclusive
 * @returns {*}
 */
export const random = function(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  //The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Request response to promise
 *
 * @param options
 * @returns {Promise<any>}
 */
export const requestPromise = function(options): Promise<any> {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return reject(error ? error.message : new Error(response.statusCode))
      }

      return resolve(body)
    })
  })
}
