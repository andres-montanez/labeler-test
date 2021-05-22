const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const labels = JSON.parse(core.getInput('labels'));
    console.log(`Labels`, labels);
    labels.forEach(label => {
        console.log(`Labels`, label);
    });

    const octokit = github.getOctokit(core.getInput('github-token'));
    const existingLabels = await octokit.paginate(octokit.issues.listLabelsForRepo, {
        ...github.context.repo
    }).map(label => {
        return {
            name: label.name,
            color: label.color,
            description: label.description || ''
        };
    });
    console.log(existingLabels);

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}