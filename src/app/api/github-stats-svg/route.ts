import { NextResponse } from "next/server"

/** Match portfolio — optional env override */
const LOGIN = process.env.GITHUB_STATS_LOGIN ?? "MSameer7-tech"

const THEMES = {
  radical: {
    bg: "#141321",
    border: "#30363d",
    title: "#fe428e",
    text: "#a9fef7",
    accent: "#f8d847",
  },
  default: {
    bg: "#fffefe",
    border: "#e4e2e2",
    title: "#2f80ed",
    text: "#434d58",
    accent: "#4c71f2",
  },
} as const

/** Same shape as github-readme-stats main fetch (reviews use default collection window). */
const STATS_QUERY = `
query userStats($login: String!) {
  user(login: $login) {
    name
    login
    followers { totalCount }
    contributionsCollection {
      totalPullRequestReviewContributions
    }
    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
      totalCount
    }
    pullRequests(first: 1) {
      totalCount
    }
    openIssues: issues(states: OPEN) {
      totalCount
    }
    closedIssues: issues(states: CLOSED) {
      totalCount
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {direction: DESC, field: STARGAZERS}) {
      nodes {
        stargazers { totalCount }
      }
    }
  }
}
`

const COMMITS_YEAR_QUERY = `
query commitsYear($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
    }
  }
}
`

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function exponential_cdf(x: number): number {
  return 1 - 2 ** -x
}

function log_normal_cdf(x: number): number {
  return x / (1 + x)
}

function calculateRank(params: {
  commits: number
  prs: number
  issues: number
  reviews: number
  stars: number
  followers: number
}): string {
  const all_commits = true
  const COMMITS_MEDIAN = all_commits ? 1000 : 250
  const COMMITS_WEIGHT = 2
  const PRS_MEDIAN = 50
  const PRS_WEIGHT = 3
  const ISSUES_MEDIAN = 25
  const ISSUES_WEIGHT = 1
  const REVIEWS_MEDIAN = 2
  const REVIEWS_WEIGHT = 1
  const STARS_MEDIAN = 50
  const STARS_WEIGHT = 4
  const FOLLOWERS_MEDIAN = 10
  const FOLLOWERS_WEIGHT = 1
  const TOTAL_WEIGHT =
    COMMITS_WEIGHT + PRS_WEIGHT + ISSUES_WEIGHT + REVIEWS_WEIGHT + STARS_WEIGHT + FOLLOWERS_WEIGHT

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100]
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"]

  const { commits, prs, issues, reviews, stars, followers } = params
  const rank =
    1 -
    (COMMITS_WEIGHT * exponential_cdf(commits / COMMITS_MEDIAN) +
      PRS_WEIGHT * exponential_cdf(prs / PRS_MEDIAN) +
      ISSUES_WEIGHT * exponential_cdf(issues / ISSUES_MEDIAN) +
      REVIEWS_WEIGHT * exponential_cdf(reviews / REVIEWS_MEDIAN) +
      STARS_WEIGHT * log_normal_cdf(stars / STARS_MEDIAN) +
      FOLLOWERS_WEIGHT * log_normal_cdf(followers / FOLLOWERS_MEDIAN)) /
      TOTAL_WEIGHT

  let idx = THRESHOLDS.findIndex(t => rank * 100 <= t)
  if (idx < 0) idx = LEVELS.length - 1
  return LEVELS[idx] ?? "C"
}

type GraphUser = {
  name: string | null
  login: string
  followers: { totalCount: number }
  contributionsCollection: {
    totalPullRequestReviewContributions: number
  }
  repositoriesContributedTo: { totalCount: number }
  pullRequests: { totalCount: number }
  openIssues: { totalCount: number }
  closedIssues: { totalCount: number }
  repositories: { nodes: { stargazers: { totalCount: number } }[] }
}

async function graphqlRequest<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  })
  return res.json() as Promise<T>
}

async function fetchCommitsLifetime(login: string, token: string): Promise<number> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-react-stats",
    Authorization: `Bearer ${token}`,
  }
  const userRes = await fetch(`https://api.github.com/users/${login}`, {
    headers,
    next: { revalidate: 3600 },
  })
  if (!userRes.ok) return 0
  const user = (await userRes.json()) as { created_at: string }
  const startYear = new Date(user.created_at).getFullYear()
  const endYear = new Date().getFullYear()

  let sum = 0
  for (let y = startYear; y <= endYear; y++) {
    const from = `${y}-01-01T00:00:00Z`
    const to = y === endYear ? new Date().toISOString() : `${y}-12-31T23:59:59Z`
    const json = await graphqlRequest<{
      data?: { user?: { contributionsCollection?: { totalCommitContributions?: number } } }
      errors?: unknown
    }>(token, COMMITS_YEAR_QUERY, { login, from, to })
    if (json.errors) continue
    sum += json.data?.user?.contributionsCollection?.totalCommitContributions ?? 0
  }
  return sum
}

async function fetchGraphqlUser(login: string, token: string): Promise<GraphUser | null> {
  const json = await graphqlRequest<{ data?: { user: GraphUser | null }; errors?: unknown }>(
    token,
    STATS_QUERY,
    { login }
  )
  if (json.errors || !json.data?.user) return null
  return json.data.user
}

