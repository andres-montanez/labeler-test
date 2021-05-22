const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        // Get current exiting labels from the repository
        const octokit = github.getOctokit(core.getInput('github-token'));
        let existingLabels = await getRepoLabels(octokit, github);
        console.log(existingLabels);

        // Labels to be set on the repository
        const configuredLabels = JSON.parse(core.getInput('labels'));
        configuredLabels.forEach(label => {
            if (existingLabels[label.name]) {
                if (
                    existingLabels[label.name].color !== label.color ||
                    existingLabels[label.name].description !== label.description
                ) {
                    console.log(`Updating label ${label.name}`);
                    let response = updateLabel(octokit, github, label);
                }
                delete existingLabels[label.name];
            } else {
                console.log(`Creating label ${label.name}`);
                let response = createLabel(octokit, github, label);
            }
        });

        // Remove not configured labels
        Object.keys(existingLabels).forEach(label => {
            console.log(`Deleting label ${label}`);
            let response = deleteLabel(octokit, github, label);
        });

        // Get the JSON webhook payload for the event that triggered the workflow
        //const payload = JSON.stringify(github.context.payload, undefined, 2)
        //console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function getRepoLabels(octokit, github) {
    let response = await octokit.rest.issues.listLabelsForRepo(github.context.repo);
    let labels = {};
    response.data.forEach(label => {
        labels[label.name] = {
            name: label.name,
            color: label.color,
            description: label.description
        };
    });

    return labels;
}

async function updateLabel(octokit, github, label) {
    let payload = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: label.name,
        color: label.color,
        description: label.description || ''
    };

    return await octokit.rest.issues.updateLabel(payload);
}

async function createLabel(octokit, github, label) {
    let payload = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: label.name,
        color: label.color,
        description: label.description || ''
    };

    return await octokit.rest.issues.createLabel(payload);
}

async function deleteLabel(octokit, github, label) {
    let payload = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: label
    };

    return await octokit.rest.issues.deleteLabel(payload);
}

run();