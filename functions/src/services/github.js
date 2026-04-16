const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

function getOctokit() {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

/**
 * Save or update a file in the GitHub repository.
 */
async function saveFileToGitHub(path, content, message) {
  const octokit = getOctokit();

  let sha;
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      ref: GITHUB_BRANCH,
    });
    sha = data.sha;
  } catch (err) {
    if (err.status !== 404) throw err;
    // File doesn't exist yet - that's OK
  }

  const contentBase64 = Buffer.from(JSON.stringify(content, null, 2), 'utf8').toString('base64');

  await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    content: contentBase64,
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  });
}

/**
 * Delete a file from the GitHub repository.
 */
async function deleteFileFromGitHub(path, message) {
  const octokit = getOctokit();

  let sha;
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      ref: GITHUB_BRANCH,
    });
    sha = data.sha;
  } catch (err) {
    if (err.status === 404) return; // already gone
    throw err;
  }

  await octokit.repos.deleteFile({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    sha,
    branch: GITHUB_BRANCH,
  });
}

module.exports = { saveFileToGitHub, deleteFileFromGitHub };
