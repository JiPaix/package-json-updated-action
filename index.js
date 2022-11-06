const { setOutput, setFailed } = require('@actions/core');
const { getOctokit, context } = require('@actions/github');

/**
 * 
 * @param {*} ref 
 * @param {ReturnType<import('@actions/github').getOctokit>} octokit 
 * @returns 
 */
const getPackageJson = async (ref, octokit) => {
    const packageJSONData = (await octokit.request({
        ...context.repo,
        path: process.env['INPUT_PATH'] || 'package.json',
        ref,
    })).data.content;
    if (!packageJSONData) {
        throw new Error(`Could not find package.json for commit ${ref}`);
    }
    return JSON.parse(Buffer.from(packageJSONData, 'base64').toString());
};

const run = async () => {
    const token = process.env['GITHUB_TOKEN'];
    if (!token) {
        throw new Error('GITHUB_TOKEN not provided');
    }

    const octokit = getOctokit(token);
    const currentRef = context.sha;
    const previousRef = ((await octokit.rest.repos.getCommit({
        ...context.repo,
        ref: currentRef,
    })).data.parents[0] || {}).sha;

    const currentPackageJSON = await getPackageJson(currentRef, octokit);
    setOutput('current-package-version', currentPackageJSON.version);

    console.log('HAS UPDATED? ', currentPackageJSON.version !== previousPackageJSON.version)

    if (!previousRef) {
        setOutput('has-updated', true);
        return;
    }

    const previousPackageJSON = await getPackageJson(previousRef, octokit);
    setOutput('has-updated', currentPackageJSON.version !== previousPackageJSON.version);
}

run().catch(error => {
    setFailed(error.message);
});