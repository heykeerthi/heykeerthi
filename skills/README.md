# Marketing Skills for Claude

Claude Code skills I built to automate the repetitive parts of marketing work,
so more time goes to the parts that need taste.

| Skill | What it does |
|---|---|
| [`launch-video-producer`](./launch-video-producer/SKILL.md) | Turns a product launch brief into a complete short-form video package — script, storyboard, paste-ready AI-video generation prompts, per-platform cutdowns, and captions. |
| [`brand-canvas`](./brand-canvas/SKILL.md) | Captures any brand's visual identity as a design-token file, then generates consistently on-brand creative (social graphics, banners, OG images, slides) against it. |

## Using a skill

Drop a skill folder into `.claude/skills/` in your project (or `~/.claude/skills/`
for global use), then invoke it in Claude Code by name — or just describe the
task and let Claude route to it.

```
/launch-video-producer we're announcing Bitcoin Earn next Tuesday, here's the brief…
```

Both skills follow the same philosophy: the deliverable is something you can
ship today, not a plan for one.
