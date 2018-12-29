const {spawnSync} = require('child_process');
const log = require('debug')('app:youtube');

class Youtube {

    static async get_meta(url) {
        try {
            const {status, stdout: result, stderr: error} = spawnSync('youtube-dl', ['-j', url], {encoding: 'utf8'});

            log('status=%s', status);
            log('error=%s', error);
            log('result length=%s', result.length);

            return Youtube.handleResponse(result, error, status);
        } catch (error) {
            log('ERROR: %o', error);
            return Youtube.handleResponse(null, error.code, error.message);
        }
    }

    static handleResponse(response, error, code) {
        if (code) {
            return {
                result: null,
                error: {
                    code,
                    message: error
                }
            };
        }

        const meta = JSON.parse(response);

        return {
            result: {
                id: meta.id,
                title: meta.fulltitle || meta.title,
                filename: meta._filename,
                thumbnail: meta.thumbnail,
                upload_date: meta.upload_date,
                uploader: meta.uploader,
                webpage_url: meta.webpage_url
            },
            error: null
        };
    }
}

module.exports = Youtube;