async function fetchRestSummary(login: string): Promise<{
  displayName: string
  login: string
  followers: number
  stars: number
  publicRepos: number
}> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-react-stats",
  }
  const userRes = await fetch(`https://api.github.com/users/${login}`, {
    headers,
    next: { revalidate: 3600 },
  })
  if (!userRes.ok) throw new Error("github user")
  const user = (await userRes.json()) as {
    login: string
    name: string | null
    followers: number
    public_repos: number
  }
  let stars = 0
  for (let page = 1; page <= 10; page++) {
    const r = await fetch(
      `https://api.github.com/users/${login}/repos?per_page=100&page=${page}&affiliation=owner`,
      { headers, next: { revalidate: 3600 } }
    )
    const repos = (await r.json()) as { stargazers_count: number }[] | { message?: string }
    if (!Array.isArray(repos) || repos.length === 0) break
    stars += repos.reduce((acc, repo) => acc + repo.stargazers_count, 0)
  }
  return {
    displayName: user.name ?? user.login,
    login: user.login,
    followers: user.followers,
    stars,
    publicRepos: user.public_repos,
  }
}

function renderCard(opts: {
  theme: keyof typeof THEMES
  titleLine: string
  rows: { label: string; value: string | number }[]
  rankLetter?: string
}): string {
  const palette = THEMES[opts.theme]
  const w = 495
  const h = opts.rankLetter ? 195 : 155
  const rowStartY = 52
  const rowGap = 22

  const rowsSvg = opts.rows
    .map(
      (row, i) => `
    <text x="35" y="${rowStartY + i * rowGap}" fill="${palette.accent}" font-size="13" font-family="Segoe UI, Ubuntu, Helvetica, sans-serif" font-weight="600">${escapeXml(row.label)}</text>
    <text x="280" y="${rowStartY + i * rowGap}" fill="${palette.text}" font-size="13" font-family="Segoe UI, Ubuntu, Helvetica, sans-serif" font-weight="600">${escapeXml(String(row.value))}</text>`
    )
    .join("")

  const rankSvg = opts.rankLetter
    ? `
    <circle cx="405" cy="98" r="38" fill="none" stroke="${palette.title}" stroke-width="3"/>
    <text x="405" y="108" text-anchor="middle" fill="${palette.title}" font-size="28" font-family="Segoe UI, Ubuntu, Helvetica, sans-serif" font-weight="700">${escapeXml(opts.rankLetter)}</text>`
    : ""

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(opts.titleLine)}">
  <title>${escapeXml(opts.titleLine)}</title>
  <rect x="0.5" y="0.5" rx="4.5" width="${w - 1}" height="${h - 1}" fill="${palette.bg}" stroke="${palette.border}"/>
  <text x="25" y="32" fill="${palette.title}" font-size="15" font-family="Segoe UI, Ubuntu, Helvetica, sans-serif" font-weight="700">${escapeXml(opts.titleLine)}</text>
  ${rowsSvg}
  ${rankSvg}
</svg>`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const themeParam = searchParams.get("theme") ?? "radical"
  const theme = themeParam === "default" ? "default" : "radical"

  const token = process.env.GITHUB_TOKEN

  try {
    if (token) {
      const user = await fetchGraphqlUser(LOGIN, token)
      if (user) {
        const commits = await fetchCommitsLifetime(LOGIN, token)
        const stars = user.repositories.nodes.reduce((s, n) => s + n.stargazers.totalCount, 0)

        const prs = user.pullRequests.totalCount
        const issues = user.openIssues.totalCount + user.closedIssues.totalCount
        const reviews = user.contributionsCollection.totalPullRequestReviewContributions
        const contributedTo = user.repositoriesContributedTo.totalCount
        const followers = user.followers.totalCount

        const rankLetter = calculateRank({ commits, prs, issues, reviews, stars, followers })
        const display = user.name ?? user.login
        const svg = renderCard({
          theme,
          titleLine: `${display}'s GitHub Stats`,
          rows: [
            { label: "Total Stars Earned:", value: stars },
            { label: "Total Commits:", value: commits },
            { label: "Total PRs:", value: prs },
            { label: "Total Issues:", value: issues },
            { label: "Contributed to:", value: contributedTo },
          ],
          rankLetter,
        })

        return new NextResponse(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        })
      }
    }

    const rest = await fetchRestSummary(LOGIN)
    const svg = renderCard({
      theme,
      titleLine: `${rest.displayName}'s GitHub Stats`,
      rows: [
        { label: "Total Stars Earned:", value: rest.stars },
        { label: "Followers:", value: rest.followers },
        { label: "Public Repos:", value: rest.publicRepos },
      ],
    })

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    })
  } catch {
    const palette = THEMES[theme]
    const msg = `Could not load GitHub data for ${LOGIN}`
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="495" height="90" viewBox="0 0 495 90" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" rx="4.5" width="494" height="89" fill="${palette.bg}" stroke="${palette.border}"/>
  <text x="248" y="42" text-anchor="middle" fill="${palette.title}" font-size="14" font-family="Segoe UI, Ubuntu, sans-serif">${escapeXml(msg)}</text>
  <text x="248" y="64" text-anchor="middle" fill="${palette.text}" font-size="12" font-family="Segoe UI, Ubuntu, sans-serif">Verify GITHUB_STATS_LOGIN or API limits.</text>
</svg>`
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=120",
      },
    })
  }
}
