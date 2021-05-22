const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const labels = JSON.parse(core.getInput('labels'));
        labels.forEach(label => {
            console.info('Label data', label);
        });

        const octokit = github.getOctokit(core.getInput('github-token'));
        const existingLabels = await getRepoLabels(octokit, github);
        console.log(existingLabels);

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        //console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function getRepoLabels(octokit, github) {
    return await octokit.rest.issues.listLabelsForRepo(github.context.repo);
}

run();