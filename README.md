
# MockMirror

### Automated AI Previews for React Pull Requests 

MockMirror is a GitHub Action that automatically detects changed React components in a Pull Request, uses Google Gemini AI to generate realistic mock data and environment wrappers (like react-router), and deploys a live preview dashboard.

## Features

  * **Smart Analysis:** Automatically analyzes your component code to generate realistic JSON props (names, dates, images).
  * **Context Aware:** Detects if your component needs a Router, Redux, or specific context providers and wraps them automatically to prevent crashes.
  * **Zero Config:** No manual "stories" or configuration files required. Just add your API key.
  * **Multi-File Dashboard:** Generates a central dashboard listing every component changed in the Pull Request.

## Quick Start

### 1. Get a Gemini API Key

1.  Go to Google AI Studio (It's free). 
2.  Click "Get API Key". 
3.  Copy the key. 

### 2. Add Secrets to Your Repo 

1.  Go to your Repository Settings \> Secrets and variables \> Actions. 
2.  Click New repository secret. 
3.  **Name:** `GEMINI_API_KEY` 
4.  **Value:** Paste your key. 

### 3. Create the Workflow

Create a file in your repository at `.github/workflows/mockmirror.yml`: 

```yaml
name: MockMirror Preview
on:
  pull_request:
    types: [opened, synchronize, reopened]
permissions:
  contents: write
  pull-requests: write
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Important for detecting changes
      - name: Run MockMirror
        # Note: Replace your-username/ai-previewer with your actual repository name
        uses: your-username/ai-previewer@v1.0.0
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```



## Inputs

| Input | Description | Required |
| :--- | :--- | :--- |
| `gemini_api_key` | Your Google Gemini API Key. | Yes | 
| `github_token` | Automatically provided by GitHub. Used to post the comment. | Yes |

## How it Works 

1.  **Scan:** The Action scans your PR for modified `.jsx` or `.tsx` files. 
2.  **Analyze:** It sends the code to Google Gemini to understand the props and context requirements. 
3.  **Build:** It uses Vite to build a secure, isolated preview site. 
4.  **Deploy:** It pushes the site to a `gh-pages` branch on your repo. 
5.  **Comment:** It posts a link to the live preview dashboard on your Pull Request.
