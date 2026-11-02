# skills

Agent skills for building interfaces that feel designed, not generated. They work with Claude Code, Codex and any agent that supports the open [Agent Skills](https://agentskills.io/specification) format.

## Install

All skills (you choose which ones during install):

```bash
npx skills add rezianislami/skills
```

A single skill:

```bash
npx skills add rezianislami/skills --skill wow-moments
```

Or copy a folder from `skills/` into your agent's skills directory (`~/.claude/skills/` for Claude Code, `~/.agents/skills/` for Codex).

## Skills

| Skill | What it does |
|---|---|
| [wow-moments](skills/wow-moments) | Finds the few places in a built React / Next.js frontend that deserve a memorable animation, lets you pick from a ranked menu, then implements and verifies only the ones you chose. |

## Repository layout

```
skills/<name>/      # one folder per skill: SKILL.md, references/, README.md
examples/<name>/    # test fixtures per skill (not installed with the skill)
```

## License

[MIT](LICENSE)
